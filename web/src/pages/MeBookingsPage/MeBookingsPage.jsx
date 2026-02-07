import { Metadata } from '@redwoodjs/web'

import AppContentShell from 'src/components/AppContentShell/AppContentShell'
import AppSidebar from 'src/components/AppSidebar/AppSidebar'
import { BookingForm } from 'src/components/Booking/Booking'
import PageHeader from 'src/components/PageHeader/PageHeader'

const MeBookingsPage = () => {
  return (
    <>
      <Metadata title="Bookings" description="Booking management" />
      <AppSidebar showQuickAccess={true} />
      <AppContentShell>
        <PageHeader title="Bookings" />
        <BookingForm />
      </AppContentShell>
    </>
  )
}

export default MeBookingsPage
