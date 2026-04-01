'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-48 flex-shrink-0 border-r border-yellow-800 min-h-screen px-4 py-8" style={{ backgroundColor: '#111' }}>
      <p className="mb-6 text-xs uppercase tracking-widest text-gray-500">Admin</p>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href}
            className={`rounded px-3 py-2 text-sm font-medium transition-colors ${pathname.startsWith(link.href) ? 'bg-yellow-900' : 'hover:bg-yellow-900'}`}
            style={{ color: 'var(--gold)' }}>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
