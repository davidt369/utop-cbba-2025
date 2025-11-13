'use client';

import { ComisionCreateDialog } from './comision-create-dialog';
import { ComisionEditDialog } from './comision-edit-dialog';
import { ComisionDeleteDialog } from './comision-delete-dialog';

export function ComisionDialogs() {
  return (
    <>
      <ComisionCreateDialog />
      <ComisionEditDialog />
      <ComisionDeleteDialog />
    </>
  );
}