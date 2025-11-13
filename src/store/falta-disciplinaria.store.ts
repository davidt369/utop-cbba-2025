import { create } from 'zustand';
import { FaltaDisciplinariaStore, FaltaDisciplinaria, TipoGravedad } from '@/types/falta-disciplinaria.types';

export const useFaltaDisciplinariaStore = create<FaltaDisciplinariaStore>((set) => ({
  // Estado inicial
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  selectedFalta: null,
  
  // Filtros
  searchTerm: '',
  gravedadFilter: 'todos',
  showDeleted: false,

  // Acciones para diálogos
  openCreateDialog: () => set({ isCreateDialogOpen: true }),
  closeCreateDialog: () => set({ isCreateDialogOpen: false }),
  
  openEditDialog: (falta: FaltaDisciplinaria) => set({ 
    isEditDialogOpen: true, 
    selectedFalta: falta 
  }),
  closeEditDialog: () => set({ 
    isEditDialogOpen: false, 
    selectedFalta: null 
  }),
  
  openDeleteDialog: (falta: FaltaDisciplinaria) => set({ 
    isDeleteDialogOpen: true, 
    selectedFalta: falta 
  }),
  closeDeleteDialog: () => set({ 
    isDeleteDialogOpen: false, 
    selectedFalta: null 
  }),

  // Acciones para filtros
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setGravedadFilter: (gravedad: TipoGravedad | 'todos') => set({ gravedadFilter: gravedad }),
  setShowDeleted: (show: boolean) => set({ showDeleted: show }),
  
  clearFilters: () => set({
    searchTerm: '',
    gravedadFilter: 'todos',
    showDeleted: false,
  }),
}));