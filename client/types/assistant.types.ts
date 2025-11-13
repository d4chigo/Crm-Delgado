export enum Role {
  User = 'user',
  Assistant = 'assistant',
}

export interface Message {
  role: Role;
  text: string;
}

export enum CallStatus {
  Inactive = 'INACTIVO',
  RequestingMic = 'SOLICITANDO MICRÓFONO',
  Connecting = 'CONECTANDO...',
  Listening = 'ESCUCHANDO...',
  Processing = 'PROCESANDO...',
  Speaking = 'HABLANDO...',
  Error = 'ERROR',
}
