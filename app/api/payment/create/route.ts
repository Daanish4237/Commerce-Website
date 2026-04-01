import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createBill } from '@/lib/billplz'

export const dynamic = 'force-dynamic'

const schema = z.object({ orderId: z.string().min(1) })

export async function POST(req: NextRequest) {
  let session
  try { session = await requireAuth() } catch (r) { return r as NextResponse }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Validation error', details: ['Invalid JSON'] }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', details: parsed.error.errors.map(e => e.message) }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { user: true },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (order.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const amountInSen = Math.round(Number(order.totalPrice) * 100)
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const collectionId = process.env.BILLPLZ_COLLECTION_ID ?? ''

  // Demo mode: if no Billplz credentials, mark order as PAID directly
  if (!process.env.BILLPLZ_API_KEY || !collectionId) {
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } }),
      ...((await prisma.orderItem.findMany({ where: { orderId: order.id } })).map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )),
    ])
    return NextResponse.json({ billUrl: `${baseUrl}/orders/success?orderId=${order.id}` })
  }

  try {
    const bill = await createBill({
      collectionId,
      email: order.user.email,
      name: order.user.name,
      amount: amountInSen,
      description: `Soho Jewels Order #${order.id}`,
      redirectUrl: `${baseUrl}/orders/success?orderId=${order.id}`,
      callbackUrl: `${baseUrl}/api/payment/callback`,
      reference1: order.id,
    })

    await prisma.order.update({ where: { id: order.id }, data: { billplzId: bill.id } })

    return NextResponse.json({ billUrl: bill.url })
  } catch {
    return NextResponse.json({ error: 'Payment gateway error' }, { status: 502 })
  }
}
