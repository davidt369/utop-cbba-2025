import { create } from "zustand";
import { Sancion, TipoSancion } from "@/types/sancion.types";

interface SancionesStore {
  // Estados para diálogos
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isBulkCreateDialogOpen: boolean;
  isRestoreDialogOpen: boolean;
  isViewDialogOpen: boolean;

  // Sanción seleccionada para editar/eliminar/ver
  selectedSancion: Sancion | null;

  // Estados para filtros
  showDeleted: boolean;
  searchTerm: string;
  tipoSancionFilter: TipoSancion | "all" | null;
  estadoActivaFilter: "all" | "activa" | "inactiva" | null;

  // Acciones para diálogos
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  openBulkCreateDialog: () => void;
  closeBulkCreateDialog: () => void;

  openEditDialog: (sancion: Sancion) => void;
  closeEditDialog: () => void;

  openDeleteDialog: (sancion: Sancion) => void;
  closeDeleteDialog: () => void;

  openRestoreDialog: (sancion: Sancion) => void;
  closeRestoreDialog: () => void;

  openViewDialog: (sancion: Sancion) => void;
  closeViewDialog: () => void;

  // Actualizar sanción seleccionada
  updateSelectedSancion: (sancion: Sancion) => void;

  // Acciones para filtros
  setShowDeleted: (show: boolean) => void;
  setSearchTerm: (term: string) => void;
  setTipoSancionFilter: (tipo: TipoSancion | "all" | null) => void;
  setEstadoActivaFilter: (estado: "all" | "activa" | "inactiva" | null) => void;

  // Limpiar estado
  resetState: () => void;
}

export const useSancionesStore = create<SancionesStore>((set) => ({
  // Estado inicial
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  isBulkCreateDialogOpen: false,
  isRestoreDialogOpen: false,
  isViewDialogOpen: false,
  selectedSancion: null,
  showDeleted: false,
  searchTerm: "",
  tipoSancionFilter: null,
  estadoActivaFilter: null,

  // Acciones para diálogos de crear
  openCreateDialog: () => set({ isCreateDialogOpen: true }),
  closeCreateDialog: () => set({ isCreateDialogOpen: false }),
  openBulkCreateDialog: () => set({ isBulkCreateDialogOpen: true }),
  closeBulkCreateDialog: () => set({ isBulkCreateDialogOpen: false }),

  // Acciones para diálogos de editar
  openEditDialog: (sancion: Sancion) =>
    set({
      selectedSancion: sancion,
      isEditDialogOpen: true,
    }),
  closeEditDialog: () =>
    set({
      selectedSancion: null,
      isEditDialogOpen: false,
    }),

  // Acciones para diálogos de eliminar
  openDeleteDialog: (sancion: Sancion) =>
    set({
      selectedSancion: sancion,
      isDeleteDialogOpen: true,
    }),
  closeDeleteDialog: () =>
    set({
      selectedSancion: null,
      isDeleteDialogOpen: false,
    }),

  // Acciones para diálogos de restaurar
  openRestoreDialog: (sancion: Sancion) =>
    set({
      selectedSancion: sancion,
      isRestoreDialogOpen: true,
    }),
  closeRestoreDialog: () =>
    set({
      selectedSancion: null,
      isRestoreDialogOpen: false,
    }),

  // Acciones para diálogos de ver
  openViewDialog: (sancion: Sancion) =>
    set({
      selectedSancion: sancion,
      isViewDialogOpen: true,
    }),
  closeViewDialog: () =>
    set({
      selectedSancion: null,
      isViewDialogOpen: false,
    }),

  // Actualizar sanción seleccionada
  updateSelectedSancion: (sancion: Sancion) =>
    set({ selectedSancion: sancion }),

  // Acciones para filtros
  setShowDeleted: (show: boolean) => set({ showDeleted: show }),
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setTipoSancionFilter: (tipo: TipoSancion | "all" | null) =>
    set({ tipoSancionFilter: tipo }),
  setEstadoActivaFilter: (estado: "all" | "activa" | "inactiva" | null) =>
    set({ estadoActivaFilter: estado }),

  // Limpiar estado
  resetState: () =>
    set({
      isCreateDialogOpen: false,
      isEditDialogOpen: false,
      isDeleteDialogOpen: false,
      isBulkCreateDialogOpen: false,
      isRestoreDialogOpen: false,
      isViewDialogOpen: false,
      selectedSancion: null,
      showDeleted: false,
      searchTerm: "",
      tipoSancionFilter: null,
      estadoActivaFilter: null,
    }),
}));
