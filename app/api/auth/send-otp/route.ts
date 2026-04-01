import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateOtp } from '@/lib/otp-store'
import { sendMail } from '@/lib/email'

const bodySchema = z.object({
  userId: z.string().min(1),
})

/**
 * POST /api/auth/send-otp
 *
 * Called after a successful credential check when the admin's device is unrecognised.
 * Generates a 6-digit OTP, stores it in-memory with a 10-minute TTL, and emails it.
 *
 * Body: { userId: string }
 * Response: 200 { sent: true } | 400 | 404 | 500
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

    const { userId } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const otp = generateOtp(userId)

    try {
      await sendMail({
        to: user.email,
        subject: 'Soho Jewels — Admin Login OTP',
        text: `Your one-time password is: ${otp}\n\nThis code expires in 10 minutes.`,
        html: `<p>Your one-time password is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
      })
    } catch (emailErr) {
      console.error('Failed to send OTP email:', emailErr)
      // Don't expose email errors to the client; still return success to avoid enumeration
      // In production you'd want to log this to an alerting system
    }

    return NextResponse.json({ sent: true }, { status: 200 })
  } catch (err) {
    console.error('send-otp error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
