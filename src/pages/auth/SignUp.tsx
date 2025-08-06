import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (!formData.acceptTerms) {
      toast.error("Debes aceptar los términos y condiciones");
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock registration - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Registro exitoso. Verifica tu email.");
      navigate("/verify");
    } catch (error) {
      toast.error("Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">AdamoSign</h1>
          <p className="mt-2 text-gray-600">Crea tu cuenta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro</CardTitle>
            <CardDescription>
              Completa la información para crear tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Tu apellido"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="acceptTerms" 
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptTerms: checked === true }))
                  }
                />
                <Label htmlFor="acceptTerms" className="text-sm text-gray-600">
                  Acepto los términos y condiciones
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Registrando..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Inicia sesión
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}