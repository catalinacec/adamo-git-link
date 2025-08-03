import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SignInPage() {
  const [tab, setTab] = useState<'sign-in' | 'sign-in-password'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor ingresa tu email");
      return;
    }
    
    setTab('sign-in-password');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock authentication - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAccessToken = `mock_access_${Date.now()}`;
      const mockRefreshToken = `mock_refresh_${Date.now()}`;
      
      login(mockAccessToken, mockRefreshToken);
      toast.success("Inicio de sesión exitoso");
      navigate("/");
    } catch (error) {
      toast.error("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">AdamoSign</h1>
          <p className="mt-2 text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenido</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(value) => setTab(value as any)}>
              <TabsContent value="sign-in">
                <form onSubmit={handleEmailContinue} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Continuar
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="sign-in-password">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="email-display">Email</Label>
                    <Input
                      id="email-display"
                      type="email"
                      value={email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setTab('sign-in')}
                      className="flex-1"
                    >
                      Atrás
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Regístrate
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}