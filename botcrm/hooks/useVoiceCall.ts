
import { useState, useRef, useCallback, useEffect } from 'react';
import { Message, Role, CallStatus } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';
import { ai } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, CloseEvent, ErrorEvent } from '@google/genai';

// --- Type Definitions for Web APIs ---
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

// --- Audio Encoding/Decoding Helpers ---
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodePcmAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createPcmBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

// --- Main Hook ---
export const useVoiceCall = () => {
    const [conversation, setConversation] = useState<Message[]>([]);
    const [status, setStatus] = useState<CallStatus>(CallStatus.Inactive);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [isCallActive, setIsCallActive] = useState(false);

    // Refs for managing Web Audio and Live session
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    
    // Refs for managing state within callbacks
    const isCallActiveRef = useRef(isCallActive);
    useEffect(() => { isCallActiveRef.current = isCallActive; }, [isCallActive]);

    const stopCallCleanup = useCallback(() => {
        setIsCallActive(false);
        setStatus(CallStatus.Inactive);
        setLiveTranscript('');

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
    }, []);
    
    // Effect for teardown
    useEffect(() => {
        return () => stopCallCleanup();
    }, [stopCallCleanup]);


    const startCall = useCallback(async () => {
        setConversation([]);
        setLiveTranscript('');
        setIsCallActive(true);
        setStatus(CallStatus.RequestingMic);
        
        try {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStatus(CallStatus.Connecting);
            
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
            outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

            let nextStartTime = 0;
            let currentInputTranscription = '';
            let currentOutputTranscription = '';
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                    systemInstruction: SYSTEM_INSTRUCTION,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        if (!mediaStreamRef.current || !inputAudioContextRef.current) return;
                        setStatus(CallStatus.Listening);
                        const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            if (!isCallActiveRef.current) return;
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createPcmBlob(inputData);
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle transcriptions
                        if (message.serverContent?.inputTranscription) {
                            setLiveTranscript(currentInputTranscription + message.serverContent.inputTranscription.text);
                            if(message.serverContent.inputTranscription.isFinal) {
                                currentInputTranscription += message.serverContent.inputTranscription.text + ' ';
                            }
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription += message.serverContent.outputTranscription.text;
                        }
                         if (message.serverContent?.turnComplete) {
                            if (currentInputTranscription.trim()) {
                                setConversation(prev => [...prev, { role: Role.User, text: currentInputTranscription.trim() }]);
                            }
                            if (currentOutputTranscription.trim()) {
                                setConversation(prev => [...prev, { role: Role.Assistant, text: currentOutputTranscription.trim() }]);
                            }
                            currentInputTranscription = '';
                            currentOutputTranscription = '';
                            setLiveTranscript('');
                            setStatus(CallStatus.Listening);
                        }

                        // Handle audio playback
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            setStatus(CallStatus.Speaking);
                            const outputCtx = outputAudioContextRef.current;
                            if (outputCtx.state === 'suspended') await outputCtx.resume();
                            nextStartTime = Math.max(nextStartTime, outputCtx.currentTime);
                            
                            const audioBuffer = await decodePcmAudioData(decode(base64Audio), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setStatus(CallStatus.Error);
                        stopCallCleanup();
                    },
                    onclose: (e: CloseEvent) => {
                        if (isCallActiveRef.current) {
                           stopCallCleanup();
                        }
                    },
                },
            });

        } catch (err) {
            console.error("Error setting up voice call:", err);
            setStatus(CallStatus.Error);
            alert("Se necesita permiso para acceder al micrófono o no es compatible.");
            stopCallCleanup();
        }
    }, [stopCallCleanup]);

    const stopCall = useCallback(() => {
        stopCallCleanup();
    }, [stopCallCleanup]);

    return { conversation, status, liveTranscript, isCallActive, startCall, stopCall };
};
