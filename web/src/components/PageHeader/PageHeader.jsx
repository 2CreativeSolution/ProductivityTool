import { cn } from 'src/lib/utils'

const PageHeader = ({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
  contentClassName,
}) => {
  return (
    <header
      className={cn(
        '-mx-8 mb-8 border-b border-slate-200 px-8 py-8',
        className
      )}
    >
      <div
        className={cn(
          'flex items-start justify-between gap-4',
          contentClassName
        )}
      >
        <div>
          <h1
            className={cn(
              'text-2xl font-normal text-slate-900',
              titleClassName
            )}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={cn(
                'mt-1 text-sm text-slate-600',
                descriptionClassName
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        {children ? (
          <div className="flex items-center gap-3">{children}</div>
        ) : null}
      </div>
    </header>
  )
}

export default PageHeader
