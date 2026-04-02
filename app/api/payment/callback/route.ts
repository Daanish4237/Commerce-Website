import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyBillplzSignature } from '@/lib/billplz'

export const dynamic = 'force-dynamic'

// Billplz sends a POST callback with form-encoded data
export async function POST(req: NextRequest) {
  const xSignatureSecret = process.env.BILLPLZ_X_SIGNATURE

  let params: Record<string, string> = {}
  try {
    const text = await req.text()
    for (const [k, v] of Array.from(new URLSearchParams(text).entries())) {
      params[k] = v
    }
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  // Verify signature if secret is configured
  if (xSignatureSecret) {
    const valid = verifyBillplzSignature(params, xSignatureSecret)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  }

  const orderId = params['x_reference_1'] ?? params['reference_1']
  const paid = params['x_paid'] === 'true'

  if (!orderId) return NextResponse.json({ ok: true })

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order || order.status !== 'PENDING') return NextResponse.json({ ok: true })

  if (paid) {
    await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } })
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }
  } else {
    await prisma.order.update({ where: { id: orderId }, data: { status: 'FAILED' } })
  }

  return NextResponse.json({ ok: true })
}
