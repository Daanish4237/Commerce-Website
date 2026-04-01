/**
 * In-memory OTP store with TTL.
 * Key: userId, Value: { otp, expiresAt }
 *
 * NOTE: This is a module-level Map — suitable for single-instance deployments.
 * For multi-instance / serverless environments, replace with Redis.
 */

interface OtpEntry {
  otp: string
  expiresAt: number // Unix timestamp (ms)
}

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

const otpStore = new Map<string, OtpEntry>()

/** Generate a 6-digit numeric OTP and store it for the given userId. */
export function generateOtp(userId: string): string {
  const otp = String(Math.floor(100000 + Math.random() * 900000))
  otpStore.set(userId, { otp, expiresAt: Date.now() + OTP_TTL_MS })
  return otp
}

/** Verify an OTP for a userId. Returns true if valid and not expired. Deletes on success. */
export function verifyOtp(userId: string, otp: string): boolean {
  const entry = otpStore.get(userId)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(userId)
    return false
  }
  if (entry.otp !== otp) return false
  otpStore.delete(userId)
  return true
}

/** Remove any stored OTP for a userId (e.g. on logout or re-send). */
export function clearOtp(userId: string): void {
  otpStore.delete(userId)
}
