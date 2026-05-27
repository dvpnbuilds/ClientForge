import type { DocumentChunk, KnowledgeDocument } from './types';
import type { AddDocumentFormData } from '@/components/knowledge/add-document-modal';

const sizeByType: Record<AddDocumentFormData['type'], string> = {
  pdf: '2.1 MB',
  txt: '14 KB',
  md: '18 KB',
  docx: '1.4 MB',
};

export function createMockDocument(data: AddDocumentFormData): KnowledgeDocument {
  return {
    id: `doc-${Date.now()}`,
    name: data.name,
    description: data.description || `${data.category} document uploaded by user.`,
    type: data.type,
    size: sizeByType[data.type],
    status: 'processing',
    uploadedAt: new Date().toISOString(),
    chunkCount: 0,
    category: data.category,
  };
}

export function createMockChunks(documentId: string, category: string): DocumentChunk[] {
  const templates: Record<string, string[]> = {
    profile: ['Company overview', 'Core services', 'Process notes'],
    pricing: ['Entry pricing', 'Renovation ranges', 'Payment schedule'],
    faq: ['Coverage', 'Support', 'Exclusions'],
    default: ['Section 1', 'Section 2', 'Section 3'],
  };
  const titles = templates[category] ?? templates.default;
  return titles.map((title, index) => ({
    id: `${documentId}-chunk-${index + 1}`,
    documentId,
    index,
    title,
    content: `${title} content for ${category} document.`,
  }));
}
