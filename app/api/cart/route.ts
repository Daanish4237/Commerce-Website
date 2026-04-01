import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const addSchema = z.object({ productId: z.string().min(1) })
const removeSchema = z.object({ productId: z.string().min(1) })
const updateSchema = z.object({ productId: z.string().min(1), quantity: z.number().int().min(1) })

export async function GET() {
  let session
  try { session = await requireAuth() } catch (r) { return r as NextResponse }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { category: true } } },
    orderBy: { id: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  let session
  try { session = await requireAuth() } catch (r) { return r as NextResponse }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Validation error', details: ['Invalid JSON'] }, { status: 400 })
  }

  const parsed = addSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', details: parsed.error.errors.map(e => e.message) }, { status: 400 })
  }

  const { productId } = parsed.data
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { stock: true } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (product.stock === 0) return NextResponse.json({ error: 'Out of stock' }, { status: 400 })

  try {
    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      update: { quantity: { increment: 1 } },
      create: { userId: session.user.id, productId, quantity: 1 },
    })
    return NextResponse.json(item, { status: 200 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'Conflict' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  let session
  try { session = await requireAuth() } catch (r) { return r as NextResponse }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Validation error', details: ['Invalid JSON'] }, { status: 400 })
  }

  const parsed = removeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', details: parsed.error.errors.map(e => e.message) }, { status: 400 })
  }

  try {
    await prisma.cartItem.delete({
      where: { userId_productId: { userId: session.user.id, productId: parsed.data.productId } },
    })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  let session
  try { session = await requireAuth() } catch (r) { return r as NextResponse }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Validation error', details: ['Invalid JSON'] }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation error', details: parsed.error.errors.map(e => e.message) }, { status: 400 })
  }

  try {
    const item = await prisma.cartItem.update({
      where: { userId_productId: { userId: session.user.id, productId: parsed.data.productId } },
      data: { quantity: parsed.data.quantity },
    })
    return NextResponse.json(item)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
