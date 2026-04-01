import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    await requireAuth('ADMIN')
  } catch (r) {
    return r as NextResponse
  }

  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (order.status !== 'SHIPPED') return NextResponse.json({ error: 'Order must be SHIPPED' }, { status: 400 })

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'DELIVERED', deliveredAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
