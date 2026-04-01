import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const schema = z.object({ orderId: z.string().min(1) })

export async function POST(req: NextRequest) {
  let session
  try { session = await requireAuth() } catch (r) { return r as NextResponse }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { user: true, items: { include: { product: true } } },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (order.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  // Demo mode: no Stripe key configured
  if (!process.env.STRIPE_SECRET_KEY) {
    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } })
    await prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } })
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }
    return NextResponse.json({ billUrl: `${baseUrl}/orders/success?orderId=${order.id}` })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: order.user.email,
      line_items: order.items.map((item) => ({
        price_data: {
          currency: 'myr',
          product_data: { name: item.product.name },
          unit_amount: Math.round(Number(item.product.price) * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${baseUrl}/orders/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: { orderId: order.id },
    })

    await prisma.order.update({ where: { id: order.id }, data: { billplzId: checkoutSession.id } })

    return NextResponse.json({ billUrl: checkoutSession.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: 'Payment gateway error' }, { status: 502 })
  }
}
