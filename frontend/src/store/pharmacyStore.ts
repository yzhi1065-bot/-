import { create } from 'zustand'

interface Drug {
  id: number
  name: string
  category?: string
  specification?: string
  unit?: string
  price?: number
  stock?: number
}

interface PrescriptionItem {
  drug_id: number
  drug_name: string
  dosage: string
  unit: string
  frequency?: string
  duration?: string
  note?: string
}

interface Prescription {
  id?: number
  session_id?: number
  patient_id?: number
  items: PrescriptionItem[]
  total_price?: number
  note?: string
  status?: string
  created_at?: string
}

interface PharmacyState {
  drugList: Drug[]
  drugListLoading: boolean
  drugListTotal: number
  currentPrescription: Prescription | null
  setDrugList: (drugs: Drug[], total: number) => void
  setDrugListLoading: (loading: boolean) => void
  setCurrentPrescription: (prescription: Prescription | null) => void
  updatePrescriptionItems: (items: PrescriptionItem[]) => void
  clearPharmacy: () => void
}

export const usePharmacyStore = create<PharmacyState>((set) => ({
  drugList: [],
  drugListLoading: false,
  drugListTotal: 0,
  currentPrescription: null,

  setDrugList: (drugs, total) =>
    set({ drugList: drugs, drugListTotal: total }),

  setDrugListLoading: (loading) => set({ drugListLoading: loading }),

  setCurrentPrescription: (prescription) =>
    set({ currentPrescription: prescription }),

  updatePrescriptionItems: (items) =>
    set((state) => ({
      currentPrescription: state.currentPrescription
        ? { ...state.currentPrescription, items }
        : { items },
    })),

  clearPharmacy: () =>
    set({
      drugList: [],
      drugListTotal: 0,
      currentPrescription: null,
    }),
}))
