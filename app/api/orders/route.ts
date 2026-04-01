import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const checkoutSchema = z.object({
  shippingName: z.string().min(1, 'Full name is required'),
  shippingPhone: z.string().min(1, 'Phone is required'),
  shippingAddress: z.string().min(1, 'Address is required'),
  shippingCity: z.string().min(1, 'City is required'),
  shippingState: z.string().min(1, 'State is required'),
  shippingPostcode: z.string().min(1, 'Postcode is required'),
  preferredCourier: z.string().min(1, 'Please select a courier'),
})

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

export async function POST(req: NextRequest) {
  let session
  try { session = await requireAuth() } catch (r) { return r as NextResponse }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', details: parsed.error.errors.map(e => e.message) }, { status: 400 })
  }

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
      ...parsed.data,
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
