// Types for File Manager
export interface FileManagerFolder {
  id: string;
  name: string;
  documentCount: number;
  isExpanded: boolean;
  documents: FileManagerDocument[];
}

export interface FileManagerDocument {
  id: string;
  filename: string;
  createdAt: string;
  participants: number;
  status: 'completed' | 'pending' | 'error' | null;
  folderId: string | null; // null means it's in root (ready to move)
  metadata: {
    url: string;
    mimetype: string;
    s3Key?: string;
  };
}

export interface FileManagerState {
  folders: FileManagerFolder[];
  documents: FileManagerDocument[];
  selectedDocumentIds: string[];
  searchQuery: string;
}

// LocalStorage service for file organization
export class FileManagerLocalStorage {
  private static STORAGE_KEY = 'adamo-file-manager';

  static getState(): FileManagerState | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static setState(state: FileManagerState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving file manager state:', error);
    }
  }

  static moveDocuments(documentIds: string[], targetFolderId: string | null): void {
    const state = this.getState();
    if (!state) return;

    // Update documents folder assignment
    state.documents = state.documents.map(doc => 
      documentIds.includes(doc.id) 
        ? { ...doc, folderId: targetFolderId }
        : doc
    );

    // Update folder document counts
    state.folders = state.folders.map(folder => ({
      ...folder,
      documentCount: state.documents.filter(doc => doc.folderId === folder.id).length
    }));

    this.setState(state);
  }

  static createFolder(name: string): string {
    const state = this.getState();
    if (!state) return '';

    const newFolder: FileManagerFolder = {
      id: `folder-${Date.now()}`,
      name: name.toUpperCase(),
      documentCount: 0,
      isExpanded: false,
      documents: []
    };

    state.folders.push(newFolder);
    this.setState(state);
    return newFolder.id;
  }

  static toggleFolder(folderId: string): void {
    const state = this.getState();
    if (!state) return;

    state.folders = state.folders.map(folder =>
      folder.id === folderId
        ? { ...folder, isExpanded: !folder.isExpanded }
        : folder
    );

    this.setState(state);
  }
}
