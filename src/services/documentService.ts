import { DocumentStats, Document, Participant, SignatureEvent } from '@/types';

// Mock data for development - replace with actual API calls
const mockDocuments: Document[] = [
  {
    _id: '1',
    documentId: 'DOC-001',
    filename: 'Contrato de servicios.pdf',
    owner: 'admin@adamosign.com',
    version: 1,
    status: 'partial',
    isActive: true,
    isDeleted: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    totalSignatures: 3,
    completedSignatures: 1,
    pendingSignatures: 2,
    participants: [
      {
        uuid: 'part-1',
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan@empresa.com',
        status: 'signed',
        requireValidation: false,
        signatures: [],
        signedAt: '2024-01-16T14:30:00Z'
      },
      {
        uuid: 'part-2',
        first_name: 'María',
        last_name: 'García',
        email: 'maria@empresa.com',
        status: 'sent',
        requireValidation: false,
        signatures: []
      }
    ]
  },
  {
    _id: '2',
    documentId: 'DOC-002',
    filename: 'Acuerdo de confidencialidad.pdf',
    owner: 'admin@adamosign.com',
    version: 1,
    status: 'completed',
    isActive: true,
    isDeleted: false,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    completedAt: '2024-01-12T16:45:00Z',
    totalSignatures: 2,
    completedSignatures: 2,
    pendingSignatures: 0,
    participants: [
      {
        uuid: 'part-3',
        first_name: 'Carlos',
        last_name: 'Rodríguez',
        email: 'carlos@cliente.com',
        status: 'signed',
        requireValidation: false,
        signatures: [],
        signedAt: '2024-01-12T16:45:00Z'
      }
    ]
  }
];

export const documentService = {
  async getStats(): Promise<DocumentStats> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const stats: DocumentStats = {
      totalDocuments: 381,
      completedDocuments: 13411,
      pendingSignatures: 2510,
      rejectedDocuments: 671,
      totalContacts: 1250,
    };
    
    return stats;
  },

  async getDocuments(): Promise<Document[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDocuments;
  },

  async getRecentDocuments(limit: number = 5): Promise<Document[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockDocuments
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  },

  async getDocumentById(id: string): Promise<Document | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockDocuments.find(doc => doc._id === id) || null;
  },

  async signDocument(documentId: string, participantId: string, signatureData: any): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate signing process
    console.log('Signing document:', { documentId, participantId, signatureData });
    return true;
  },

  async getSignatureEvents(): Promise<SignatureEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [
      {
        id: '1',
        documentId: 'DOC-001',
        participantId: 'part-1',
        action: 'signed',
        timestamp: '2024-01-16T14:30:00Z',
        details: { documentName: 'Contrato de servicios.pdf' }
      }
    ];
  }
};