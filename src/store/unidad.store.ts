import { create } from "zustand";
import { Unidad } from "@/types/unidad.types";

interface UnidadStoreState {
  // Estados de diálogos
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedUnidad: Unidad | null;

  // Estados de filtros
  searchTerm: string;
  showDeleted: boolean;

  // Acciones para diálogos
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  openEditDialog: (unidad: Unidad) => void;
  closeEditDialog: () => void;
  openDeleteDialog: (unidad: Unidad) => void;
  closeDeleteDialog: () => void;

  // Acciones para filtros
  setSearchTerm: (term: string) => void;
  setShowDeleted: (show: boolean) => void;
}

export const useUnidadStore = create<UnidadStoreState>((set) => ({
  // Estados iniciales de diálogos
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  selectedUnidad: null,

  // Estados iniciales de filtros
  searchTerm: "",
  showDeleted: false,

  // Acciones para diálogos
  openCreateDialog: () => set({ isCreateDialogOpen: true }),
  closeCreateDialog: () => set({ isCreateDialogOpen: false }),

  openEditDialog: (unidad) =>
    set({
      isEditDialogOpen: true,
      selectedUnidad: unidad,
    }),
  closeEditDialog: () =>
    set({
      isEditDialogOpen: false,
      selectedUnidad: null,
    }),

  openDeleteDialog: (unidad) =>
    set({
      isDeleteDialogOpen: true,
      selectedUnidad: unidad,
    }),
  closeDeleteDialog: () =>
    set({
      isDeleteDialogOpen: false,
      selectedUnidad: null,
    }),

  // Acciones para filtros
  setSearchTerm: (term) => set({ searchTerm: term }),
  setShowDeleted: (show) => set({ showDeleted: show }),
}));
