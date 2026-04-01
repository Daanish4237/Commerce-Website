import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth('ADMIN')
  } catch (response) {
    return response as NextResponse
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Validation error', details: ['Invalid JSON body'] },
      { status: 400 }
    )
  }

  const result = createCategorySchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation error', details: result.error.errors.map((e) => e.message) },
      { status: 400 }
    )
  }

  try {
    const category = await prisma.category.create({
      data: { name: result.data.name },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Conflict', field: 'name' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
