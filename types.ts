
export interface Message {
  id: string;
  role: 'user' | 'buddy';
  text: string;
  timestamp: number;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface AudioConfig {
  sampleRate: number;
  numChannels: number;
}
