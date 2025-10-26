import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HostCreate from "./pages/HostCreate";
import HostLobby from "./pages/HostLobby";
import HostPlay from "./pages/HostPlay";
import HostResults from "./pages/HostResults";
import Join from "./pages/Join";
import ParticipantLobby from "./pages/ParticipantLobby";
import ParticipantPlay from "./pages/ParticipantPlay";
import ParticipantResults from "./pages/ParticipantResults";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/host/create" element={<HostCreate />} />
          <Route path="/host/lobby/:quizId" element={<HostLobby />} />
          <Route path="/host/play/:quizId" element={<HostPlay />} />
          <Route path="/host/results/:quizId" element={<HostResults />} />
          <Route path="/join" element={<Join />} />
          <Route path="/play/lobby/:quizId/:participantId" element={<ParticipantLobby />} />
          <Route path="/play/:quizId/:participantId" element={<ParticipantPlay />} />
          <Route path="/play/results/:quizId/:participantId" element={<ParticipantResults />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
