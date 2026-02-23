import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JobOffer } from '@/types';

interface OfferStore {
  selectedOffer: JobOffer | null;
  setSelectedOffer: (offer: JobOffer | null) => void;
  clearSelectedOffer: () => void;
}

export const useOfferStore = create<OfferStore>()(
  persist(
    (set) => ({
      selectedOffer: null,
      setSelectedOffer: (offer) => set({ selectedOffer: offer }),
      clearSelectedOffer: () => set({ selectedOffer: null }),
    }),
    {
      name: 'offer-store', // nombre de la clave en localStorage
    }
  )
);