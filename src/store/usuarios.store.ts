import { create } from "zustand";
import { Usuario } from "@/types/usuario";

interface UsuariosState {
  // UI State
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedUsuario: Usuario | null;

  // Actions
  setCreateDialogOpen: (open: boolean) => void;
  setEditDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setSelectedUsuario: (usuario: Usuario | null) => void;

  // Combined actions
  openCreateDialog: () => void;
  openEditDialog: (usuario: Usuario) => void;
  openDeleteDialog: (usuario: Usuario) => void;
  closeAllDialogs: () => void;
}

export const useUsuariosStore = create<UsuariosState>((set) => ({
  // Initial UI State
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  selectedUsuario: null,

  // UI Actions
  setCreateDialogOpen: (open) => set({ isCreateDialogOpen: open }),
  setEditDialogOpen: (open) => set({ isEditDialogOpen: open }),
  setDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),
  setSelectedUsuario: (usuario) => set({ selectedUsuario: usuario }),

  // Combined Actions
  openCreateDialog: () =>
    set({
      isCreateDialogOpen: true,
      selectedUsuario: null,
    }),

  openEditDialog: (usuario) =>
    set({
      isEditDialogOpen: true,
      selectedUsuario: usuario,
    }),

  openDeleteDialog: (usuario) =>
    set({
      isDeleteDialogOpen: true,
      selectedUsuario: usuario,
    }),

  closeAllDialogs: () =>
    set({
      isCreateDialogOpen: false,
      isEditDialogOpen: false,
      isDeleteDialogOpen: false,
      selectedUsuario: null,
    }),
}));
