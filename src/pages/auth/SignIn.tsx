import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { SignInForm } from "@/components/Form/SignInForm";
import { UpdatePasswordForm } from "@/components/Form/UpdatePasswordForm";
import { LangToggle } from "@/components/ui/LangToggle";

interface SignInInputs {
  email: string;
}

interface PasswordInputs {
  password: string;
  confirmPassword: string;
}

export default function SignInPage() {
  const [tab, setTab] = useState<'sign-in' | 'sign-in-password'>('sign-in');
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [loginError, setLoginError] = useState<string>("");
  const [updatePasswordError, setUpdatePasswordError] = useState<string>("");
  const [loginDisabled, setLoginDisabled] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: SignInInputs) => {
    try {
      setLoginError('');
      setIsLoadingLogin(true);
      setUserEmail(data.email);
      
      // Mock authentication - simulate checking if user needs to update password
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate different scenarios based on email
      if (data.email.includes('newuser')) {
        // New user - needs to set password
        setTab('sign-in-password');
      } else {
        // Existing user - direct login
        const mockAccessToken = `mock_access_${Date.now()}`;
        const mockRefreshToken = `mock_refresh_${Date.now()}`;
        
        login(mockAccessToken, mockRefreshToken);
        toast.success("Inicio de sesión exitoso");
        navigate("/");
      }
    } catch (error: any) {
      setLoginError("Error al iniciar sesión");
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const handleUpdateForm = async (data: PasswordInputs) => {
    try {
      setUpdatePasswordError('');
      setIsLoadingUpdate(true);
      
      // Mock password update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAccessToken = `mock_access_${Date.now()}`;
      const mockRefreshToken = `mock_refresh_${Date.now()}`;
      
      login(mockAccessToken, mockRefreshToken);
      toast.success("Contraseña actualizada exitosamente");
      navigate("/");
    } catch (error: any) {
      setUpdatePasswordError("Error al actualizar la contraseña");
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-adamo-sign-500 via-adamo-sign-600 to-adamo-sign-700">
      {tab === 'sign-in' && (
        <SignInForm 
          onSubmit={onSubmit} 
          isLoading={isLoadingLogin} 
          errorMessage={loginError} 
          disabled={loginDisabled} 
        />
      )}
      
      {tab === 'sign-in-password' && (
        <UpdatePasswordForm
          onSubmit={handleUpdateForm}
          isLoading={isLoadingUpdate}
          setIsPasswordUpdate={() => {}}
          errorMessage={updatePasswordError}
        />
      )}

      {tab === 'sign-in' && (
        <p className="mt-8 text-center">
          <span className="text-white/80">¿No tienes cuenta? </span>
          <Link className="font-semibold text-white hover:text-white/90" to="/register">
            Regístrate
          </Link>
        </p>
      )}

      <div className="mt-12 text-center">
        <LangToggle />
      </div>
    </div>
  );
}