import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest) {
  try {
    await requireAuth('ADMIN')
  } catch (response) {
    return response as NextResponse
  }

  const { searchParams } = req.nextUrl
  let id = searchParams.get('id')

  if (!id) {
    try {
      const body = await req.json() as { id?: string }
      id = body.id ?? null
    } catch {
      // no body
    }
  }

  if (!id) {
    return NextResponse.json({ error: 'Validation error', details: ['id is required'] }, { status: 400 })
  }

  try {
    // Delete related records first to avoid foreign key constraint errors
    await prisma.cartItem.deleteMany({ where: { productId: id } })
    await prisma.wishlistItem.deleteMany({ where: { productId: id } })
    await prisma.review.deleteMany({ where: { productId: id } })
    // Note: orderItems are kept for order history — we just nullify the product reference isn't possible
    // so we only delete if no order items exist
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } })
    if (orderItemCount > 0) {
      return NextResponse.json({ error: 'Cannot delete product with existing orders' }, { status: 409 })
    }
    await prisma.product.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    console.error('Delete product error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
