import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Called from the success page to confirm payment and update order status
export async function POST(req: NextRequest) {
  let session
  try { session = await requireAuth() } catch (r) { return r as NextResponse }

  const { orderId, sessionId } = await req.json()

  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || !sessionId) {
    // Demo mode — order already marked PAID
    return NextResponse.json({ ok: true })
  }

  const stripe = new Stripe(stripeKey)

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
    if (checkoutSession.payment_status === 'paid') {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })
      if (order && order.status === 'PENDING' && order.userId === session.user.id) {
        await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } })
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })
  }
}
