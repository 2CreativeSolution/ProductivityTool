import { cva } from 'class-variance-authority'

import { cn } from 'src/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog'

const appDialogContentVariants = cva('p-0', {
  variants: {
    size: {
      sm: 'sm:max-w-md',
      md: 'sm:max-w-lg',
      lg: 'sm:max-w-2xl',
      xl: 'sm:max-w-4xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

function AppDialog({ open, onOpenChange, children, ...props }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {children}
    </Dialog>
  )
}

function AppDialogContent({
  size = 'md',
  header = false,
  footer = false,
  title,
  description,
  headerContent,
  footerContent,
  scrollable = false,
  showCloseButton = true,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  children,
  ...props
}) {
  const shouldRenderHeader = Boolean(header || headerContent)
  const shouldRenderFooter = Boolean(footer || footerContent)

  return (
    <DialogContent
      showCloseButton={showCloseButton}
      className={cn(appDialogContentVariants({ size }), className)}
      {...props}
    >
      {shouldRenderHeader ? (
        <DialogHeader className={cn('px-6 pt-6', headerClassName)}>
          {title ? <DialogTitle>{title}</DialogTitle> : null}
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
          {headerContent ? headerContent : null}
        </DialogHeader>
      ) : null}

      <div
        className={cn(
          'px-6 py-6',
          shouldRenderHeader ? 'pt-4' : null,
          shouldRenderFooter ? 'pb-4' : null,
          scrollable ? 'max-h-[70vh] overflow-y-auto' : null,
          bodyClassName
        )}
      >
        {children}
      </div>

      {shouldRenderFooter ? (
        <DialogFooter className={cn('border-t px-6 py-4', footerClassName)}>
          {footerContent ? footerContent : null}
        </DialogFooter>
      ) : null}
    </DialogContent>
  )
}

export { AppDialog, AppDialogContent }
