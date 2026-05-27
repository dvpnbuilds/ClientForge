import type { RetrievalResult } from './retrieval';
import type { Citation } from './types';

export function generateMockAnswer(query: string, results: RetrievalResult[]): { answer: string; citations: Citation[] } {
  if (results.length === 0) {
    return {
      answer: `I couldn't find a direct match for: ${query}. Try asking about services, pricing, or warranty.`,
      citations: [],
    };
  }

  const top = results[0];
  const citations = results.map((r) => r.citation);
  const answer = `Based on your knowledge base, the best answer is: ${top.chunk.content}`;
  return { answer, citations };
}
