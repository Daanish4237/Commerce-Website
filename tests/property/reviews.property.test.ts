import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// In-memory review store — mirrors app/api/reviews/route.ts logic
// ---------------------------------------------------------------------------
interface PaidOrder { userId: string; productId: string }
interface Review { userId: string; productId: string; rating: number; comment: string }

function makeReviewStore(paidOrders: PaidOrder[]) {
  const reviews: Review[] = []

  function submitReview(userId: string, productId: string, rating: number, comment: string): { status: number } {
    const hasPaidOrder = paidOrders.some((o) => o.userId === userId && o.productId === productId)
    if (!hasPaidOrder) return { status: 403 }

    const alreadyReviewed = reviews.some((r) => r.userId === userId && r.productId === productId)
    if (alreadyReviewed) return { status: 409 }

    reviews.push({ userId, productId, rating, comment })
    return { status: 201 }
  }

  return { submitReview, reviews }
}

// ---------------------------------------------------------------------------
// Property 8: Only verified buyers can review
// Feature: soho-jewels, Property 8: Only verified buyers can review
// Customer without a PAID order for the product → POST returns 403.
// Validates: Requirements 10.1, 10.2
// ---------------------------------------------------------------------------
describe('Property 8: Only verified buyers can review', () => {
  it('customer without a PAID order for the product gets 403', () => {
    // Feature: soho-jewels, Property 8: Only verified buyers can review
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), fc.integer({ min: 1, max: 5 }), fc.string({ minLength: 1 }), (userId, productId, rating, comment) => {
        // No paid orders at all
        const store = makeReviewStore([])
        const result = store.submitReview(userId, productId, rating, comment)
        expect(result.status).toBe(403)
      }),
      { numRuns: 10 }
    )
  })

  it('customer with a PAID order for the product can submit a review', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), fc.integer({ min: 1, max: 5 }), fc.string({ minLength: 1 }), (userId, productId, rating, comment) => {
        const store = makeReviewStore([{ userId, productId }])
        const result = store.submitReview(userId, productId, rating, comment)
        expect(result.status).toBe(201)
      }),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 9: One review per buyer per product
// Feature: soho-jewels, Property 9: One review per buyer per product
// Submitting a second review for same (userId, productId) returns 409.
// Validates: Requirements 10.4
// ---------------------------------------------------------------------------
describe('Property 9: One review per buyer per product', () => {
  it('second review for same (userId, productId) returns 409', () => {
    // Feature: soho-jewels, Property 9: One review per buyer per product
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), fc.integer({ min: 1, max: 5 }), fc.string({ minLength: 1 }), (userId, productId, rating, comment) => {
        const store = makeReviewStore([{ userId, productId }])
        const first = store.submitReview(userId, productId, rating, comment)
        expect(first.status).toBe(201)

        const second = store.submitReview(userId, productId, rating, comment)
        expect(second.status).toBe(409)

        const matches = store.reviews.filter((r) => r.userId === userId && r.productId === productId)
        expect(matches).toHaveLength(1)
      }),
      { numRuns: 10 }
    )
  })
})
