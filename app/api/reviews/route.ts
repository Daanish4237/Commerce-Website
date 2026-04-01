import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

const createSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
})

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId) {
    return NextResponse.json({ error: 'Validation error', details: ['productId is required'] }, { status: 400 })
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  let session
  try { session = await requireAuth() } catch (r) { return r as NextResponse }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Validation error', details: ['Invalid JSON'] }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', details: parsed.error.errors.map(e => e.message) }, { status: 400 })
  }

  const { productId, rating, comment } = parsed.data

  // Verify buyer has a PAID order containing this product
  const paidOrderItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId: session.user.id, status: 'PAID' },
    },
  })

  if (!paidOrderItem) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const review = await prisma.review.create({
      data: { userId: session.user.id, productId, rating, comment },
    })
    return NextResponse.json(review, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'Conflict', field: 'review' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
