import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { documentService } from '@/services/documentService';
import { Document } from '@/types';

const SignatureList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadDocument = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const doc = await documentService.getDocumentById(id);
        setDocument(doc);
      } catch (error) {
        console.error('Error loading document:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [id]);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'signed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'sent':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'signed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Firmado</Badge>;
      case 'sent':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rechazado</Badge>;
      default:
        return <Badge variant="outline">Borrador</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/documents')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="h-8 bg-muted rounded animate-pulse w-48"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/documents')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Documento no encontrado</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/documents')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Acta de Firmas</h1>
      </div>

      {/* Document Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{document.filename}</CardTitle>
              <p className="text-muted-foreground mt-1">
                Documento ID: {document.documentId}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {document.status === 'completed' && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Acta
                </Button>
              )}
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Ver Documento
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Estado</p>
              <p className="font-medium capitalize">{document.status}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Firmantes</p>
              <p className="font-medium">{document.participants.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Firmas Completadas</p>
              <p className="font-medium">{document.completedSignatures}/{document.totalSignatures}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Creado</p>
              <p className="font-medium">{new Date(document.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          {document.completedAt && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <CheckCircle2 className="h-4 w-4 inline mr-1" />
                Documento completado el {new Date(document.completedAt).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signatures List */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Firmas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {document.participants.map((participant, index) => (
              <div key={participant.uuid || index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(participant.status)}
                    <div>
                      <h4 className="font-medium">
                        {participant.first_name} {participant.last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{participant.email}</p>
                      
                      {participant.status === 'signed' && participant.signedAt && (
                        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <p>Firmado el: {new Date(participant.signedAt).toLocaleString()}</p>
                          {participant.signatures.length > 0 && (
                            <div className="space-y-1">
                              {participant.signatures.map((sig, sigIndex) => (
                                <div key={sigIndex} className="pl-4 border-l-2 border-green-200">
                                  <p>Tipo: {sig.signatureType === 'type' ? 'Texto' : sig.signatureType === 'draw' ? 'Dibujada' : 'Cargada'}</p>
                                  {sig.signatureFontFamily && <p>Fuente: {sig.signatureFontFamily}</p>}
                                  {sig.signatureColor && <p>Color: {sig.signatureColor}</p>}
                                  {sig.signatureText && <p>Texto: "{sig.signatureText}"</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {participant.status === 'rejected' && participant.rejectedAt && (
                        <div className="mt-2 text-xs text-red-600">
                          <p>Rechazado el: {new Date(participant.rejectedAt).toLocaleString()}</p>
                          {participant.rejectionReason && (
                            <p>Motivo: {participant.rejectionReason}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(participant.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p>Documento creado</p>
                <p className="text-muted-foreground text-xs">
                  {new Date(document.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            {document.participants.filter(p => p.status === 'signed' && p.signedAt).map((participant, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p>{participant.first_name} {participant.last_name} firmó el documento</p>
                  <p className="text-muted-foreground text-xs">
                    {participant.signedAt && new Date(participant.signedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            
            {document.completedAt && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p>Documento completado</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(document.completedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignatureList;