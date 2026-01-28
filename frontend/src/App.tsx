import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Providers } from "components/providers";
import HomePage from "pages/HomePage";
import LoginPage from "pages/LoginPage";
import DashboardPage from "pages/DashboardPage";
import InventoryReceivePage from "pages/InventoryReceivePage";
import InventoryIssuePage from "pages/InventoryIssuePage";
// import ItemTypesPage from "pages/ItemTypesPage";
import TransactionsPage from "pages/TransactionsPage";
import ReportsPage from "pages/ReportsPage";
// import FinancePage from "pages/FinancePage";
// import AdminAdjustPage from "pages/AdminAdjustPage";
import "./App.css";

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<HomePage />}>
            <Route index element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inventory/receive" element={<InventoryReceivePage />} />
            <Route path="/inventory/issue" element={<InventoryIssuePage />} />
            {/* <Route path="/item-types" element={<ItemTypesPage />} /> */}
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            {/* <Route path="/finance" element={<FinancePage />} /> */}
            {/* <Route path="/admin/adjust" element={<AdminAdjustPage />} /> */}
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}
