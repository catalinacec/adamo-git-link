import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AdamoLogo } from "@/components/ui/AdamoLogo";

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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <AdamoLogo width={180} height={100} />
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-adamo-sign-900">AdamoSign</h1>
          <p className="mt-2 text-neutral-600">Inicia sesión en tu cuenta</p>
        </div>

        <Card className="border-neutral-200 shadow-lg">
          <CardHeader className="bg-adamo-sign-600 text-white rounded-t-lg">
            <CardTitle className="text-white">Bienvenido</CardTitle>
            <CardDescription className="text-adamo-sign-100">
              Ingresa tu email y clave para acceder
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={tab} onValueChange={(value) => setTab(value as any)}>
              <TabsContent value="sign-in">
                <form onSubmit={handleEmailContinue} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-adamo-sign-700 font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="mt-1 border-neutral-300 focus:border-adamo-sign-500 focus:ring-adamo-sign-500"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-adamo-sign-600 hover:bg-adamo-sign-700 text-white"
                    size="large"
                  >
                    Continuar
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="sign-in-password">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="email-display" className="text-adamo-sign-700 font-medium">Email</Label>
                    <Input
                      id="email-display"
                      type="email"
                      value={email}
                      disabled
                      className="bg-neutral-50 border-neutral-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-adamo-sign-700 font-medium">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 border-neutral-300 focus:border-adamo-sign-500 focus:ring-adamo-sign-500"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => setTab('sign-in')}
                      className="flex-1"
                      size="large"
                    >
                      Atrás
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-adamo-sign-600 hover:bg-adamo-sign-700 text-white"
                      disabled={isLoading}
                      size="large"
                    >
                      {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                ¿No tienes una cuenta?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-adamo-sign-600 hover:text-adamo-sign-700 font-medium"
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