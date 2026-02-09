import { Cog6ToothIcon } from '@heroicons/react/24/outline'

import { Link, routes } from '@redwoodjs/router'

import { useAuth } from 'src/auth'
import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import { buttonVariants } from 'src/components/ui/button'

const NotFoundPage = () => {
  const { currentUser } = useAuth()
  const heroText = '404'
  const showSidebar = Boolean(currentUser?.id)

  const content = (
    <section className="w-full max-w-6xl text-center">
      <div className="relative mx-auto mb-10 w-full max-w-5xl">
        <Cog6ToothIcon
          aria-hidden
          className="pointer-events-none absolute -left-2 top-4 h-48 w-48 text-slate-300/40"
          strokeWidth={0.3}
        />
        <Cog6ToothIcon
          aria-hidden
          className="-right-46 pointer-events-none absolute -top-36 h-[28rem] w-[28rem] text-slate-300/40"
          strokeWidth={0.3}
        />

        <div className="relative inline-block select-none leading-none">
          <div
            aria-hidden
            className="absolute left-3 top-5 text-[11rem] font-black tracking-[-0.06em] text-[#2a4fa9] md:text-[16rem]"
          >
            {heroText}
          </div>

          <div
            className="relative text-[11rem] font-black tracking-[-0.06em] md:text-[16rem]"
            style={{
              backgroundImage:
                'linear-gradient(180deg, #88a8ff 0%, #5c7fe0 58%, #4569c4 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 6px 16px rgba(50, 46, 133, 0.22)',
            }}
          >
            {heroText}
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 text-[11rem] font-black tracking-[-0.06em] md:text-[16rem]"
            style={{
              color: 'transparent',
              WebkitTextStroke: '2px rgba(255, 255, 255, 0.68)',
              textShadow:
                '-1px 0 rgba(255,255,255,.55), 0 1px rgba(255,255,255,.35)',
            }}
          >
            {heroText}
          </div>

          <div className="absolute -top-5 left-1/2 flex h-28 w-28 -translate-x-1/2 items-center justify-center rounded-full bg-[#79cf5d] text-7xl font-black text-white shadow-[0_14px_24px_rgba(68,170,50,0.35)]">
            !
          </div>
        </div>

        <div className="mx-auto mt-3 h-1 w-[90%] rounded bg-slate-700/80" />
      </div>

      <h2 className="text-4xl font-extrabold tracking-tight text-black sm:text-5xl">
        Oops! Something went wrong
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-xl text-slate-700">
        It looks like the page you were trying to reach isn&apos;t available.
        Get back on track.
      </p>

      <Link
        to={routes.home()}
        className={`${buttonVariants({
          variant: 'primary',
        })} mt-8 rounded-full px-10`}
      >
        Back To Home page
      </Link>
    </section>
  )

  if (showSidebar) {
    return (
      <>
        <AppSidebar />
        <AppContentShell className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#eef0f4] px-4 py-8">
          {content}
        </AppContentShell>
      </>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef0f4] px-4 py-8">
      {content}
    </main>
  )
}

export default NotFoundPage
