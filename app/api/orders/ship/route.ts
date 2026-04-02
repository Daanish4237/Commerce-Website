import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createShipment } from '@/lib/easyparcel'
import { OrderStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

const schema = z.object({
  orderId: z.string().min(1),
  courierCode: z.string().min(1),
  // Manual fallback (used when EasyParcel not configured)
  trackingNumber: z.string().optional(),
  // EasyParcel fields (required when API key is set)
  senderName: z.string().optional(),
  senderPhone: z.string().optional(),
  senderAddress: z.string().optional(),
  senderPostcode: z.string().optional(),
  senderCity: z.string().optional(),
  senderState: z.string().optional(),
  receiverName: z.string().optional(),
  receiverPhone: z.string().optional(),
  receiverAddress: z.string().optional(),
  receiverPostcode: z.string().optional(),
  receiverCity: z.string().optional(),
  receiverState: z.string().optional(),
  weight: z.coerce.number().optional(),
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
    include: { items: { include: { product: true } }, user: true },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (order.status !== 'PAID') return NextResponse.json({ error: 'Order must be PAID before shipping' }, { status: 400 })

  let trackingNumber = parsed.data.trackingNumber ?? ''
  let courierName = parsed.data.courierCode
  let labelUrl = ''

  // Use EasyParcel if API key is configured and full details provided
  if (process.env.EASYPARCEL_API_KEY && parsed.data.senderName && parsed.data.receiverName) {
    try {
      const content = order.items.map(i => i.product.name).join(', ')
      const shipment = await createShipment({
        courierCode: parsed.data.courierCode,
        senderName: parsed.data.senderName!,
        senderPhone: parsed.data.senderPhone!,
        senderAddress: parsed.data.senderAddress!,
        senderPostcode: parsed.data.senderPostcode!,
        senderCity: parsed.data.senderCity!,
        senderState: parsed.data.senderState!,
        receiverName: parsed.data.receiverName!,
        receiverPhone: parsed.data.receiverPhone!,
        receiverAddress: parsed.data.receiverAddress!,
        receiverPostcode: parsed.data.receiverPostcode!,
        receiverCity: parsed.data.receiverCity!,
        receiverState: parsed.data.receiverState!,
        weight: parsed.data.weight ?? 0.5,
        content,
        value: Number(order.totalPrice),
        orderId: order.id,
      })
      trackingNumber = shipment.awb_no
      courierName = shipment.courier_name
      labelUrl = shipment.label_url
    } catch (err) {
      console.error('EasyParcel error:', err)
      return NextResponse.json({ error: 'EasyParcel shipment creation failed' }, { status: 502 })
    }
  }

  if (!trackingNumber) {
    return NextResponse.json({ error: 'Tracking number is required' }, { status: 400 })
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.SHIPPED,
      trackingNumber,
      courierName,
      shippedAt: new Date(),
    },
  })

  return NextResponse.json({ trackingNumber, courierName, labelUrl })
}
