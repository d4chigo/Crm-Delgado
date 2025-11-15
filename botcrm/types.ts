
export enum Role {
    User = 'user',
    Assistant = 'assistant',
}

export interface Message {
    role: Role;
    text: string;
}

export enum Tab {
    Chat = 'chat',
    Call = 'call',
}

export enum CallStatus {
    Inactive = 'INACTIVO',
    CheckingPermission = 'VERIFICANDO PERMISOS...',
    RequestingMic = 'SOLICITANDO MICRÓFONO',
    Connecting = 'CONECTANDO...',
    Listening = 'ESCUCHANDO...',
    Processing = 'PROCESANDO...',
    Speaking = 'HABLANDO...',
    Error = 'ERROR',
}