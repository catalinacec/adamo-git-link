import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  MoreHorizontal, 
  Check, 
  Trash2, 
  Archive,
  AlertCircle,
  FileText,
  Users
} from 'lucide-react';
import { notificationService } from '@/services/api';
import { useNotifications } from '@/context/NotificationsContext';
import { toast } from 'sonner';
import type { NotificationsRequest } from '@/types/api';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState<NotificationsRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshUnreadCount } = useNotifications();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      setNotifications(response.data || []);
    } catch (error: any) {
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      toast.success('Notificación marcada como leída');
      loadNotifications();
      refreshUnreadCount();
    } catch (error) {
      toast.error('Error al marcar como leída');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      toast.success('Notificación eliminada');
      loadNotifications();
      refreshUnreadCount();
    } catch (error) {
      toast.error('Error al eliminar notificación');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'signature':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'user':
        return <Users className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground">
            Mantente al día con todas tus notificaciones
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Archive className="w-4 h-4 mr-2" />
            Archivar todas
          </Button>
          <Button variant="outline">
            <Check className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay notificaciones</h3>
              <p className="text-muted-foreground text-center">
                Cuando tengas nuevas notificaciones, aparecerán aquí
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification, index) => (
            <Card 
              key={index} 
              className={`transition-all hover:shadow-md ${
                notification.status === 'unread' ? 'border-l-4 border-l-primary bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon('document')}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground">
                            {notification.data.title}
                          </h4>
                          {notification.status === 'unread' && (
                            <Badge variant="secondary" className="text-xs">
                              Nuevo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.data.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {formatTimeAgo(new Date().toISOString())}
                          </span>
                          {notification.data.metadata?.documentId && (
                            <span>
                              Doc: {notification.data.metadata.documentId.slice(-8)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {notification.status === 'unread' && (
                            <DropdownMenuItem onClick={() => handleMarkAsRead('notification-id')}>
                              <Check className="w-4 h-4 mr-2" />
                              Marcar como leída
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Archive className="w-4 h-4 mr-2" />
                            Archivar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteNotification('notification-id')}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsList;