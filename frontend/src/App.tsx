import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import PatientList from './pages/PatientList'
import PatientDetail from './pages/PatientDetail'
import DiagnosisWorkbench from './pages/DiagnosisWorkbench'
import AIDiagnosisPage from './pages/AIDiagnosisPage'
import PrescriptionPage from './pages/PrescriptionPage'
import DeviceManage from './pages/DeviceManage'
import StatisticsPage from './pages/StatisticsPage'
import AIConfigPage from './pages/AIConfigPage'
import PatientConsultPage from './pages/PatientConsultPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import ReportPage from './pages/ReportPage'
import PatientLayout from './pages/patient/PatientLayout'
import PatientRecordsPage from './pages/patient/PatientRecordsPage'
import PatientHealthPage from './pages/patient/PatientHealthPage'
import HerbQueryPage from './pages/patient/HerbQueryPage'
import FollowupPage from './pages/FollowupPage'
import MedicationPage from './pages/MedicationPage'
import ChartsPage from './pages/ChartsPage'
import TemplatePage from './pages/TemplatePage'
import DataExportPage from './pages/DataExportPage'
import CompatibilityCheckPage from './pages/CompatibilityCheckPage'
import AuditLogPage from './pages/AuditLogPage'
import SystemSettingsPage from './pages/SystemSettingsPage'
import DiagnosisHistoryPage from './pages/DiagnosisHistoryPage'
import NotificationPage from './pages/NotificationPage'
import QueuePage from './pages/QueuePage'
import DashboardScreenPage from './pages/DashboardScreenPage'
import FormulaComparePage from './pages/FormulaComparePage'
import ChiefComplaintPage from './pages/ChiefComplaintPage'
import HealthAdvicePage from './pages/HealthAdvicePage'
import SatisfactionPage from './pages/SatisfactionPage'
import SolarTermPage from './pages/SolarTermPage'
import SetupWizardPage from './pages/SetupWizardPage'
import DrugManagePage from './pages/DrugManagePage'
import PurchaseManagePage from './pages/PurchaseManagePage'
import SaleStatsPage from './pages/SaleStatsPage'
import ConsultationPage from './pages/ConsultationPage'
import UserManagePage from './pages/UserManagePage'
import SystemMaintainPage from './pages/SystemMaintainPage'
import NursingPage from './pages/NursingPage'
import FinancePage from './pages/FinancePage'
import FollowupManagePage from './pages/FollowupManagePage'
import MedicalRecordPage from './pages/MedicalRecordPage'
import SchedulePage from './pages/SchedulePage'
import ReportAnalysisPage from './pages/ReportAnalysisPage'
import LabTestPage from './pages/LabTestPage'
import InsurancePage from './pages/InsurancePage'
import ReferralPage from './pages/ReferralPage'
import HealthEduPage from './pages/HealthEduPage'
import PrescriptionFlowPage from './pages/PrescriptionFlowPage'
import AppointmentPage from './pages/AppointmentPage'
import MessagePushPage from './pages/MessagePushPage'
import EquipmentManagePage from './pages/EquipmentManagePage'
import LiveStatsPage from './pages/LiveStatsPage'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
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
  )
}
