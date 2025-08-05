import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Users, 
  Calendar, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Download, 
  Trash2 
} from 'lucide-react';

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    status: string;
    createdAt: string;
    signers: number;
    totalPages: number;
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}

const DocumentCard = ({ document, onView, onEdit, onDelete, onDownload }: DocumentCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Completado', variant: 'default' as const, color: 'bg-green-500' },
      in_progress: { label: 'En progreso', variant: 'secondary' as const, color: 'bg-yellow-500' },
      draft: { label: 'Borrador', variant: 'outline' as const, color: 'bg-blue-500' },
      pending: { label: 'Pendiente', variant: 'destructive' as const, color: 'bg-orange-500' },
      rejected: { label: 'Rechazado', variant: 'destructive' as const, color: 'bg-red-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{document.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(document.status)}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(document.id)}>
                <Eye className="w-4 h-4 mr-2" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(document.id)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload?.(document.id)}>
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete?.(document.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{document.signers} firmantes</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{document.totalPages} páginas</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Creado {new Date(document.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onView?.(document.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDownload?.(document.id)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;