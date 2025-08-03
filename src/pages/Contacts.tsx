import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Contacts = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contactos</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo contacto
        </Button>
      </div>
      
      <div className="grid gap-4">
        <div className="p-6 border border-border rounded-lg">
          <p className="text-muted-foreground">No hay contactos aún. Agrega tu primer contacto.</p>
        </div>
      </div>
    </div>
  );
};

export default Contacts;