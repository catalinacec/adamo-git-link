import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SignatureProvider } from "@/context/SignatureContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import DocumentList from "./pages/DocumentList";
import ContactsList from "./pages/ContactsList";
import NotificationsList from "./pages/NotificationsList";
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
  
  console.log('ProtectedRoute render - isAuthenticated:', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Redirecting to /auth because user not authenticated');
    return <Navigate to="/auth" replace />;
  }
  
  console.log('ProtectedRoute: Showing protected content');
  return <>{children}</>;
};

// Auth Route Component
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  console.log('AuthRoute render - isAuthenticated:', isAuthenticated);
  
  if (isAuthenticated) {
    console.log('AuthRoute: Redirecting to / because user is authenticated');
    return <Navigate to="/" replace />;
  }
  
  console.log('AuthRoute: Showing auth content');
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
          <Dashboard />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/documents" element={
      <ProtectedRoute>
        <Layout>
          <DocumentList />
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
          <ContactsList />
        </Layout>
      </ProtectedRoute>
    } />
    <Route path="/notifications" element={
      <ProtectedRoute>
        <Layout>
          <NotificationsList />
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
          <ProfileProvider>
            <DashboardProvider>
              <NotificationsProvider>
                <SignatureProvider>
                  <AppRoutes />
                </SignatureProvider>
              </NotificationsProvider>
            </DashboardProvider>
          </ProfileProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;