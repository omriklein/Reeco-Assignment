import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { OrdersPage } from './pages/OrdersPage'
import { SupplierDetailPage } from './pages/SupplierDetailPage'
import { AnomaliesPage } from './pages/AnomaliesPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="suppliers/:id" element={<SupplierDetailPage />} />
        <Route path="anomalies" element={<AnomaliesPage />} />
      </Route>
    </Routes>
  )
}
