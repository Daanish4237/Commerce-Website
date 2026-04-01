import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  let session
  try { session = await requireAuth() } catch (r) { return r as NextResponse }

  const isAdmin = session.user.role === 'ADMIN'
  const orders = await prisma.order.findMany({
    where: isAdmin ? undefined : { userId: session.user.id },
    include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST() {
  let session
  try { session = await requireAuth() } catch (r) { return r as NextResponse }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  })

  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  )

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      totalPrice,
      status: 'PENDING',
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
    include: { items: true },
  })

  return NextResponse.json({ orderId: order.id }, { status: 201 })
}
