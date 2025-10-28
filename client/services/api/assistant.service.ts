import { fetchAPI } from './config';

export interface AssistantResponse { answer: string }

export async function preguntarAsistente(question: string): Promise<AssistantResponse> {
  return await fetchAPI<AssistantResponse>(`/assistant/ask`, {
    method: 'POST',
    body: JSON.stringify({ question })
  });
}
