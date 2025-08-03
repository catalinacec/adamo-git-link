import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Plus, Eye } from "lucide-react";
import { useSignatureData } from "@/context/SignatureContext";
import { useEffect, useState } from "react";
import { documentService } from "@/services/documentService";
import { Document } from "@/types";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { documentStats, refreshStats, isLoading } = useSignatureData();
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecentDocuments = async () => {
      setLoadingRecent(true);
      try {
        const docs = await documentService.getRecentDocuments(3);
        setRecentDocuments(docs);
      } catch (error) {
        console.error('Error loading recent documents:', error);
      } finally {
        setLoadingRecent(false);
      }
    };

    loadRecentDocuments();
    refreshStats();
  }, [refreshStats]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenida María Laura!</h1>
        <p className="text-gray-600">
          Todo lo que necesitas está aquí, en una plataforma diseñada para simplificar tu gestión documental.
        </p>
      </div>

      {/* Documents Sent Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isLoading ? '...' : `${documentStats?.totalDocuments || 381} Documentos enviados`}
            </h2>
            <p className="text-sm text-gray-600">Documentos que aún no han sido firmados</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="bg-[#4B5BA6] text-white border-[#4B5BA6] hover:bg-[#3D4A86]"
              onClick={() => navigate('/documents')}
            >
              Ver documentos
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/documents/new')}
            >
              Nuevo documento
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completed Documents */}
        <Card className="p-6 border border-gray-200">
          <CardContent className="p-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : (documentStats?.completedDocuments || 13411).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Documentos finalizados</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-4 text-gray-600 hover:text-gray-900"
              onClick={() => navigate('/documents?status=completed')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver documentos
            </Button>
          </CardContent>
        </Card>

        {/* Rejected Documents */}
        <Card className="p-6 border border-gray-200">
          <CardContent className="p-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : (documentStats?.rejectedDocuments || 671).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Documentos rechazados</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-4 text-gray-600 hover:text-gray-900"
              onClick={() => navigate('/documents?status=rejected')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver documentos
            </Button>
          </CardContent>
        </Card>

        {/* Pending Documents */}
        <Card className="p-6 border border-gray-200">
          <CardContent className="p-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : (documentStats?.pendingSignatures || 2510).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Documentos en proceso</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-4 text-gray-600 hover:text-gray-900"
              onClick={() => navigate('/documents?status=pending')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver documentos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button 
          className="bg-[#4B5BA6] hover:bg-[#3D4A86] text-white"
          onClick={() => navigate('/documents/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo documento
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/contacts')}
        >
          Gestionar contactos
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/verify')}
        >
          Verificar documentos
        </Button>
      </div>
    </div>
  );
};

export default Index;