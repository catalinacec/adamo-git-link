import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Download, Users, FileText, Clock, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { documentService } from "@/services/documentService";
import { Document } from "@/types";
import { useNavigate } from "react-router-dom";

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        const docs = await documentService.getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completado
        </Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Parcial
        </Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Users className="h-3 w-3 mr-1" />
          Enviado
        </Badge>;
      case 'draft':
        return <Badge variant="outline">Borrador</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDocument = (documentId: string) => {
    navigate(`/documents/${documentId}`);
  };

  const handleViewSignatures = (documentId: string) => {
    navigate(`/documents/${documentId}/signatures`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documentos</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo documento
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc._id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{doc.filename}</CardTitle>
                    <CardDescription>
                      Creado el {new Date(doc.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Firmantes</p>
                      <p className="font-medium">{doc.participants.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Progreso</p>
                      <p className="font-medium">
                        {doc.completedSignatures}/{doc.totalSignatures} firmas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDocument(doc._id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    
                    {doc.status === 'completed' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleViewSignatures(doc._id)}>
                          <FileText className="h-4 w-4 mr-1" />
                          Acta
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </Button>
                      </>
                    )}
                    
                    {(doc.status === 'partial' || doc.status === 'sent') && (
                      <Button variant="outline" size="sm" onClick={() => handleViewSignatures(doc._id)}>
                        <Users className="h-4 w-4 mr-1" />
                        Firmantes
                      </Button>
                    )}
                  </div>
                </div>
                
                {doc.participants.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Firmantes:</p>
                    <div className="flex flex-wrap gap-2">
                      {doc.participants.map((participant, index) => (
                        <Badge 
                          key={index} 
                          variant={participant.status === 'signed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {participant.first_name} {participant.last_name}
                          {participant.status === 'signed' && <CheckCircle2 className="h-3 w-3 ml-1" />}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No hay documentos aún. Crea tu primer documento.</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear documento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Documents;