import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const schema = z.object({
  orderId: z.string().min(1),
  trackingNumber: z.string().min(1),
  courierName: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    await requireAuth('ADMIN')
  } catch (r) {
    return r as NextResponse
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', details: parsed.error.errors.map(e => e.message) }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (order.status !== 'PAID') return NextResponse.json({ error: 'Order must be PAID before shipping' }, { status: 400 })

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'SHIPPED' as never,
      trackingNumber: parsed.data.trackingNumber,
      courierName: parsed.data.courierName,
      shippedAt: new Date(),
    } as never,
  })

  return NextResponse.json({
    trackingNumber: parsed.data.trackingNumber,
    courierName: parsed.data.courierName,
  })
}
