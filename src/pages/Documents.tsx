import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DocumentTable } from "@/components/DocumentTable";
import { DocumentUploadModal } from "@/components/modals/DocumentUploadModal";

const Documents = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documentos</h1>
        <Button 
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo documento
        </Button>
      </div>
      
      <DocumentTable />
      
      <DocumentUploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  );
};

export default Documents;