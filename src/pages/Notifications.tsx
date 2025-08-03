import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, FileText, Eye, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { documentService } from "@/services/documentService";
import { SignatureEvent } from "@/types";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const [events, setEvents] = useState<SignatureEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const signatureEvents = await documentService.getSignatureEvents();
        setEvents(signatureEvents);
      } catch (error) {
        console.error('Error loading signature events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const handleViewDocument = (documentId: string) => {
    navigate(`/documents/${documentId}`);
  };

  const handleViewSignatures = (documentId: string) => {
    navigate(`/documents/${documentId}/signatures`);
  };

  const getEventBadge = (action: string) => {
    switch (action) {
      case 'signed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Firmado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rechazado</Badge>;
      case 'viewed':
        return <Badge variant="secondary">Visto</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getEventIcon = (action: string) => {
    switch (action) {
      case 'signed':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <FileText className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Notificaciones</h1>
        {events.length > 0 && (
          <Badge variant="secondary">{events.length}</Badge>
        )}
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
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
      ) : events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getEventIcon(event.action)}
                    <div>
                      <CardTitle className="text-base">
                        {event.action === 'signed' ? 'Documento firmado' : 
                         event.action === 'rejected' ? 'Documento rechazado' : 
                         'Documento visualizado'}
                      </CardTitle>
                      <CardDescription>
                        {event.details?.documentName || `Documento ${event.documentId}`}
                      </CardDescription>
                    </div>
                  </div>
                  {getEventBadge(event.action)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewDocument(event.documentId)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver documento
                    </Button>
                    
                    {event.action === 'signed' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewSignatures(event.documentId)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Ver acta
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay notificaciones nuevas.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;