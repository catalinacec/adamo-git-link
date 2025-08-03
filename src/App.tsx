import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SignatureProvider } from "@/context/SignatureContext";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Documents from "./pages/Documents";
import Contacts from "./pages/Contacts";
import Verify from "./pages/Verify";
import Notifications from "./pages/Notifications";
import DocumentViewer from "./pages/DocumentViewer";
import SignatureList from "./pages/SignatureList";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/auth/SignIn";
import SignUpPage from "./pages/auth/SignUp";
import VerifyCodePage from "./pages/auth/VerifyCode";
import { useAuth } from "@/context/AuthContext";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Auth Route Component
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Auth Routes */}
    <Route path="/auth" element={
      <AuthRoute>
        <SignInPage />
      </AuthRoute>
    } />
    <Route path="/register" element={
      <AuthRoute>
        <SignUpPage />
      </AuthRoute>
    } />
    <Route path="/verify" element={
      <AuthRoute>
        <VerifyCodePage />
      </AuthRoute>
    } />
    
    {/* Protected Routes */}
    <Route path="/" element={
      <ProtectedRoute>
        <Layout>
          <Index />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/documents" element={
      <ProtectedRoute>
        <Layout>
          <Documents />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/documents/:id" element={
      <ProtectedRoute>
        <Layout>
          <DocumentViewer />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/documents/:id/signatures" element={
      <ProtectedRoute>
        <Layout>
          <SignatureList />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/contacts" element={
      <ProtectedRoute>
        <Layout>
          <Contacts />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/notifications" element={
      <ProtectedRoute>
        <Layout>
          <Notifications />
        </Layout>
      </ProtectedRoute>
    } />
    
    {/* Fallback */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SignatureProvider>
            <AppRoutes />
          </SignatureProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;