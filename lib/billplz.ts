import crypto from 'crypto'

const BILLPLZ_BASE_URL = 'https://www.billplz.com/api'

export async function createBill(params: {
  collectionId: string
  email: string
  name: string
  amount: number // in sen (cents)
  description: string
  redirectUrl: string
  callbackUrl: string
  reference1?: string
}): Promise<{ id: string; url: string }> {
  const apiKey = process.env.BILLPLZ_API_KEY
  if (!apiKey) throw new Error('BILLPLZ_API_KEY not set')

  const body = new URLSearchParams({
    collection_id: params.collectionId,
    email: params.email,
    name: params.name,
    amount: String(params.amount),
    description: params.description,
    redirect_url: params.redirectUrl,
    callback_url: params.callbackUrl,
    ...(params.reference1 ? { reference_1: params.reference1 } : {}),
  })

  const res = await fetch(`${BILLPLZ_BASE_URL}/v3/bills`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Billplz error response:', errText)
    throw new Error(`Billplz API error: ${res.status} - ${errText}`)
  }

  const data = await res.json() as { id: string; url: string }
  return { id: data.id, url: data.url }
}

export function verifyBillplzSignature(
  params: Record<string, string>,
  secret: string
): boolean {
  const source = Object.keys(params)
    .filter((k) => k !== 'x_signature')
    .sort()
    .map((k) => `${k}|${params[k]}`)
    .join('|')
  const expected = crypto.createHmac('sha256', secret).update(source).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.x_signature ?? ''))
  } catch {
    return false
  }
}
