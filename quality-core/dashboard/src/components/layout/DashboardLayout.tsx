import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardHeader } from './DashboardHeader'
import { ConsoleModal } from '../dashboard/ConsoleModal'
import { ReportModal } from '../dashboard/ReportModal'
import { FileViewerModal } from '../dashboard/FileViewerModal'
import { QuickActionsModal } from '../dashboard/QuickActionsModal'
import { useQualityData } from '@/contexts/QualityDataContext'

export function DashboardLayout() {
  const {
    consoleState,
    setConsoleOpen,
    reportModalState,
    setReportModalOpen,
    fileViewerState,
    setFileViewerOpen,
    quickActionsOpen,
    setQuickActionsOpen,
  } = useQualityData()

  return (
    <div className="min-h-screen flex w-full bg-background">
      <ConsoleModal
        isOpen={consoleState.isOpen}
        onOpenChange={setConsoleOpen}
        title={consoleState.title}
        output={consoleState.output}
        isFinished={consoleState.isFinished}
        isSuccess={consoleState.isSuccess}
      />
      <ReportModal
        isOpen={reportModalState.isOpen}
        onOpenChange={setReportModalOpen}
        reportFile={reportModalState.reportFile}
      />
      <FileViewerModal
        isOpen={fileViewerState.isOpen}
        onOpenChange={setFileViewerOpen}
        filePath={fileViewerState.filePath}
        content={fileViewerState.content}
      />
      <QuickActionsModal
        isOpen={quickActionsOpen}
        onClose={() => setQuickActionsOpen(false)}
      />
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
