import { create } from 'zustand'

interface Patient {
  id: number
  name: string
  gender?: string
  age?: number
  phone?: string
  chief_complaint?: string
  created_at?: string
}

interface PatientState {
  selectedPatient: Patient | null
  patientList: Patient[]
  patientListTotal: number
  patientListLoading: boolean
  setSelectedPatient: (patient: Patient | null) => void
  setPatientList: (patients: Patient[], total: number) => void
  setPatientListLoading: (loading: boolean) => void
  clearSelectedPatient: () => void
}

export const usePatientStore = create<PatientState>((set) => ({
  selectedPatient: null,
  patientList: [],
  patientListTotal: 0,
  patientListLoading: false,

  setSelectedPatient: (patient) => set({ selectedPatient: patient }),

  setPatientList: (patients, total) =>
    set({ patientList: patients, patientListTotal: total }),

  setPatientListLoading: (loading) => set({ patientListLoading: loading }),

  clearSelectedPatient: () => set({ selectedPatient: null }),
}))
