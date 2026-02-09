import { cva } from 'class-variance-authority'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

import { cn } from 'src/lib/utils'

const summaryMetricCardVariants = cva(
  'flex flex-col justify-between border border-slate-200 bg-white shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)]',
  {
    variants: {
      size: {
        default: 'min-h-[14rem] rounded-[24px] p-7',
        sm: 'min-h-[10rem] rounded-xl p-6',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

const trendPillVariants = cva(
  'inline-flex items-center gap-1 rounded-xl font-semibold',
  {
    variants: {
      tone: {
        positive: 'bg-emerald-100 text-emerald-700',
        negative: 'bg-rose-100 text-rose-700',
        neutral: 'bg-slate-100 text-slate-600',
      },
      size: {
        default: 'px-3 py-1 text-sm',
        sm: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'default',
    },
  }
)

const sizeTokenMap = {
  default: {
    title: 'text-[2.125rem] font-semibold leading-tight text-slate-900',
    value:
      'text-[3.25rem] font-bold leading-none tracking-tight text-slate-950',
    subtitle: 'mt-4 text-3xl leading-tight text-slate-500',
    icon: 'text-[#3868e8] [&_svg]:h-8 [&_svg]:w-8',
    trendIcon: 'h-4 w-4',
    valueRow: 'mt-8 gap-3',
  },
  sm: {
    title: 'text-lg font-semibold leading-tight text-slate-900',
    value:
      'text-[2.5rem] font-bold leading-none tracking-tight text-slate-950 md:text-4xl',
    subtitle: 'mt-3 text-sm leading-5 text-slate-500',
    icon: 'text-[#3868e8] [&_svg]:h-6 [&_svg]:w-6',
    trendIcon: 'h-3.5 w-3.5',
    valueRow: 'mt-4 gap-2',
  },
}

const trendToneByDirection = {
  positive: 'positive',
  up: 'positive',
  negative: 'negative',
  down: 'negative',
  neutral: 'neutral',
}

const trendIconByTone = {
  positive: ArrowUp,
  negative: ArrowDown,
  neutral: Minus,
}

function SummaryMetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  size = 'default',
  className,
  titleClassName,
  valueClassName,
  subtitleClassName,
  iconClassName,
}) {
  const sizeTokens = sizeTokenMap[size] || sizeTokenMap.default
  const trendTone = trendToneByDirection[trend?.direction] || 'neutral'
  const TrendIcon = trendIconByTone[trendTone]
  const showTrendIcon = trend?.showIcon !== false

  return (
    <article className={cn(summaryMetricCardVariants({ size, className }))}>
      <div className="flex items-start justify-between gap-4">
        <h3 className={cn(sizeTokens.title, titleClassName)}>{title}</h3>
        {icon ? (
          <div className={cn('shrink-0', sizeTokens.icon, iconClassName)}>
            {icon}
          </div>
        ) : null}
      </div>

      <div>
        <div className={cn('flex flex-wrap items-center', sizeTokens.valueRow)}>
          <p className={cn(sizeTokens.value, valueClassName)}>{value}</p>
          {trend?.label ? (
            <span
              className={cn(
                'max-w-full',
                trendPillVariants({ tone: trendTone, size })
              )}
            >
              {showTrendIcon ? (
                <TrendIcon className={sizeTokens.trendIcon} />
              ) : null}
              <span>{trend.label}</span>
            </span>
          ) : null}
        </div>

        {subtitle ? (
          <p className={cn(sizeTokens.subtitle, subtitleClassName)}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </article>
  )
}

export { SummaryMetricCard }
