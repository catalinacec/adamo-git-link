import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Users, Clock, CheckCircle, XCircle, Archive, Plus } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { useProfile } from '@/context/ProfileContext';
import { useNotifications } from '@/context/NotificationsContext';

const Dashboard = () => {
  const { dashboard, loading: dashboardLoading } = useDashboard();
  const { profile } = useProfile();
  const { unreadCount } = useNotifications();

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const documentStats = dashboard?.documents;
  const totalDocs = dashboard?.totalDocuments || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {dashboard?.welcomeMessage || `¡Hola, ${profile?.name}!`}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus documentos y firmas digitales
          </p>
        </div>
        <div className="flex gap-3">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Documento
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            Plan: {dashboard?.plan || 'Free'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocs}</div>
            <p className="text-xs text-muted-foreground">
              Todos los documentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {documentStats?.completed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Documentos firmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {documentStats?.in_progress || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendientes de firma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificaciones</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              Sin leer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Document Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Documentos</CardTitle>
            <CardDescription>
              Resumen del estado actual de tus documentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Completados</span>
                </div>
                <span className="font-medium">{documentStats?.completed || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">En progreso</span>
                </div>
                <span className="font-medium">{documentStats?.in_progress || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Borradores</span>
                </div>
                <span className="font-medium">{documentStats?.draft || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Pendientes</span>
                </div>
                <span className="font-medium">{documentStats?.pending || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Rechazados</span>
                </div>
                <span className="font-medium">{documentStats?.rejected || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm">Papelera</span>
                </div>
                <span className="font-medium">{documentStats?.recycler || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="w-4 h-4 mr-2" />
              Crear nuevo documento
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Gestionar contactos
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Archive className="w-4 h-4 mr-2" />
              Ver archivo
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle className="w-4 h-4 mr-2" />
              Revisar firmas pendientes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;