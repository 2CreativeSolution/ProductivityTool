import * as React from 'react'

import { Input } from 'src/components/ui/input'
import { cn } from 'src/lib/utils'

const InputGroup = React.forwardRef(function InputGroup(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-slot="input-group"
      className={cn(
        'flex w-full items-stretch [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*:not(:first-child)]:border-l-0 [&>*]:rounded-none',
        className
      )}
      {...props}
    />
  )
})

const InputGroupAddon = React.forwardRef(function InputGroupAddon(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-slot="input-group-addon"
      className={cn(
        'border-input bg-muted text-muted-foreground inline-flex items-center border px-3 text-sm',
        className
      )}
      {...props}
    />
  )
})

const InputGroupInput = React.forwardRef(function InputGroupInput(
  { className, ...props },
  ref
) {
  return <Input ref={ref} className={cn('shadow-none', className)} {...props} />
})

export { InputGroup, InputGroupAddon, InputGroupInput }
