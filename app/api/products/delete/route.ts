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
    await prisma.product.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
