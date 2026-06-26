import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from './store/authStore'
import AppLayout from './components/AppLayout'

const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const PatientList = React.lazy(() => import('./pages/PatientList'))
const PatientDetail = React.lazy(() => import('./pages/PatientDetail'))
const DiagnosisWorkbench = React.lazy(() => import('./pages/DiagnosisWorkbench'))
const AIDiagnosisPage = React.lazy(() => import('./pages/AIDiagnosisPage'))
const PrescriptionPage = React.lazy(() => import('./pages/PrescriptionPage'))
const DeviceManage = React.lazy(() => import('./pages/DeviceManage'))
const StatisticsPage = React.lazy(() => import('./pages/StatisticsPage'))
const AIConfigPage = React.lazy(() => import('./pages/AIConfigPage'))
const PatientConsultPage = React.lazy(() => import('./pages/PatientConsultPage'))
const KnowledgeBasePage = React.lazy(() => import('./pages/KnowledgeBasePage'))
const ReportPage = React.lazy(() => import('./pages/ReportPage'))
const PatientLayout = React.lazy(() => import('./pages/patient/PatientLayout'))
const PatientRecordsPage = React.lazy(() => import('./pages/patient/PatientRecordsPage'))
const PatientHealthPage = React.lazy(() => import('./pages/patient/PatientHealthPage'))
const HerbQueryPage = React.lazy(() => import('./pages/patient/HerbQueryPage'))
const FollowupPage = React.lazy(() => import('./pages/FollowupPage'))
const MedicationPage = React.lazy(() => import('./pages/MedicationPage'))
const ChartsPage = React.lazy(() => import('./pages/ChartsPage'))
const TemplatePage = React.lazy(() => import('./pages/TemplatePage'))
const DataExportPage = React.lazy(() => import('./pages/DataExportPage'))
const CompatibilityCheckPage = React.lazy(() => import('./pages/CompatibilityCheckPage'))
const AuditLogPage = React.lazy(() => import('./pages/AuditLogPage'))
const SystemSettingsPage = React.lazy(() => import('./pages/SystemSettingsPage'))
const DiagnosisHistoryPage = React.lazy(() => import('./pages/DiagnosisHistoryPage'))
const NotificationPage = React.lazy(() => import('./pages/NotificationPage'))
const QueuePage = React.lazy(() => import('./pages/QueuePage'))
const DashboardScreenPage = React.lazy(() => import('./pages/DashboardScreenPage'))
const FormulaComparePage = React.lazy(() => import('./pages/FormulaComparePage'))
const ChiefComplaintPage = React.lazy(() => import('./pages/ChiefComplaintPage'))
const HealthAdvicePage = React.lazy(() => import('./pages/HealthAdvicePage'))
const SatisfactionPage = React.lazy(() => import('./pages/SatisfactionPage'))
const SolarTermPage = React.lazy(() => import('./pages/SolarTermPage'))
const SetupWizardPage = React.lazy(() => import('./pages/SetupWizardPage'))
const DrugManagePage = React.lazy(() => import('./pages/DrugManagePage'))
const PurchaseManagePage = React.lazy(() => import('./pages/PurchaseManagePage'))
const SaleStatsPage = React.lazy(() => import('./pages/SaleStatsPage'))
const ConsultationPage = React.lazy(() => import('./pages/ConsultationPage'))
const UserManagePage = React.lazy(() => import('./pages/UserManagePage'))
const SystemMaintainPage = React.lazy(() => import('./pages/SystemMaintainPage'))
const NursingPage = React.lazy(() => import('./pages/NursingPage'))
const FinancePage = React.lazy(() => import('./pages/FinancePage'))
const FollowupManagePage = React.lazy(() => import('./pages/FollowupManagePage'))
const MedicalRecordPage = React.lazy(() => import('./pages/MedicalRecordPage'))
const SchedulePage = React.lazy(() => import('./pages/SchedulePage'))
const ReportAnalysisPage = React.lazy(() => import('./pages/ReportAnalysisPage'))
const LabTestPage = React.lazy(() => import('./pages/LabTestPage'))
const InsurancePage = React.lazy(() => import('./pages/InsurancePage'))
const ReferralPage = React.lazy(() => import('./pages/ReferralPage'))
const HealthEduPage = React.lazy(() => import('./pages/HealthEduPage'))
const PrescriptionFlowPage = React.lazy(() => import('./pages/PrescriptionFlowPage'))
const AppointmentPage = React.lazy(() => import('./pages/AppointmentPage'))
const MessagePushPage = React.lazy(() => import('./pages/MessagePushPage'))
const EquipmentManagePage = React.lazy(() => import('./pages/EquipmentManagePage'))
const LiveStatsPage = React.lazy(() => import('./pages/LiveStatsPage'))

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Suspense fallback={<Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SetupWizardPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="diagnosis" element={<DiagnosisWorkbench />} />
          <Route path="diagnosis/:sessionId" element={<AIDiagnosisPage />} />
          <Route path="prescription/:sessionId" element={<PrescriptionPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="devices" element={<DeviceManage />} />
          <Route path="ai-config" element={<AIConfigPage />} />
          <Route path="patient-consult" element={<PatientConsultPage />} />
          <Route path="knowledge" element={<KnowledgeBasePage />} />
          <Route path="report/:sessionId" element={<ReportPage />} />
          <Route path="patient/*" element={<PatientLayout />} />
          <Route path="followup" element={<FollowupPage />} />
          <Route path="medication" element={<MedicationPage />} />
          <Route path="charts" element={<ChartsPage />} />
          <Route path="templates" element={<TemplatePage />} />
          <Route path="data-export" element={<DataExportPage />} />
          <Route path="compatibility" element={<CompatibilityCheckPage />} />
          <Route path="audit-log" element={<AuditLogPage />} />
          <Route path="settings" element={<SystemSettingsPage />} />
          <Route path="diagnosis-history" element={<DiagnosisHistoryPage />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="queue" element={<QueuePage />} />
          <Route path="dashboard-screen" element={<DashboardScreenPage />} />
          <Route path="formula-compare" element={<FormulaComparePage />} />
          <Route path="chief-complaint" element={<ChiefComplaintPage />} />
          <Route path="health-advice" element={<HealthAdvicePage />} />
          <Route path="satisfaction" element={<SatisfactionPage />} />
          <Route path="solar-term" element={<SolarTermPage />} />
          <Route path="pharmacy/drugs" element={<DrugManagePage />} />
          <Route path="pharmacy/purchases" element={<PurchaseManagePage />} />
          <Route path="pharmacy/sales" element={<SaleStatsPage />} />
          <Route path="consultation" element={<ConsultationPage />} />
          <Route path="user-manage" element={<UserManagePage />} />
          <Route path="system-maintain" element={<SystemMaintainPage />} />
          <Route path="nursing" element={<NursingPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="followup-manage" element={<FollowupManagePage />} />
          <Route path="medical-record" element={<MedicalRecordPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="report-analysis" element={<ReportAnalysisPage />} />
          <Route path="lab-test" element={<LabTestPage />} />
          <Route path="insurance" element={<InsurancePage />} />
          <Route path="referral" element={<ReferralPage />} />
          <Route path="health-edu" element={<HealthEduPage />} />
          <Route path="prescription-flow" element={<PrescriptionFlowPage />} />
          <Route path="appointment" element={<AppointmentPage />} />
          <Route path="message-push" element={<MessagePushPage />} />
          <Route path="equipment" element={<EquipmentManagePage />} />
          <Route path="live-stats" element={<LiveStatsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
