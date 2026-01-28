import { getCurrentUser, requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CuratorDashboard } from '@/components/curator/Dashboard'

export default async function CuratorDashboardPage() {
  const user = await getCurrentUser()
  
  try {
    requireRole(user, 'CURATOR')
  } catch (error) {
    redirect('/unauthorized')
  }

  // If curator doesn't have a profile yet, redirect to creation page
  if (!(user as any).curatorProfileId) {
    redirect('/sell')
  }

  return <CuratorDashboard user={{ name: user?.name || 'Curator' }} />
} 
