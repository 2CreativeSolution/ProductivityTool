import { cn } from 'src/lib/utils'

function SupplyRequestCard({
  title,
  subtitle,
  icon,
  metrics,
  badges,
  details,
  notes,
  notesLabel = 'Admin Notes',
  footer,
  className,
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg transition-all duration-200 hover:shadow-2xl',
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="rounded-lg bg-blue-100 p-3">{icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle ? (
              <p className="text-sm text-gray-600">{subtitle}</p>
            ) : null}
            {metrics ? (
              <div className="mt-2 flex items-center space-x-4">{metrics}</div>
            ) : null}
          </div>
        </div>
        {badges ? (
          <div className="flex items-center space-x-2">{badges}</div>
        ) : null}
      </div>

      {details ? <div className="mb-4">{details}</div> : null}

      {notes ? (
        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{notesLabel}:</span> {notes}
          </p>
        </div>
      ) : null}

      {footer}
    </div>
  )
}

export default SupplyRequestCard
