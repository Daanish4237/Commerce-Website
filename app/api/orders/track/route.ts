import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { trackParcel } from '@/lib/easyparcel'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  let session
  try { session = await requireAuth() } catch (r) { return r as NextResponse }

  const orderId = req.nextUrl.searchParams.get('orderId')
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!order.trackingNumber || !order.courierName) {
    return NextResponse.json({ tracking: null, message: 'Not yet shipped' })
  }

  try {
    const tracking = await trackParcel(order.trackingNumber, order.courierName)
    return NextResponse.json({
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      status: order.status,
      shippedAt: order.shippedAt,
      tracking,
    })
  } catch {
    // Return basic info even if live tracking fails
    return NextResponse.json({
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      status: order.status,
      shippedAt: order.shippedAt,
      tracking: null,
    })
  }
}
