import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// In-memory wishlist store — mirrors app/api/wishlist/route.ts logic
// ---------------------------------------------------------------------------
interface WishlistItem { userId: string; productId: string }

function makeWishlistStore() {
  const items: WishlistItem[] = []

  function addToWishlist(userId: string, productId: string): { status: number } {
    if (items.find((i) => i.userId === userId && i.productId === productId)) {
      return { status: 409 }
    }
    items.push({ userId, productId })
    return { status: 201 }
  }

  function removeFromWishlist(userId: string, productId: string): { status: number } {
    const idx = items.findIndex((i) => i.userId === userId && i.productId === productId)
    if (idx === -1) return { status: 404 }
    items.splice(idx, 1)
    return { status: 204 }
  }

  function getItems(userId: string): WishlistItem[] {
    return items.filter((i) => i.userId === userId)
  }

  return { addToWishlist, removeFromWishlist, getItems, items }
}

// ---------------------------------------------------------------------------
// Property 5: Wishlist uniqueness invariant
// Feature: soho-jewels, Property 5: Wishlist uniqueness invariant
// Adding same product twice returns 409 and one WishlistItem exists.
// Validates: Requirements 8.4
// ---------------------------------------------------------------------------
describe('Property 5: Wishlist uniqueness invariant', () => {
  it('adding same product twice returns 409 and one WishlistItem exists', () => {
    // Feature: soho-jewels, Property 5: Wishlist uniqueness invariant
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), (userId, productId) => {
        const store = makeWishlistStore()
        const first = store.addToWishlist(userId, productId)
        expect(first.status).toBe(201)

        const second = store.addToWishlist(userId, productId)
        expect(second.status).toBe(409)

        const matches = store.getItems(userId).filter((i) => i.productId === productId)
        expect(matches).toHaveLength(1)
      }),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property: Wishlist remove round-trip
// Feature: soho-jewels, Property: Wishlist remove round-trip
// Add then remove item, WishlistItem no longer exists.
// Validates: Requirements 8.2
// ---------------------------------------------------------------------------
describe('Property: Wishlist remove round-trip', () => {
  it('removed item no longer appears in wishlist', () => {
    // Feature: soho-jewels, Property: Wishlist remove round-trip
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), (userId, productId) => {
        const store = makeWishlistStore()
        store.addToWishlist(userId, productId)
        store.removeFromWishlist(userId, productId)
        const item = store.getItems(userId).find((i) => i.productId === productId)
        expect(item).toBeUndefined()
      }),
      { numRuns: 10 }
    )
  })
})
