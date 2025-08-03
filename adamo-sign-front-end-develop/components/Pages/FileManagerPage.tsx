"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import DocumentUseCase from "@/api/useCases/DocumentUseCase";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/use-toast";
import { 
  FolderCard, 
  DocumentTable, 
  CreateFolderModal 
} from "@/components/FileManager";
import { 
  FileManagerState, 
  FileManagerDocument, 
  FileManagerFolder,
  FileManagerLocalStorage 
} from "@/types/FileManagerTypes";
import { 
  ChevronIcon, 
  PlusIcon, 
  RefreshIcon, 
  SearchIcon 
} from "@/components/icon";

export const FileManagerPage: React.FC = () => {
  const router = useRouter();
  const t = useTranslations("fileManager");
  const { toast } = useToast();
  const [state, setState] = useState<FileManagerState>({
    folders: [],
    documents: [],
    selectedDocumentIds: [],
    searchQuery: "",
  });
  const [searchQueryFolders, setSearchQueryFolders] = useState("");
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize with mock data or load from localStorage
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      // Para desarrollo: limpiar localStorage si es necesario
      if (process.env.NODE_ENV === 'development' && window.location.search.includes('clear=true')) {
        console.log('Clearing localStorage for fresh start');
        FileManagerLocalStorage.setState({
          folders: [],
          documents: [],
          selectedDocumentIds: [],
          searchQuery: "",
        });
      }
      
      // Try to load from localStorage first
      const savedState = FileManagerLocalStorage.getState();
      
      if (savedState) {
        console.log('Loading saved state with', savedState.documents.length, 'documents');
        
        // Verificar documentos sin organizar ANTES de hacer setState
        const unorganizedCount = savedState.documents.filter(doc => doc.folderId === null).length;
        console.log('Unorganized documents in saved state:', unorganizedCount);
        
        if (unorganizedCount === 0 && savedState.documents.length > 0) {
          console.log('No unorganized documents found, resetting first 4 documents');
          // Resetear los primeros 4 documentos ANTES de setState
          const resetState = {
            ...savedState,
            documents: savedState.documents.map((doc, index) => 
              index < 4 ? { ...doc, folderId: null } : doc
            )
          };
          setState(resetState);
          FileManagerLocalStorage.setState(resetState);
        } else {
          setState(savedState);
        }
        setCurrentPage(1);
      } else {
        console.log('No saved state, initializing with fresh data');
        // Initialize with mock data and fetch real documents
        const mockFolders: FileManagerFolder[] = [];

        try {
          // Fetch real documents from API
          const response = await DocumentUseCase.listDocuments({
            page: 1,
            limit: 50,
            status: "",
          });

          const apiDocuments = Array.isArray(response.data) ? response.data : [];
          
          // Convert API documents to FileManager format
          const fileManagerDocuments: FileManagerDocument[] = apiDocuments.map((doc, index) => ({
            id: doc._id || `doc-${index}`,
            filename: doc.filename || `Document ${index + 1}`,
            createdAt: doc.createdAt || new Date().toISOString(),
            participants: doc.participants?.length || Math.floor(Math.random() * 10) + 1,
            status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.8 ? 'error' : null,
            folderId: null, // All documents start as "ready to move"
            metadata: {
              url: doc.metadata?.url || '',
              mimetype: doc.metadata?.mimetype || 'application/pdf',
              s3Key: doc.metadata?.s3Key
            }
          }));

          // Add some mock documents if API doesn't return enough
          const mockDocuments: FileManagerDocument[] = [];

          const allDocuments = [...fileManagerDocuments, ...mockDocuments];
          console.log('Created', allDocuments.length, 'documents for fresh initialization');

          const initialState: FileManagerState = {
            folders: mockFolders,
            documents: allDocuments,
            selectedDocumentIds: [],
            searchQuery: "",
          };

          setState(initialState);
          FileManagerLocalStorage.setState(initialState);
          setCurrentPage(1); // Reset to first page when setting new data
          
        } catch (error) {
          console.error('Error fetching documents:', error);
          // Use only mock data if API fails
          const initialState: FileManagerState = {
            folders: mockFolders,
            documents: [],
            selectedDocumentIds: [],
            searchQuery: "",
          };
          setState(initialState);
          setCurrentPage(1); // Reset to first page
        }
      }
      
      setIsLoading(false);
    };

    initializeData();
  }, []);

  const unorganizedDocuments = state.documents.filter(doc => doc.folderId === null);
  
  // Si estamos en desarrollo y no hay documentos sin organizar, agregar un botón para resetear
  const handleResetDocuments = () => {
    if (process.env.NODE_ENV === 'development') {
      const resetState = {
        ...state,
        documents: state.documents.map((doc, index) => 
          index < 4 ? { ...doc, folderId: null } : doc
        )
      };
      setState(resetState);
      FileManagerLocalStorage.setState(resetState);
    }
  };

  const handleCreateFolder = (folderName: string) => {
    const newFolder: FileManagerFolder = {
      id: `folder-${Date.now()}`,
      name: folderName.toUpperCase(),
      documentCount: 0,
      isExpanded: false,
      documents: []
    };

    const newState = {
      ...state,
      folders: [...state.folders, newFolder]
    };

    setState(newState);
    FileManagerLocalStorage.setState(newState);
  };

  const handleToggleFolder = (folderId: string) => {
    const newState = {
      ...state,
      folders: state.folders.map(folder =>
        folder.id === folderId
          ? { ...folder, isExpanded: !folder.isExpanded }
          : folder
      )
    };

    setState(newState);
    FileManagerLocalStorage.setState(newState);
  };

  const handleMoveDocuments = (folderId: string, documentIds: string[]) => {
    const targetFolder = state.folders.find(folder => folder.id === folderId);
    
    const newState = {
      ...state,
      documents: state.documents.map(doc =>
        documentIds.includes(doc.id)
          ? { ...doc, folderId }
          : doc
      ),
      folders: state.folders.map(folder => ({
        ...folder,
        documentCount: folder.id === folderId 
          ? state.documents.filter(doc => 
              documentIds.includes(doc.id) || 
              (doc.folderId === folder.id && !documentIds.includes(doc.id))
            ).length
          : state.documents.filter(doc => doc.folderId === folder.id && !documentIds.includes(doc.id)).length
      })),
      selectedDocumentIds: state.selectedDocumentIds.filter(id => !documentIds.includes(id))
    };

    setState(newState);
    FileManagerLocalStorage.setState(newState);
    
    // Show success toast
    if (targetFolder) {
      const movedCount = documentIds.length;
      const message = movedCount === 1 
        ? t("moveDocumentSuccess", { folderName: targetFolder.name })
        : t("moveDocumentsSuccess", { count: movedCount, folderName: targetFolder.name });
      
      toast({
        title: message,
        variant: "sign",
      });
    }
  };

  const handleRemoveFromFolder = (documentId: string) => {
    const newState = {
      ...state,
      documents: state.documents.map(doc =>
        doc.id === documentId
          ? { ...doc, folderId: null }
          : doc
      ),
      folders: state.folders.map(folder => ({
        ...folder,
        documentCount: state.documents.filter(doc => 
          doc.folderId === folder.id && doc.id !== documentId
        ).length
      }))
    };

    setState(newState);
    FileManagerLocalStorage.setState(newState);
    
    // Show success toast
    toast({
      title: t("removeFromFolderSuccess"),
      variant: "sign",
    });
  };

  const handleSelectDocument = (documentId: string, isSelected: boolean) => {
    const newState = {
      ...state,
      selectedDocumentIds: isSelected
        ? [...state.selectedDocumentIds, documentId]
        : state.selectedDocumentIds.filter(id => id !== documentId)
    };

    setState(newState);
  };

  const handleSelectAllDocuments = (isSelected: boolean) => {
    const newState = {
      ...state,
      selectedDocumentIds: isSelected
        ? unorganizedDocuments.map(doc => doc.id)
        : []
    };

    setState(newState);
  };

  // Enhanced folder filtering that searches both folder names and documents within folders
  const filteredFolders = state.folders.filter(folder => {
    const searchQuery = searchQueryFolders.toLowerCase();
    
    // If no search query, show all folders
    if (!searchQuery) return true;
    
    // Check if folder name matches
    const folderNameMatches = folder.name.toLowerCase().includes(searchQuery);
    
    // Check if any document within the folder matches
    const documentsInFolder = state.documents.filter(doc => doc.folderId === folder.id);
    const documentMatches = documentsInFolder.some(doc => 
      doc.filename.toLowerCase().includes(searchQuery)
    );
    
    return folderNameMatches || documentMatches;
  }).map(folder => {
    // Auto-expand folders that have matching documents when searching
    const searchQuery = searchQueryFolders.toLowerCase();
    if (searchQuery) {
      const documentsInFolder = state.documents.filter(doc => doc.folderId === folder.id);
      const documentMatches = documentsInFolder.some(doc => 
        doc.filename.toLowerCase().includes(searchQuery)
      );
      
      // If this folder has matching documents and is not already expanded, expand it
      if (documentMatches && !folder.isExpanded) {
        return { ...folder, isExpanded: true };
      }
    }
    
    return folder;
  });

  if (isLoading) {
    return (
      <div className="space-y-4 bg-neutral-50 min-h-screen">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-24 py-4">
          <div className="text-gray-800 text-sm sm:text-base font-semibold font-['Open_Sans']">
            {t("title")}
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 xl:px-24">
          <div className="max-w-[976px] mx-auto">
            <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-neutral-200">
              <div className="text-lg text-gray-600">{t("loading")}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-neutral-50 min-h-screen">
      {/* Header with back button */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-24 py-4 flex justify-start items-center">
        <div className="flex justify-start items-center gap-2 sm:gap-4">
          <Button
            variant="link"
            onClick={() => router.back()}
            className="w-6 h-6 p-0 min-h-0 text-gray-800 hover:text-gray-600"
          >
            <ChevronIcon className="w-1.5 h-2.5 transform rotate-90" />
          </Button>
          <div className="text-gray-800 text-sm sm:text-base font-semibold font-['Open_Sans'] leading-normal">
            {t("title")}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 xl:px-24">
        <div className="max-w-[976px] mx-auto space-y-6">
          {/* Folders Section */}
        <div className="p-4 sm:p-6 bg-white rounded-3xl border border-neutral-200 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="h-12 flex justify-start items-center gap-4 sm:gap-6">
              <div className="h-12 px-5 py-3 bg-violet-100 rounded-xl flex justify-center items-center gap-2">
                <RefreshIcon className="w-6 h-6 text-indigo-900" />
              </div>
              <div className="text-gray-800 text-sm sm:text-base font-semibold font-['Open_Sans'] leading-normal">
                {state.folders.reduce((sum, folder) => sum + folder.documentCount, 0)} {t("folders.filesCount")}
              </div>
            </div>
            
            <div className="w-full sm:w-auto sm:max-w-[350px] lg:max-w-[550px] flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-4 sm:gap-6">
              <Button
                variant="primary"
                size="large"
                onClick={() => setIsCreateFolderModalOpen(true)}
                className="bg-indigo-900 hover:bg-indigo-800 text-sm"
              >
                <PlusIcon className="w-4 sm:w-6 h-4 sm:h-6 text-white" />
                <span className="ml-2">{t("newFolder")}</span>
              </Button>
              
              <div className="flex-1 sm:min-w-0 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="w-4 h-4 text-neutral-500" />
                </div>
                <input
                  type="text"
                  placeholder={t("searchFolders")}
                  value={searchQueryFolders}
                  onChange={(e) => setSearchQueryFolders(e.target.value)}
                  className="w-full h-12 pl-10 pr-3 py-1 bg-white rounded-lg border border-gray-200 text-gray-400 text-sm font-['Open_Sans'] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                documents={state.documents}
                onToggle={handleToggleFolder}
                onDrop={handleMoveDocuments}
                searchQuery={searchQueryFolders}
                selectedDocumentIds={state.selectedDocumentIds}
                onSelectDocument={handleSelectDocument}
                folders={state.folders}
                onMoveToFolder={(documentId, folderId) => handleMoveDocuments(folderId, [documentId])}
                onRemoveFromFolder={handleRemoveFromFolder}
              />
            ))}
          </div>
        </div>

        {/* Documents Section */}
        <div className="px-4 sm:px-6 pt-6 pb-4 bg-white rounded-3xl border border-neutral-200 flex flex-col gap-4">
          <div className="text-gray-800 text-sm sm:text-base font-normal font-['Open_Sans'] leading-normal">
            {t("documents.instruction")}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="h-12 flex justify-start items-center gap-4 sm:gap-6">
              <div className="h-12 px-5 py-3 bg-violet-100 rounded-xl flex justify-center items-center gap-2">
                <RefreshIcon className="w-6 h-6 text-indigo-900" />
              </div>
              <div className="text-gray-800 text-sm sm:text-base font-semibold font-['Open_Sans'] leading-normal">
                {unorganizedDocuments.filter(doc => 
                  doc.filename.toLowerCase().includes(state.searchQuery.toLowerCase())
                ).length} {t("documents.readyToMove")}
              </div>
              
              {/* Debug button - temporal para desarrollo */}
              {process.env.NODE_ENV === 'development' && unorganizedDocuments.length === 0 && state.documents.length > 0 && (
                <Button
                  variant="secondary"
                  size="medium"
                  onClick={handleResetDocuments}
                  className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                >
                  Reset Docs
                </Button>
              )}
            </div>
            
            <div className="w-full sm:w-auto sm:max-w-[350px] lg:max-w-[550px] flex justify-end items-center">
              <div className="w-full relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="w-4 h-4 text-neutral-500" />
                </div>
                <input
                  type="text"
                  placeholder={t("searchFiles")}
                  value={state.searchQuery}
                  onChange={(e) => {
                    setState({ ...state, searchQuery: e.target.value });
                    setCurrentPage(1); // Reset to first page when search changes
                  }}
                  className="w-full h-12 pl-10 pr-3 py-1 bg-white rounded-lg border border-gray-200 text-gray-400 text-sm font-['Open_Sans'] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 overflow-x-auto">
            <DocumentTable
              documents={unorganizedDocuments}
              selectedDocumentIds={state.selectedDocumentIds}
              onSelectDocument={handleSelectDocument}
              onSelectAll={handleSelectAllDocuments}
              searchQuery={state.searchQuery}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              folders={state.folders}
              onMoveToFolder={(documentId, folderId) => handleMoveDocuments(folderId, [documentId])}
            />
          </div>
        </div>
      </div>
    </div>

    <CreateFolderModal
      isOpen={isCreateFolderModalOpen}
      onClose={() => setIsCreateFolderModalOpen(false)}
      onCreateFolder={handleCreateFolder}
    />
  </div>
);
};
