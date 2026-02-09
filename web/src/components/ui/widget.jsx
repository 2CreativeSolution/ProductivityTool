import { forwardRef } from 'react'

import { cva } from 'class-variance-authority'

import { cn } from 'src/lib/utils'

const widgetVariants = cva('rounded-2xl border border-gray-200 bg-white', {
  variants: {
    shadow: {
      true: 'shadow-lg',
      false: '',
    },
  },
  defaultVariants: {
    shadow: false,
  },
})

const DEFAULT_HEADER_CLASS_NAME =
  'flex items-center justify-between gap-4 rounded-t-2xl border-b border-gray-200 bg-gray-50 px-6 py-4'
const DEFAULT_TITLE_CLASS_NAME = 'text-lg font-semibold text-gray-800'

const Widget = forwardRef(
  (
    {
      className,
      shadow = false,
      header = false,
      headerContent,
      title,
      headerRight,
      headerClassName,
      titleClassName,
      children,
      ...props
    },
    ref
  ) => {
    const hasLegacyHeaderNode = typeof header !== 'boolean'
    const resolvedHeaderContent = hasLegacyHeaderNode ? header : headerContent
    const shouldRenderHeader = hasLegacyHeaderNode ? true : header

    const renderedHeader = resolvedHeaderContent ? (
      resolvedHeaderContent
    ) : (
      <header className={cn(DEFAULT_HEADER_CLASS_NAME, headerClassName)}>
        {title ? (
          <h2 className={cn(DEFAULT_TITLE_CLASS_NAME, titleClassName)}>
            {title}
          </h2>
        ) : (
          <span />
        )}
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </header>
    )

    return (
      <section
        ref={ref}
        className={cn(widgetVariants({ shadow }), className)}
        {...props}
      >
        {shouldRenderHeader ? renderedHeader : null}
        {children}
      </section>
    )
  }
)

Widget.displayName = 'Widget'

export { Widget, widgetVariants }
