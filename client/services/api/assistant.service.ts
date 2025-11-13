import { fetchAPI } from './config';

export interface AssistantAction {
  type: 'navigate' | 'open_lead_cotizacion' | 'none';
  target?: string;
  params?: Record<string, string>;
}

export interface AssistantResponse { answer: string; action?: AssistantAction }

export async function preguntarAsistente(question: string): Promise<AssistantResponse> {
  return await fetchAPI<AssistantResponse>(`/assistant/ask`, {
    method: 'POST',
    body: JSON.stringify({ question })
  });
}
