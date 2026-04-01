import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const bodySchema = z.object({
  userId: z.string().min(1),
  fingerprint: z.string().min(1),
})

/**
 * POST /api/auth/check-device
 *
 * Checks whether a given (userId, fingerprint) pair is a recognised admin device.
 * Used during the admin login flow to decide whether to require 2FA.
 *
 * Body: { userId: string; fingerprint: string }
 * Response: 200 { recognised: boolean } | 400 | 500
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = bodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { userId, fingerprint } = parsed.data

    const device = await prisma.adminDevice.findUnique({
      where: { userId_fingerprint: { userId, fingerprint } },
      select: { id: true },
    })

    return NextResponse.json({ recognised: device !== null }, { status: 200 })
  } catch (err) {
    console.error('check-device error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
