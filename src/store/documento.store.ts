import { create } from 'zustand';
import type { Documento } from '@/types/documento.types';

interface DocumentoDialogState {
  // Estados de los diálogos
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isViewDialogOpen: boolean;
  
  // Documento seleccionado
  selectedDocumento: Documento | null;
  
  // Filtros
  showDeleted: boolean;
  
  // Acciones para crear
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  
  // Acciones para editar
  openEditDialog: (documento: Documento) => void;
  closeEditDialog: () => void;
  
  // Acciones para eliminar
  openDeleteDialog: (documento: Documento) => void;
  closeDeleteDialog: () => void;
  
  // Acciones para ver
  openViewDialog: (documento: Documento) => void;
  closeViewDialog: () => void;
  
  // Acciones para filtros
  setShowDeleted: (show: boolean) => void;
  
  // Limpiar selección
  clearSelection: () => void;
}

export const useDocumentoStore = create<DocumentoDialogState>((set) => ({
  // Estados iniciales
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  isViewDialogOpen: false,
  selectedDocumento: null,
  showDeleted: false,
  
  // Acciones para crear
  openCreateDialog: () => set({ isCreateDialogOpen: true }),
  closeCreateDialog: () => set({ isCreateDialogOpen: false }),
  
  // Acciones para editar
  openEditDialog: (documento) => set({ 
    selectedDocumento: documento, 
    isEditDialogOpen: true 
  }),
  closeEditDialog: () => set({ 
    isEditDialogOpen: false, 
    selectedDocumento: null 
  }),
  
  // Acciones para eliminar
  openDeleteDialog: (documento) => set({ 
    selectedDocumento: documento, 
    isDeleteDialogOpen: true 
  }),
  closeDeleteDialog: () => set({ 
    isDeleteDialogOpen: false, 
    selectedDocumento: null 
  }),
  
  // Acciones para ver
  openViewDialog: (documento) => set({ 
    selectedDocumento: documento, 
    isViewDialogOpen: true 
  }),
  closeViewDialog: () => set({ 
    isViewDialogOpen: false, 
    selectedDocumento: null 
  }),
  
  // Acciones para filtros
  setShowDeleted: (show) => set({ showDeleted: show }),
  
  // Limpiar selección
  clearSelection: () => set({ selectedDocumento: null }),
}));