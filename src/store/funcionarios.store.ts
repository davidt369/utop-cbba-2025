import { create } from "zustand";
import { Funcionario } from "@/types/funcionario.types";

interface FuncionariosState {
  // Estados de diálogos
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;

  // Funcionario seleccionado para editar/eliminar
  selectedFuncionario: Funcionario | null;

  // Filtros
  showDeleted: boolean;
  searchTerm: string;
  estadoFilter: string;

  // Acciones para diálogos
  openCreateDialog: () => void;
  closeCreateDialog: () => void;

  openEditDialog: (funcionario: Funcionario) => void;
  closeEditDialog: () => void;

  openDeleteDialog: (funcionario: Funcionario) => void;
  closeDeleteDialog: () => void;

  // Acciones para filtros
  setShowDeleted: (show: boolean) => void;
  setSearchTerm: (term: string) => void;
  setEstadoFilter: (estado: string) => void;

  // Acción para limpiar todo
  clearSelection: () => void;
}

export const useFuncionariosStore = create<FuncionariosState>((set) => ({
  // Estados iniciales
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  selectedFuncionario: null,
  showDeleted: false,
  searchTerm: "",
  estadoFilter: "all",

  // Acciones para diálogos de crear
  openCreateDialog: () => set({ isCreateDialogOpen: true }),
  closeCreateDialog: () => set({ isCreateDialogOpen: false }),

  // Acciones para diálogos de editar
  openEditDialog: (funcionario) =>
    set({
      isEditDialogOpen: true,
      selectedFuncionario: funcionario,
    }),
  closeEditDialog: () =>
    set({
      isEditDialogOpen: false,
      selectedFuncionario: null,
    }),

  // Acciones para diálogos de eliminar
  openDeleteDialog: (funcionario) =>
    set({
      isDeleteDialogOpen: true,
      selectedFuncionario: funcionario,
    }),
  closeDeleteDialog: () =>
    set({
      isDeleteDialogOpen: false,
      selectedFuncionario: null,
    }),

  // Acciones para filtros
  setShowDeleted: (show) => set({ showDeleted: show }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setEstadoFilter: (estado) => set({ estadoFilter: estado }),

  // Acción para limpiar selección
  clearSelection: () =>
    set({
      selectedFuncionario: null,
      isEditDialogOpen: false,
      isDeleteDialogOpen: false,
      isCreateDialogOpen: false,
    }),
}));
