import { getServerSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen" style={{ color: 'white' }}>
      <AdminSidebar />
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  )
}
