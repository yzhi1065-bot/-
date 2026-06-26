import { create } from 'zustand'

interface FourDiagnosis {
  inspection?: string   // 望诊
  auscultation?: string // 闻诊
  inquiry?: string      // 问诊
  palpation?: string    // 切诊
  tongue?: string       // 舌诊
  pulse?: string        // 脉诊
}

interface DiagnosisSession {
  id: number
  patient_id: number
  patient_name?: string
  chief_complaint?: string
  status: string
  created_at?: string
}

interface DiagnosisState {
  currentSession: DiagnosisSession | null
  draftFourDiagnosis: FourDiagnosis
  sessionList: DiagnosisSession[]
  sessionListLoading: boolean
  setCurrentSession: (session: DiagnosisSession | null) => void
  setDraftFourDiagnosis: (draft: FourDiagnosis) => void
  updateFourDiagnosisField: (field: keyof FourDiagnosis, value: string) => void
  setSessionList: (sessions: DiagnosisSession[]) => void
  setSessionListLoading: (loading: boolean) => void
  clearDiagnosis: () => void
}

export const useDiagnosisStore = create<DiagnosisState>((set) => ({
  currentSession: null,
  draftFourDiagnosis: {},
  sessionList: [],
  sessionListLoading: false,

  setCurrentSession: (session) => set({ currentSession: session }),

  setDraftFourDiagnosis: (draft) => set({ draftFourDiagnosis: draft }),

  updateFourDiagnosisField: (field, value) =>
    set((state) => ({
      draftFourDiagnosis: { ...state.draftFourDiagnosis, [field]: value },
    })),

  setSessionList: (sessions) => set({ sessionList: sessions }),

  setSessionListLoading: (loading) => set({ sessionListLoading: loading }),

  clearDiagnosis: () =>
    set({
      currentSession: null,
      draftFourDiagnosis: {},
    }),
}))
