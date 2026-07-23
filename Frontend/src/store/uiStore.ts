import { create } from "zustand";

export interface SearchFilters {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  minPrice: string;
  maxPrice: string;
  amenities: string[];
  propertyType: string;
}

const defaultFilters: SearchFilters = {
  city: "",
  checkIn: "",
  checkOut: "",
  guests: 1,
  minPrice: "",
  maxPrice: "",
  amenities: [],
  propertyType: "",
};

interface UiState {
  searchFilters: SearchFilters;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  searchFilters: defaultFilters,
  setSearchFilters: (filters) =>
    set((s) => ({ searchFilters: { ...s.searchFilters, ...filters } })),
  resetFilters: () => set({ searchFilters: defaultFilters }),
}));
