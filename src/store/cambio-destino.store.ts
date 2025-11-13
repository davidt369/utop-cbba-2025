import { create } from 'zustand';
import type { CambioDestino, CambioDestinoFilters } from '@/types/cambio-destino.types';

interface CambioDestinoStore {
  // 🗂️ Dialog States
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isRestoreDialogOpen: boolean;
  isViewDialogOpen: boolean;

  // 📝 Selected Data
  selectedCambioDestino: CambioDestino | null;
  cambioDestinoToDelete: CambioDestino | null;
  cambioDestinoToRestore: CambioDestino | null;

  // 🔍 Filters & Search
  filters: CambioDestinoFilters;
  searchTerm: string;

  // ⚙️ UI States
  showDeleted: boolean;
  isLoading: boolean;

  // 🎬 Dialog Actions
  openCreateDialog: () => void;
  closeCreateDialog: () => void;

  openEditDialog: (cambioDestino: CambioDestino) => void;
  closeEditDialog: () => void;

  openDeleteDialog: (cambioDestino: CambioDestino) => void;
  closeDeleteDialog: () => void;

  openRestoreDialog: (cambioDestino: CambioDestino) => void;
  closeRestoreDialog: () => void;

  openViewDialog: (cambioDestino: CambioDestino) => void;
  closeViewDialog: () => void;

  // 🔍 Filter Actions
  setFilters: (filters: Partial<CambioDestinoFilters>) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;

  // ⚙️ UI Actions
  setShowDeleted: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;

  // 🔄 Reset Actions
  resetDialogs: () => void;
  resetStore: () => void;
}

const initialFilters: CambioDestinoFilters = {
  withDeleted: false,
  funcionario: undefined,
  unidad: undefined,
  fecha_inicio: undefined,
  fecha_fin: undefined,
  activo: null,
};

export const useCambioDestinoStore = create<CambioDestinoStore>((set, get) => ({
  // 🗂️ Initial Dialog States
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  isRestoreDialogOpen: false,
  isViewDialogOpen: false,

  // 📝 Initial Selected Data
  selectedCambioDestino: null,
  cambioDestinoToDelete: null,
  cambioDestinoToRestore: null,

  // 🔍 Initial Filters & Search
  filters: initialFilters,
  searchTerm: '',

  // ⚙️ Initial UI States
  showDeleted: false,
  isLoading: false,

  // 🎬 Dialog Actions
  openCreateDialog: () => set({ isCreateDialogOpen: true }),
  closeCreateDialog: () => set({ 
    isCreateDialogOpen: false,
    selectedCambioDestino: null,
  }),

  openEditDialog: (cambioDestino: CambioDestino) => set({ 
    isEditDialogOpen: true,
    selectedCambioDestino: cambioDestino,
  }),
  closeEditDialog: () => set({ 
    isEditDialogOpen: false,
    selectedCambioDestino: null,
  }),

  openDeleteDialog: (cambioDestino: CambioDestino) => set({ 
    isDeleteDialogOpen: true,
    cambioDestinoToDelete: cambioDestino,
  }),
  closeDeleteDialog: () => set({ 
    isDeleteDialogOpen: false,
    cambioDestinoToDelete: null,
  }),

  openRestoreDialog: (cambioDestino: CambioDestino) => set({ 
    isRestoreDialogOpen: true,
    cambioDestinoToRestore: cambioDestino,
  }),
  closeRestoreDialog: () => set({ 
    isRestoreDialogOpen: false,
    cambioDestinoToRestore: null,
  }),

  openViewDialog: (cambioDestino: CambioDestino) => set({ 
    isViewDialogOpen: true,
    selectedCambioDestino: cambioDestino,
  }),
  closeViewDialog: () => set({ 
    isViewDialogOpen: false,
    selectedCambioDestino: null,
  }),

  // 🔍 Filter Actions
  setFilters: (newFilters: Partial<CambioDestinoFilters>) => {
    const currentFilters = get().filters;
    set({ 
      filters: { ...currentFilters, ...newFilters },
    });
  },

  setSearchTerm: (term: string) => set({ searchTerm: term }),

  clearFilters: () => set({ 
    filters: initialFilters,
    searchTerm: '',
  }),

  // ⚙️ UI Actions
  setShowDeleted: (show: boolean) => {
    const currentFilters = get().filters;
    set({ 
      showDeleted: show,
      filters: { ...currentFilters, withDeleted: show },
    });
  },

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  // 🔄 Reset Actions
  resetDialogs: () => set({
    isCreateDialogOpen: false,
    isEditDialogOpen: false,
    isDeleteDialogOpen: false,
    isRestoreDialogOpen: false,
    isViewDialogOpen: false,
    selectedCambioDestino: null,
    cambioDestinoToDelete: null,
    cambioDestinoToRestore: null,
  }),

  resetStore: () => set({
    isCreateDialogOpen: false,
    isEditDialogOpen: false,
    isDeleteDialogOpen: false,
    isRestoreDialogOpen: false,
    isViewDialogOpen: false,
    selectedCambioDestino: null,
    cambioDestinoToDelete: null,
    cambioDestinoToRestore: null,
    filters: initialFilters,
    searchTerm: '',
    showDeleted: false,
    isLoading: false,
  }),
}));