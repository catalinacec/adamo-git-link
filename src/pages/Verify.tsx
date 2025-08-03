import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";

const Verify = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Verificación de firma</h1>
      
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verificar documento
          </CardTitle>
          <CardDescription>
            Ingresa el código de verificación del documento firmado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Código de verificación" />
          <Button className="w-full">Verificar</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;