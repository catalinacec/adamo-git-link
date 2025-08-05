import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';
import { documentService } from '@/services/api';
import { toast } from 'sonner';

interface DocumentUploadProps {
  onUploadComplete?: (document: any) => void;
}

const DocumentUpload = ({ onUploadComplete }: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
        toast.error('El archivo no puede superar los 10MB');
        return;
      }
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace('.pdf', ''));
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setTitle('');
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast.error('Por favor selecciona un archivo y proporciona un título');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);

      const response = await documentService.createDocument(formData);
      toast.success('Documento subido correctamente');
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      
      onUploadComplete?.(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir nuevo documento</CardTitle>
        <CardDescription>
          Sube un documento PDF para comenzar el proceso de firma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título del documento</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Introduce el título del documento"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del documento"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Archivo PDF</Label>
          {!file ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <div className="text-sm text-muted-foreground mb-2">
                  Arrastra un archivo PDF aquí o haz clic para seleccionar
                </div>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file')?.click()}
                >
                  Seleccionar archivo
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || !title.trim() || uploading}
          className="w-full"
        >
          {uploading ? 'Subiendo...' : 'Subir documento'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;