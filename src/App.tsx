import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/components/auth-provider";
import { AppLayout } from "@/components/layout/app-layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Auth from "./pages/Auth";
import AuditResult from "./pages/AuditResult";
import ClaimsHistory from "./pages/ClaimsHistory";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import NotFound from "./pages/NotFound.tsx";
import Processing from "./pages/Processing";
import Settings from "./pages/Settings";
import Upload from "./pages/Upload";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner richColors closeButton />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/processing/:id" element={<Processing />} />
                <Route path="/claims" element={<ClaimsHistory />} />
                <Route path="/claims/:id" element={<AuditResult />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
