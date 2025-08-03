import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Shield, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useSignatureData } from "@/context/SignatureContext";
import { useEffect, useState } from "react";
import { documentService } from "@/services/documentService";
import { Document } from "@/types";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const { documentStats, refreshStats, isLoading } = useSignatureData();
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

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
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completado</Badge>;
      case 'partial':
        return <Badge variant="secondary">Parcial</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Enviado</Badge>;
      case 'draft':
        return <Badge variant="outline">Borrador</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bienvenido a AdamoSign</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tus documentos y firmas de forma segura y eficiente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : documentStats?.totalDocuments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total de documentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : documentStats?.totalContacts || 0}
            </div>
            <p className="text-xs text-muted-foreground">Contactos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Firmas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? '...' : documentStats?.pendingSignatures || 0}
            </div>
            <p className="text-xs text-muted-foreground">Esperando firma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : documentStats?.completedDocuments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Documentos recientes</CardTitle>
            <CardDescription>Tus últimos documentos subidos</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRecent ? (
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
              </div>
            ) : recentDocuments.length > 0 ? (
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.completedSignatures}/{doc.totalSignatures} firmas
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No hay documentos recientes</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription>Tareas comunes para empezar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Subir nuevo documento
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Agregar contacto
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={refreshStats}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Actualizar estadísticas
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;