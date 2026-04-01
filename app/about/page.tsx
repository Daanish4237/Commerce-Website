import OrnamentDivider from '@/components/OrnamentDivider'
import Image from 'next/image'

export const metadata = { title: 'About Us – Soho Jewels' }

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16" style={{ color: 'white' }}>
      <div className="text-center mb-12 animate-slide-up">
        <h1 className="text-4xl font-light tracking-[0.2em] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--gold)' }}>
          About Us
        </h1>
        <OrnamentDivider size="md" animate />
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-center mb-16 animate-slide-up-delay">
        <div className="flex-shrink-0">
          <Image
            src="/Soho Jewels logo.jpeg"
            alt="Soho Jewels"
            width={280}
            height={280}
            unoptimized
            className="rounded-lg object-contain"
          />
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-gray-300 leading-relaxed text-sm">
            Welcome to <span style={{ color: 'var(--gold)' }}>Soho Jewels</span> — where timeless elegance meets modern luxury. 
            We are a premier jewellery brand dedicated to crafting and curating the finest pieces that celebrate life&apos;s most precious moments.
          </p>
          <p className="text-gray-300 leading-relaxed text-sm">
            Every piece in our collection is carefully selected for its quality, craftsmanship, and beauty. 
            From dazzling diamonds to lustrous gold, our jewellery is designed to be treasured for generations.
          </p>
          <p className="text-gray-300 leading-relaxed text-sm">
            Based in Malaysia, we serve customers who appreciate the finer things in life. 
            Our commitment is to provide an exceptional shopping experience — from browsing our curated collection to the moment your jewellery arrives at your door.
          </p>
        </div>
      </div>

      <OrnamentDivider size="lg" animate className="my-12" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up-delay-2">
        {[
          { title: 'Our Mission', text: 'To make luxury jewellery accessible to everyone who appreciates beauty, quality, and craftsmanship.' },
          { title: 'Our Vision', text: 'To be the most trusted jewellery brand in Malaysia, known for excellence and elegance.' },
          { title: 'Our Values', text: 'Quality, integrity, and customer satisfaction are at the heart of everything we do.' },
        ].map((item) => (
          <div key={item.title} className="luxury-card p-6 text-center">
            <h3 className="text-lg font-light tracking-widest mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--gold)' }}>
              {item.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
