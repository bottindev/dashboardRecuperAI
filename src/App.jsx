import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import ClientesPage from "@/pages/ClientesPage";
import ClientDetailPage from "@/pages/ClientDetailPage";
import RelatoriosPage from "@/pages/RelatoriosPage";
import CrmPage from "@/pages/CrmPage";
import ConfiguracoesPage from "@/pages/ConfiguracoesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<HomePage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="clientes/:id" element={<ClientDetailPage />} />
            <Route path="crm" element={<CrmPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
