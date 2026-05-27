import type { Citation, DocumentChunk, KnowledgeDocument } from './types';

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number;
  citation: Citation;
}

const stopWords = new Set(['the', 'and', 'or', 'for', 'with', 'what', 'your', 'you', 'about', 'does', 'do', 'a', 'an', 'is']);

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !stopWords.has(t));
}

export function retrieveChunks(query: string, documents: KnowledgeDocument[], chunks: DocumentChunk[]): RetrievalResult[] {
  const terms = tokenize(query);
  const scored = chunks.map((chunk) => {
    const doc = documents.find((d) => d.id === chunk.documentId);
    const haystack = `${doc?.name ?? ''} ${doc?.description ?? ''} ${chunk.title} ${chunk.content}`.toLowerCase();
    const matches = terms.filter((term) => haystack.includes(term)).length;
    const score = terms.length === 0 ? 0 : matches / terms.length;
    return {
      chunk,
      score,
      citation: {
        documentId: doc?.id,
        chunkId: chunk.id,
        documentName: doc?.name ?? 'Unknown document',
        excerpt: chunk.content,
        score,
        matchedTerms: terms.filter((term) => haystack.includes(term)),
      },
    } as RetrievalResult;
  });

  return scored.filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
}
