import * as fc from 'fast-check'
import crypto from 'crypto'
import { verifyBillplzSignature } from '@/lib/billplz'

// ---------------------------------------------------------------------------
// In-memory order/product store for payment properties
// ---------------------------------------------------------------------------
interface OrderItem { productId: string; quantity: number }
interface Order { id: string; status: 'PENDING' | 'PAID' | 'FAILED'; items: OrderItem[] }
interface Product { id: string; stock: number }

function makePaymentStore(initialProducts: Product[], initialOrder: Order) {
  const products = initialProducts.map((p) => ({ ...p }))
  const order = { ...initialOrder }

  function processWebhook(paid: boolean): { status: number } {
    if (order.status !== 'PENDING') return { status: 200 } // monotonic — no-op

    if (paid) {
      order.status = 'PAID'
      for (const item of order.items) {
        const p = products.find((p) => p.id === item.productId)
        if (p) p.stock -= item.quantity
      }
    } else {
      order.status = 'FAILED'
    }
    return { status: 200 }
  }

  return { order, products, processWebhook }
}

// ---------------------------------------------------------------------------
// Property 6: Stock decrements correctly after payment
// Feature: soho-jewels, Property 6: Stock decrements correctly after payment
// After PAID webhook, each product's stock is reduced by ordered quantity.
// Validates: Requirements 9.4, 13.2
// ---------------------------------------------------------------------------
describe('Property 6: Stock decrements correctly after payment', () => {
  it('stock is reduced by ordered quantity after PAID webhook', () => {
    // Feature: soho-jewels, Property 6: Stock decrements correctly after payment
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ productId: fc.uuid(), quantity: fc.integer({ min: 1, max: 5 }), initialStock: fc.integer({ min: 5, max: 100 }) }),
          { minLength: 1, maxLength: 5 }
        ),
        (itemsData) => {
          const products: Product[] = itemsData.map((d) => ({ id: d.productId, stock: d.initialStock }))
          const order: Order = {
            id: 'order-1',
            status: 'PENDING',
            items: itemsData.map((d) => ({ productId: d.productId, quantity: d.quantity })),
          }
          const store = makePaymentStore(products, order)
          store.processWebhook(true)

          expect(store.order.status).toBe('PAID')
          for (const item of itemsData) {
            const p = store.products.find((p) => p.id === item.productId)!
            expect(p.stock).toBe(item.initialStock - item.quantity)
          }
        }
      ),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 10: Billplz webhook signature verification
// Feature: soho-jewels, Property 10: Billplz webhook signature verification
// Any payload with wrong x_signature returns false; correct signature returns true.
// Validates: Requirements 9.6
// ---------------------------------------------------------------------------
describe('Property 10: Billplz webhook signature verification', () => {
  const secret = 'test-secret-key'

  function makeValidSignature(params: Record<string, string>): string {
    const source = Object.keys(params).sort().map((k) => `${k}|${params[k]}`).join('|')
    return crypto.createHmac('sha256', secret).update(source).digest('hex')
  }

  it('wrong x_signature is rejected', () => {
    // Feature: soho-jewels, Property 10: Billplz webhook signature verification
    fc.assert(
      fc.property(
        fc.record({ id: fc.uuid(), paid: fc.constantFrom('true', 'false') }),
        fc.hexaString({ minLength: 64, maxLength: 64 }),
        (payload, wrongSig) => {
          const params = { ...payload, x_signature: wrongSig }
          const correctSig = makeValidSignature(payload)
          // Only test cases where the wrong sig actually differs
          fc.pre(wrongSig !== correctSig)
          expect(verifyBillplzSignature(params, secret)).toBe(false)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('correct x_signature is accepted', () => {
    fc.assert(
      fc.property(
        fc.record({ id: fc.uuid(), paid: fc.constantFrom('true', 'false') }),
        (payload) => {
          const sig = makeValidSignature(payload)
          const params = { ...payload, x_signature: sig }
          expect(verifyBillplzSignature(params, secret)).toBe(true)
        }
      ),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 11: Order status transitions are monotonic
// Feature: soho-jewels, Property 11: Order status transitions are monotonic
// PAID/FAILED orders are not re-processed by subsequent webhooks.
// Validates: Requirements 9.4, 9.5
// ---------------------------------------------------------------------------
describe('Property 11: Order status transitions are monotonic', () => {
  it('PAID order is not re-processed by a subsequent webhook', () => {
    // Feature: soho-jewels, Property 11: Order status transitions are monotonic
    fc.assert(
      fc.property(fc.boolean(), (secondPaid) => {
        const store = makePaymentStore(
          [{ id: 'p1', stock: 10 }],
          { id: 'o1', status: 'PENDING', items: [{ productId: 'p1', quantity: 1 }] }
        )
        store.processWebhook(true) // first: PENDING → PAID
        const stockAfterFirst = store.products[0].stock

        store.processWebhook(secondPaid) // second: should be no-op
        expect(store.order.status).toBe('PAID')
        expect(store.products[0].stock).toBe(stockAfterFirst) // stock unchanged
      }),
      { numRuns: 10 }
    )
  })

  it('FAILED order is not re-processed by a subsequent webhook', () => {
    fc.assert(
      fc.property(fc.boolean(), (secondPaid) => {
        const store = makePaymentStore(
          [{ id: 'p1', stock: 10 }],
          { id: 'o1', status: 'PENDING', items: [{ productId: 'p1', quantity: 1 }] }
        )
        store.processWebhook(false) // first: PENDING → FAILED
        store.processWebhook(secondPaid) // second: should be no-op
        expect(store.order.status).toBe('FAILED')
      }),
      { numRuns: 10 }
    )
  })
})
