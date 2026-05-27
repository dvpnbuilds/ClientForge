import type { DocumentChunk, KnowledgeDocument } from './types';

const _documents: KnowledgeDocument[] = [];
const _chunks: DocumentChunk[] = [];

export function addDynamicDocument(document: KnowledgeDocument): void {
  _documents.unshift(document);
}

export function updateDynamicDocument(id: string, patch: Partial<KnowledgeDocument>): void {
  const doc = _documents.find((d) => d.id === id);
  if (!doc) return;
  Object.assign(doc, patch);
}

export function addDynamicChunks(chunks: DocumentChunk[]): void {
  _chunks.unshift(...chunks);
}

export function getAllDynamicDocuments(): KnowledgeDocument[] {
  return [..._documents];
}

export function getAllDynamicChunks(): DocumentChunk[] {
  return [..._chunks];
}

export function getDynamicDocument(id: string): KnowledgeDocument | undefined {
  return _documents.find((doc) => doc.id === id);
}
