import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

const Notifications = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Notificaciones</h1>
        <Badge variant="secondary">1</Badge>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Documento pendiente de firma</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              El documento "Contrato de servicios" está esperando tu firma.
            </p>
            <p className="text-xs text-muted-foreground mt-2">Hace 2 horas</p>
          </CardContent>
        </Card>
        
        <div className="p-6 border border-border rounded-lg">
          <p className="text-muted-foreground">No hay más notificaciones.</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;