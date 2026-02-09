import { forwardRef } from 'react'

import { PasswordField, TextField } from '@redwoodjs/forms'

import { Input as ShadcnInput } from 'src/components/ui/input'
import { cn } from 'src/lib/utils'

const FORM_INPUT_CLASS_NAME =
  'h-12 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 transition-[border-color,box-shadow] focus:border-[#322e85] focus:outline-none focus:ring-2 focus:ring-[#322e85]/30 focus-visible:border-[#322e85] focus-visible:ring-2 focus-visible:ring-[#322e85]/30'
const FORM_INPUT_ERROR_CLASS_NAME =
  'h-12 rounded-lg border border-red-400 bg-white px-4 text-sm text-gray-800 transition-[border-color,box-shadow] focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-200'

const INPUT_SIZE_CLASS_NAME = {
  full: 'w-full',
  md: 'w-full max-w-[18.75rem]',
  sm: 'h-8 w-full max-w-[16rem] px-2.5',
}

const Input = forwardRef(
  (
    {
      framework = 'native',
      size = 'full',
      type = 'text',
      className,
      errorClassName,
      ...props
    },
    ref
  ) => {
    const sizeClassName =
      INPUT_SIZE_CLASS_NAME[size] ?? INPUT_SIZE_CLASS_NAME.full

    if (framework === 'redwood') {
      const resolvedClassName = cn(
        FORM_INPUT_CLASS_NAME,
        sizeClassName,
        className
      )
      const resolvedErrorClassName = cn(
        FORM_INPUT_ERROR_CLASS_NAME,
        sizeClassName,
        errorClassName
      )

      if (type === 'password') {
        return (
          <PasswordField
            ref={ref}
            className={resolvedClassName}
            errorClassName={resolvedErrorClassName}
            {...props}
          />
        )
      }

      return (
        <TextField
          ref={ref}
          type={type}
          className={resolvedClassName}
          errorClassName={resolvedErrorClassName}
          {...props}
        />
      )
    }

    return (
      <ShadcnInput
        ref={ref}
        type={type}
        className={cn(FORM_INPUT_CLASS_NAME, sizeClassName, className)}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
