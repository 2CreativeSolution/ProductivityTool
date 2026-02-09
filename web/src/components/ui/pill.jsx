import { cva } from 'class-variance-authority'

import { cn } from 'src/lib/utils'

const pillVariants = cva(
  'inline-flex items-center rounded-full font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700',
        brand: 'bg-[#322e85]/10 text-[#322e85]',
        info: 'bg-blue-100 text-blue-800',
      },
      size: {
        default: 'px-2.5 py-1 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Pill({ className, variant, size, ...props }) {
  return (
    <span
      data-slot="pill"
      className={cn(pillVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Pill, pillVariants }
