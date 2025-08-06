import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function VerifyCodePage() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast.error("Por favor ingresa el código completo");
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock verification - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Código verificado exitosamente");
      navigate("/auth");
    } catch (error) {
      toast.error("Código inválido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      // Mock resend - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Código reenviado");
    } catch (error) {
      toast.error("Error al reenviar código");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">AdamoSign</h1>
          <p className="mt-2 text-gray-600">Verifica tu cuenta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verificación de Email</CardTitle>
            <CardDescription>
              Ingresa el código de 6 dígitos que enviamos a tu email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={6} 
                  value={code} 
                  onChange={setCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? "Verificando..." : "Verificar Código"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No recibiste el código?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
                >
                  {isResending ? "Reenviando..." : "Reenviar"}
                </button>
              </p>
              
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}