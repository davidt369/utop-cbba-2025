"use client";

import { DocumentoCreateDialog } from "./documento-create-dialog";
import { DocumentoEditDialog } from "./documento-edit-dialog";
import { DocumentoViewDialog } from "./documento-view-dialog";

export function DocumentoDialogs() {
  return (
    <>
      <DocumentoCreateDialog />
      <DocumentoEditDialog />
      <DocumentoViewDialog />
    </>
  );
}