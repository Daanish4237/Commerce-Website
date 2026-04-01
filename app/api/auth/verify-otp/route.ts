import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyOtp } from '@/lib/otp-store'

const bodySchema = z.object({
  userId: z.string().min(1),
  otp: z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits'),
  fingerprint: z.string().min(1),
})

/**
 * POST /api/auth/verify-otp
 *
 * Validates the OTP submitted by an admin after login from an unrecognised device.
 * On success: records the device in AdminDevice and returns { success: true }.
 * On failure: returns 401.
 *
 * Body: { userId: string; otp: string; fingerprint: string }
 * Response: 200 { success: true } | 400 | 401 | 500
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

    const { userId, otp, fingerprint } = parsed.data

    const valid = verifyOtp(userId, otp)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
    }

    // Record the trusted device (upsert to handle race conditions / re-registration)
    await prisma.adminDevice.upsert({
      where: { userId_fingerprint: { userId, fingerprint } },
      update: {}, // already exists — no-op
      create: { userId, fingerprint },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('verify-otp error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
