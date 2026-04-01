import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyBillplzSignature } from '@/lib/billplz'

export async function POST(req: NextRequest) {
  const text = await req.text()
  const params: Record<string, string> = {}
  new URLSearchParams(text).forEach((v, k) => { params[k] = v })

  const secret = process.env.BILLPLZ_X_SIGNATURE_KEY ?? ''
  if (!verifyBillplzSignature(params, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const billplzId = params['id']
  const paid = params['paid'] === 'true'

  const order = await prisma.order.findFirst({ where: { billplzId }, include: { items: true } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Monotonic: don't re-process already-settled orders
  if (order.status !== 'PENDING') {
    return NextResponse.json({ ok: true })
  }

  if (paid) {
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } }),
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      ),
    ])
  } else {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'FAILED' } })
  }

  return NextResponse.json({ ok: true })
}
