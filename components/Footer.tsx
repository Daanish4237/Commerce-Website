import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t mt-16" style={{ borderColor: 'rgba(201,168,76,0.2)', backgroundColor: '#080808' }}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Image src="/Soho Jewels logo.jpeg" alt="Soho Jewels" width={100} height={50} unoptimized className="object-contain" />
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Timeless luxury jewellery crafted for those who appreciate the finest. Based in Malaysia.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--gold)' }}>Quick Links</p>
            {[
              { href: '/products', label: 'Shop' },
              { href: '/about', label: 'About Us' },
              { href: '/contact', label: 'Contact Us' },
              { href: '/wishlist', label: 'Favourites' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="text-xs text-gray-500 hover:text-yellow-400 transition-colors tracking-wider">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--gold)' }}>Contact</p>
            <p className="text-xs text-gray-500">sohomarketingnet@gmail.com</p>
            <p className="text-xs text-gray-500">Kuala Lumpur, Malaysia</p>
            <p className="text-xs text-gray-500">Mon – Sat, 10am – 8pm</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-2" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Soho Jewels. All rights reserved.</p>
          <p className="text-xs text-gray-700 tracking-widest uppercase">Luxury · Elegance · Craftsmanship</p>
        </div>
      </div>
    </footer>
  )
}
