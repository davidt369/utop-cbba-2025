import { create } from "zustand";
import { FuncionarioCargo } from "@/types/funcionarioCargo.types";

interface FuncionarioCargoStore {
  // Estados de los diálogos
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isBulkDialogOpen: boolean; // Nuevo: diálogo de asignaciones masivas

  // Funcionario-cargo seleccionado para editar/eliminar
  selectedFuncionarioCargo: FuncionarioCargo | null;

  // Filtros
  showDeleted: boolean;
  searchTerm: string;
  tipoAreaFilter: string; // 'all', 'Administrativa', 'Operativa'

  // Acciones para diálogos
  openCreateDialog: () => void;
  closeCreateDialog: () => void;

  openEditDialog: (funcionarioCargo: FuncionarioCargo) => void;
  closeEditDialog: () => void;

  openDeleteDialog: (funcionarioCargo: FuncionarioCargo) => void;
  closeDeleteDialog: () => void;

  openBulkDialog: () => void; // Nuevo: abrir diálogo masivo
  closeBulkDialog: () => void; // Nuevo: cerrar diálogo masivo

  // Acciones para filtros
  setShowDeleted: (show: boolean) => void;
  setSearchTerm: (term: string) => void;
  setTipoAreaFilter: (filter: string) => void;

  // Limpiar selección
  clearSelection: () => void;
}

export const useFuncionarioCargoStore = create<FuncionarioCargoStore>(
  (set) => ({
    // Estados iniciales
    isCreateDialogOpen: false,
    isEditDialogOpen: false,
    isDeleteDialogOpen: false,
    isBulkDialogOpen: false,
    selectedFuncionarioCargo: null,
    showDeleted: false,
    searchTerm: "",
    tipoAreaFilter: "all",

    // Acciones para diálogos
    openCreateDialog: () => set({ isCreateDialogOpen: true }),
    closeCreateDialog: () => set({ isCreateDialogOpen: false }),

    openEditDialog: (funcionarioCargo) =>
      set({
        selectedFuncionarioCargo: funcionarioCargo,
        isEditDialogOpen: true,
      }),
    closeEditDialog: () =>
      set({
        isEditDialogOpen: false,
        selectedFuncionarioCargo: null,
      }),

    openDeleteDialog: (funcionarioCargo) =>
      set({
        selectedFuncionarioCargo: funcionarioCargo,
        isDeleteDialogOpen: true,
      }),
    closeDeleteDialog: () =>
      set({
        isDeleteDialogOpen: false,
        selectedFuncionarioCargo: null,
      }),

    openBulkDialog: () => set({ isBulkDialogOpen: true }),
    closeBulkDialog: () => set({ isBulkDialogOpen: false }),

    // Acciones para filtros
    setShowDeleted: (show) => set({ showDeleted: show }),
    setSearchTerm: (term) => set({ searchTerm: term }),
    setTipoAreaFilter: (filter) => set({ tipoAreaFilter: filter }),

    // Limpiar selección
    clearSelection: () => set({ selectedFuncionarioCargo: null }),
  })
);
