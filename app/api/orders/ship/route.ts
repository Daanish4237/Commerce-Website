import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createShipment } from '@/lib/easyparcel'

export const dynamic = 'force-dynamic'

const schema = z.object({
  orderId: z.string().min(1),
  courierCode: z.string().min(1),
  // Sender details (your store)
  senderName: z.string().min(1),
  senderPhone: z.string().min(1),
  senderAddress: z.string().min(1),
  senderPostcode: z.string().min(1),
  senderCity: z.string().min(1),
  senderState: z.string().min(1),
  // Receiver details
  receiverName: z.string().min(1),
  receiverPhone: z.string().min(1),
  receiverAddress: z.string().min(1),
  receiverPostcode: z.string().min(1),
  receiverCity: z.string().min(1),
  receiverState: z.string().min(1),
  weight: z.coerce.number().positive(),
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

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: { include: { product: true } } },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (order.status !== 'PAID') return NextResponse.json({ error: 'Order must be PAID before shipping' }, { status: 400 })

  const content = order.items.map(i => i.product.name).join(', ')
  const value = Number(order.totalPrice)

  try {
    const shipment = await createShipment({
      ...parsed.data,
      content,
      value,
      orderId: order.id,
    })

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'SHIPPED',
        trackingNumber: shipment.awb_no,
        courierName: shipment.courier_name,
        shippedAt: new Date(),
      },
    })

    return NextResponse.json({
      trackingNumber: shipment.awb_no,
      courierName: shipment.courier_name,
      labelUrl: shipment.label_url,
    })
  } catch (err) {
    console.error('EasyParcel error:', err)
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 502 })
  }
}
