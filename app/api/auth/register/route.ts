import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Validation error', details: ['Invalid JSON body'] },
      { status: 400 }
    )
  }

  const result = registerSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation error', details: result.error.errors.map((e) => e.message) },
      { status: 400 }
    )
  }

  const { name, email, password } = result.data
  const hashedPassword = await bcrypt.hash(password, 12)

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, email: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Conflict', field: 'email' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
