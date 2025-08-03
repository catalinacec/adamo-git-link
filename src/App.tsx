import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SignatureProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/:id" element={<DocumentViewer />} />
              <Route path="/documents/:id/signatures" element={<SignatureList />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </SignatureProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
