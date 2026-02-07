import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import OutlookEmailTestComponent from 'src/components/OutlookEmailTestComponent/OutlookEmailTestComponent'
import PageHeader from 'src/components/PageHeader/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui'

const DIAGNOSTIC_TABS = [
  { id: 'email-testing', label: 'Email Testing' },
  { id: 'activity-logs', label: 'Activity Logs' },
]

const AdminDiagnosticsToolsPage = () => {
  return (
    <>
      <Metadata
        title="Diagnostics Tools"
        description="Admin diagnostics and system troubleshooting tools"
      />
      <AppSidebar />
      <AppContentShell>
        <section>
          <PageHeader title="Diagnostics Tools" />

          <Tabs defaultValue={DIAGNOSTIC_TABS[0].id}>
            <TabsList className="h-auto w-full justify-start gap-2 rounded-none border-b border-slate-200 bg-transparent p-0 pb-3">
              {DIAGNOSTIC_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="h-auto flex-none rounded-sm border-0 px-3 py-1.5 text-lg font-medium text-[#323358] shadow-none hover:bg-[#f5f6f8]/70 data-[state=active]:bg-[#f5f6f8] data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="email-testing" className="pt-6">
              <OutlookEmailTestComponent />
            </TabsContent>

            <TabsContent value="activity-logs" className="pt-6">
              <h3 className="text-xl font-semibold text-slate-900">
                Activity Logs
              </h3>
              <p className="mt-2 text-base text-slate-600">
                This section is empty for now. Content will be added in a
                follow-up update.
              </p>
            </TabsContent>
          </Tabs>
        </section>
      </AppContentShell>
    </>
  )
}

export default AdminDiagnosticsToolsPage
