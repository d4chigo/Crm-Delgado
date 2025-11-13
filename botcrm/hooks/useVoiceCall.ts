
import { useState, useRef, useCallback, useEffect } from 'react';
import { Message, Role, CallStatus } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';
import { ai } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, CloseEvent, ErrorEvent, FunctionCall } from '@google/genai';
import { crmTools } from '../services/tools';

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

// In a real application, these would make API calls to your backend.
async function executeVoiceTool(toolCall: FunctionCall): Promise<any> {
    const { name, args } = toolCall;
    console.log(`Executing voice tool: ${name}`, args);

    switch (name) {
        case 'createContact':
            return { success: true, message: `Contacto ${args.nombre} creado.` };
        case 'getContact':
            if (args.correo === 'notfound@example.com') {
                return { success: false, message: `No encontré el contacto con email ${args.correo}.` };
            }
            return { success: true, contact: { nombre: 'Juan Pérez', correo: args.correo } };
        case 'updateContact':
            return { success: true, message: `Contacto ${args.identificador} actualizado.` };
        case 'deleteContact':
            return { success: true, message: `Contacto ${args.identificador} borrado.` };
        default:
            return { success: false, message: `Función ${name} desconocida.` };
    }
}


// --- Main Hook ---
export const useVoiceCall = () => {
    const [conversation, setConversation] = useState<Message[]>([]);
    const [status, setStatus] = useState<CallStatus>(CallStatus.Inactive);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [isCallActive, setIsCallActive] = useState(false);

    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const isCallActiveRef = useRef(isCallActive);

    useEffect(() => {
        isCallActiveRef.current = isCallActive;
    }, [isCallActive]);

    const stopCallCleanup = useCallback(() => {
        const sessionPromise = sessionPromiseRef.current;
        sessionPromiseRef.current = null;
        if (sessionPromise) {
            sessionPromise.then(session => {
                if (session && typeof session.close === 'function') {
                    session.close();
                }
            }).catch(e => console.error("Error closing session:", e));
        }

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close().catch(e => console.error("Error closing input context:", e));
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(e => console.error("Error closing output context:", e));
            outputAudioContextRef.current = null;
        }

        setIsCallActive(false);
        setStatus(CallStatus.Inactive);
        setLiveTranscript('');
    }, []);

    useEffect(() => {
        return () => stopCallCleanup();
    }, [stopCallCleanup]);


    const startCall = useCallback(async () => {
        if (isCallActiveRef.current) return;
        
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
                    tools: [{ functionDeclarations: crmTools }],
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
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.toolCall) {
                            for (const fc of message.toolCall.functionCalls) {
                                const result = await executeVoiceTool(fc);
                                sessionPromiseRef.current?.then((session) => {
                                    session.sendToolResponse({
                                        functionResponses: {
                                            id: fc.id,
                                            name: fc.name,
                                            response: result,
                                        }
                                    });
                                });
                            }
                        }

                        if (message.serverContent?.inputTranscription) {
                            setLiveTranscript(currentInputTranscription + message.serverContent.inputTranscription.text);
                            if (message.serverContent.inputTranscription.isFinal) {
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
                        console.log('Live session closed.');
                        stopCallCleanup();
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
