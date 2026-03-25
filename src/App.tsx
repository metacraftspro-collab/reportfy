import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Auth from "./pages/Auth.tsx";
import Index from "./pages/Index.tsx";
import CreateMenuUpdate from "./pages/CreateMenuUpdate.tsx";
import CreatePlatformReport from "./pages/CreatePlatformReport.tsx";
import CreateTimingNotice from "./pages/CreateTimingNotice.tsx";
import CreateLetter from "./pages/CreateLetter.tsx";
import Install from "./pages/Install.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/create/menu-update" element={<CreateMenuUpdate />} />
      <Route path="/create/platform" element={<CreatePlatformReport />} />
      <Route path="/create/operational-timing" element={<CreateTimingNotice />} />
      <Route path="/create/letter" element={<CreateLetter />} />
      <Route path="/install" element={<Install />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
