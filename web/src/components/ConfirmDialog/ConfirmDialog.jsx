import React from 'react'

import { AppDialog, AppDialogContent } from 'src/components/ui/app-dialog'
import { Button } from 'src/components/ui/button'
import { DialogClose } from 'src/components/ui/dialog'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
}) => {
  const confirmVariant = type === 'danger' ? 'destructive' : 'primary'

  return (
    <AppDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AppDialogContent
        size="sm"
        header
        footer
        title={title}
        description={message}
        footerContent={
          <div className="flex items-center justify-end gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {cancelText}
              </Button>
            </DialogClose>
            <Button type="button" variant={confirmVariant} onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        }
      />
    </AppDialog>
  )
}

export default ConfirmDialog
