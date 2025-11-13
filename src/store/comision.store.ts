import { Comision } from "@/types/comision.types";
import { create } from "zustand";

interface ComisionState {
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedComision: Comision | null;
  showDeleted: boolean;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  openEditDialog: (comision: Comision) => void;
  closeEditDialog: () => void;
  openDeleteDialog: (comision: Comision) => void;
  closeDeleteDialog: () => void;
  setShowDeleted: (show: boolean) => void;
}

export const useComisionStore = create<ComisionState>((set) => ({
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  selectedComision: null,
  showDeleted: false,
  openCreateDialog: () => set({ isCreateDialogOpen: true }),
  closeCreateDialog: () => set({ isCreateDialogOpen: false }),
  openEditDialog: (comision) =>
    set({ isEditDialogOpen: true, selectedComision: comision }),
  closeEditDialog: () =>
    set({ isEditDialogOpen: false, selectedComision: null }),
  openDeleteDialog: (comision) =>
    set({ isDeleteDialogOpen: true, selectedComision: comision }),
  closeDeleteDialog: () =>
    set({ isDeleteDialogOpen: false, selectedComision: null }),
  setShowDeleted: (show) => set({ showDeleted: show }),
}));
