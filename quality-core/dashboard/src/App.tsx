import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/ThemeProvider'
import { QualityDataProvider } from '@/contexts/QualityDataContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import TestsPage from './pages/TestsPage'
import PerformancePage from './pages/PerformancePage'
import CoveragePage from './pages/CoveragePage'
import HistoryPage from './pages/HistoryPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import NotFound from './pages/NotFound'

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SettingsProvider>
        <QualityDataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<DashboardLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tests" element={<TestsPage />} />
                  <Route path="/performance" element={<PerformancePage />} />
                  <Route path="/coverage" element={<CoveragePage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QualityDataProvider>
      </SettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
)

export default App
