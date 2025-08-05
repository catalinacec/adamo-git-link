import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AdamoLogo } from "@/components/ui/AdamoLogo";
import { Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-adamo-sign-500 via-adamo-sign-600 to-adamo-sign-700 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8">
        <AdamoLogo width={200} height={120} className="brightness-0 invert" />
      </div>
      
      {/* Subtitle */}
      <p className="text-white/90 text-lg mb-12 text-center">
        Inicia sesión en tu cuenta
      </p>

      {/* Login Form */}
      <div className="w-full max-w-sm space-y-6">
        <form onSubmit={handleSignIn} className="space-y-6">
          {/* Email Input */}
          <div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="w-full h-12 bg-white/95 border-0 rounded-lg text-adamo-sign-900 placeholder:text-neutral-500 text-base px-4 focus:ring-2 focus:ring-white/50 focus:bg-white"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full h-12 bg-white/95 border-0 rounded-lg text-adamo-sign-900 placeholder:text-neutral-500 text-base px-4 pr-12 focus:ring-2 focus:ring-white/50 focus:bg-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-white/90 hover:text-white text-sm underline"
            >
              ¿Olvidaste tu contraseña? Haz click aquí
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-white hover:bg-white/90 text-adamo-sign-700 font-semibold text-base rounded-lg border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? "Iniciando..." : "Iniciar sesión"}
          </Button>
        </form>
      </div>

      {/* Language Switch */}
      <div className="mt-16 text-center">
        <p className="text-white/70 text-sm">
          Switch to:{" "}
          <button className="text-white hover:text-white/90 underline">
            English
          </button>
        </p>
      </div>

      {/* Register Link */}
      <div className="mt-8 text-center">
        <p className="text-white/90 text-sm">
          ¿No tienes una cuenta?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-white hover:text-white/90 font-medium underline"
          >
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
}