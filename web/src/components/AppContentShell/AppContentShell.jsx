import { cn } from 'src/lib/utils'

const AppContentShell = ({ className, children, ...props }) => {
  return (
    <main
      className={cn(
        'app-content-shell mb-8 mr-8 mt-20 lg:my-8 lg:ml-[var(--app-shell-left-offset)]',
        className
      )}
      {...props}
    >
      {children}
    </main>
  )
}

export default AppContentShell
