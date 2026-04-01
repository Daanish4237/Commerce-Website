/**
 * EasyParcel API client
 * Docs: https://easyparcel.com/my/en/api/
 */

const EP_BASE = 'https://api.easyparcel.com'

async function epRequest(endpoint: string, payload: Record<string, unknown>) {
  const apiKey = process.env.EASYPARCEL_API_KEY
  if (!apiKey) throw new Error('EASYPARCEL_API_KEY not set')

  const res = await fetch(`${EP_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api: apiKey, ...payload }),
  })

  if (!res.ok) throw new Error(`EasyParcel API error: ${res.status}`)
  return res.json()
}

export interface ShipmentRate {
  courier_id: string
  courier_name: string
  price: number
  delivery_time: string
}

/** Get shipping rates between two postcodes */
export async function getShippingRates(params: {
  fromPostcode: string
  toPostcode: string
  weight: number // kg
}): Promise<ShipmentRate[]> {
  const data = await epRequest('/shipment/rates', {
    pick_code: params.fromPostcode,
    send_code: params.toPostcode,
    weight: params.weight,
    country: 'MY',
    send_country: 'MY',
  })
  return data.result?.[0]?.rates ?? []
}

export interface CreateShipmentParams {
  courierCode: string
  senderName: string
  senderPhone: string
  senderAddress: string
  senderPostcode: string
  senderCity: string
  senderState: string
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  receiverPostcode: string
  receiverCity: string
  receiverState: string
  weight: number
  content: string
  value: number
  orderId: string
}

export interface ShipmentResult {
  awb_no: string       // tracking number
  courier_name: string
  label_url: string
}

/** Create a shipment and get tracking number */
export async function createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
  const data = await epRequest('/shipment/submit_shipment', {
    courier: params.courierCode,
    pick_name: params.senderName,
    pick_contact: params.senderPhone,
    pick_addr1: params.senderAddress,
    pick_code: params.senderPostcode,
    pick_city: params.senderCity,
    pick_state: params.senderState,
    pick_country: 'MY',
    send_name: params.receiverName,
    send_contact: params.receiverPhone,
    send_addr1: params.receiverAddress,
    send_code: params.receiverPostcode,
    send_city: params.receiverCity,
    send_state: params.receiverState,
    send_country: 'MY',
    weight: params.weight,
    content: params.content,
    value: params.value,
    order_id: params.orderId,
  })

  const result = data.result?.[0]
  if (!result?.awb_no) throw new Error('Failed to create shipment')

  return {
    awb_no: result.awb_no,
    courier_name: result.courier_name ?? params.courierCode,
    label_url: result.label_url ?? '',
  }
}

/** Track a parcel by AWB number */
export async function trackParcel(awbNo: string, courierCode: string) {
  const data = await epRequest('/shipment/tracking', {
    awb_no: awbNo,
    courier: courierCode,
  })
  return data.result?.[0] ?? null
}
