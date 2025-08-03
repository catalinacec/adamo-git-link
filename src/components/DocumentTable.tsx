import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  MoreHorizontal, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Document {
  id: string;
  name: string;
  status: 'draft' | 'sent' | 'completed' | 'rejected' | 'in_progress';
  createdAt: string;
  updatedAt: string;
  signers: number;
  completedSignatures: number;
  totalSignatures: number;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Contrato de Servicios - Cliente ABC",
    status: "completed",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    signers: 3,
    completedSignatures: 3,
    totalSignatures: 3
  },
  {
    id: "2", 
    name: "Acuerdo de Confidencialidad - Proyecto XYZ",
    status: "in_progress",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
    signers: 2,
    completedSignatures: 1,
    totalSignatures: 2
  },
  {
    id: "3",
    name: "Contrato de Trabajo - Juan Pérez",
    status: "sent",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
    signers: 2,
    completedSignatures: 0,
    totalSignatures: 2
  },
  {
    id: "4",
    name: "Propuesta Comercial - Empresa DEF",
    status: "draft",
    createdAt: "2024-01-03",
    updatedAt: "2024-01-03",
    signers: 1,
    completedSignatures: 0,
    totalSignatures: 1
  },
  {
    id: "5",
    name: "Acuerdo de Prestación de Servicios",
    status: "rejected",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-12",
    signers: 2,
    completedSignatures: 0,
    totalSignatures: 2
  }
];

const getStatusBadge = (status: Document['status']) => {
  const statusConfig = {
    draft: { 
      label: 'Borrador', 
      className: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: FileText
    },
    sent: { 
      label: 'Enviado', 
      className: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Users
    },
    in_progress: { 
      label: 'En proceso', 
      className: 'bg-orange-100 text-orange-700 border-orange-200',
      icon: Clock
    },
    completed: { 
      label: 'Completado', 
      className: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle
    },
    rejected: { 
      label: 'Rechazado', 
      className: 'bg-red-100 text-red-700 border-red-200',
      icon: XCircle
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} border`} variant="outline">
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};

export function DocumentTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDocument = (id: string) => {
    navigate(`/documents/${id}`);
  };

  const handleViewSignatures = (id: string) => {
    navigate(`/documents/${id}/signatures`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Estado: {statusFilter === "all" ? "Todos" : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
              Borrador
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("sent")}>
              Enviado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>
              En proceso
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
              Completado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
              Rechazado
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No se encontraron documentos
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.signers} firmante(s)</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(doc.status)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        {doc.completedSignatures}/{doc.totalSignatures}
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(doc.completedSignatures / doc.totalSignatures) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDocument(doc.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver documento
                        </DropdownMenuItem>
                        {doc.status !== 'draft' && (
                          <DropdownMenuItem onClick={() => handleViewSignatures(doc.id)}>
                            <Users className="h-4 w-4 mr-2" />
                            Ver firmantes
                          </DropdownMenuItem>
                        )}
                        {doc.status === 'completed' && (
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}