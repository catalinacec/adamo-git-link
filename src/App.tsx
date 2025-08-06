import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInPage from "./pages/auth/SignIn";
import SignUpPage from "./pages/auth/SignUp";
import VerifyCodePage from "./pages/auth/VerifyCode";
import Dashboard from "./pages/Dashboard";
import DocumentList from "./pages/DocumentList";
import ContactsList from "./pages/ContactsList";
import NotificationsList from "./pages/NotificationsList";
import DocumentViewer from "./pages/DocumentViewer";
import SignatureList from "./pages/SignatureList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth" element={<SignInPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/verify" element={<VerifyCodePage />} />
          
          {/* App Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/documents" element={<DocumentList />} />
          <Route path="/documents/:id" element={<DocumentViewer />} />
          <Route path="/documents/:id/signatures" element={<SignatureList />} />
          <Route path="/contacts" element={<ContactsList />} />
          <Route path="/notifications" element={<NotificationsList />} />
          
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;