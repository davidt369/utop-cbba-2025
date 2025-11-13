import { create } from "zustand";
import { Cargo } from "@/types/cargo.types";

interface CargosStore {
  // Estados para diálogos
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;

  // Cargo seleccionado para editar/eliminar
  selectedCargo: Cargo | null;

  // Estados para filtros
  showDeleted: boolean;
  searchTerm: string;

  // Acciones para diálogos
  openCreateDialog: () => void;
  closeCreateDialog: () => void;

  openEditDialog: (cargo: Cargo) => void;
  closeEditDialog: () => void;

  openDeleteDialog: (cargo: Cargo) => void;
  closeDeleteDialog: () => void;

  // Acciones para filtros
  setShowDeleted: (show: boolean) => void;
  setSearchTerm: (term: string) => void;

  // Limpiar estado
  resetState: () => void;
}

export const useCargosStore = create<CargosStore>((set) => ({
  // Estado inicial
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  selectedCargo: null,
  showDeleted: false,
  searchTerm: "",

  // Acciones para diálogos de crear
  openCreateDialog: () => set({ isCreateDialogOpen: true }),
  closeCreateDialog: () => set({ isCreateDialogOpen: false }),

  // Acciones para diálogos de editar
  openEditDialog: (cargo: Cargo) =>
    set({
      isEditDialogOpen: true,
      selectedCargo: cargo,
    }),
  closeEditDialog: () =>
    set({
      isEditDialogOpen: false,
      selectedCargo: null,
    }),

  // Acciones para diálogos de eliminar
  openDeleteDialog: (cargo: Cargo) =>
    set({
      isDeleteDialogOpen: true,
      selectedCargo: cargo,
    }),
  closeDeleteDialog: () =>
    set({
      isDeleteDialogOpen: false,
      selectedCargo: null,
    }),

  // Acciones para filtros
  setShowDeleted: (show: boolean) => set({ showDeleted: show }),
  setSearchTerm: (term: string) => set({ searchTerm: term }),

  // Limpiar todo el estado
  resetState: () =>
    set({
      isCreateDialogOpen: false,
      isEditDialogOpen: false,
      isDeleteDialogOpen: false,
      selectedCargo: null,
      showDeleted: false,
      searchTerm: "",
    }),
}));
