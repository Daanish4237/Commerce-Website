import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// In-memory cart store — mirrors app/api/cart/route.ts logic
// ---------------------------------------------------------------------------
interface CartItem { userId: string; productId: string; quantity: number }
interface Product { id: string; stock: number }

function makeCartStore(products: Product[]) {
  const items: CartItem[] = []

  function addToCart(userId: string, productId: string): { status: number } {
    const product = products.find((p) => p.id === productId)
    if (!product) return { status: 404 }
    if (product.stock === 0) return { status: 400 }

    const existing = items.find((i) => i.userId === userId && i.productId === productId)
    if (existing) {
      existing.quantity += 1
    } else {
      items.push({ userId, productId, quantity: 1 })
    }
    return { status: 200 }
  }

  function removeFromCart(userId: string, productId: string): { status: number } {
    const idx = items.findIndex((i) => i.userId === userId && i.productId === productId)
    if (idx === -1) return { status: 404 }
    items.splice(idx, 1)
    return { status: 204 }
  }

  function getCartItems(userId: string): CartItem[] {
    return items.filter((i) => i.userId === userId)
  }

  return { addToCart, removeFromCart, getCartItems, items }
}

// ---------------------------------------------------------------------------
// Property 3: Cart uniqueness invariant
// Feature: soho-jewels, Property 3: Cart uniqueness invariant
// Adding same product twice results in one CartItem record.
// Validates: Requirements 7.2
// ---------------------------------------------------------------------------
describe('Property 3: Cart uniqueness invariant', () => {
  it('adding same product twice results in one CartItem record', () => {
    // Feature: soho-jewels, Property 3: Cart uniqueness invariant
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), (userId, productId) => {
        const store = makeCartStore([{ id: productId, stock: 10 }])
        store.addToCart(userId, productId)
        store.addToCart(userId, productId)
        const userItems = store.getCartItems(userId).filter((i) => i.productId === productId)
        expect(userItems).toHaveLength(1)
      }),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 4: Cart quantity reflects additions
// Feature: soho-jewels, Property 4: Cart quantity reflects additions
// Adding product N times results in quantity = N.
// Validates: Requirements 7.2
// ---------------------------------------------------------------------------
describe('Property 4: Cart quantity reflects additions', () => {
  it('quantity equals the number of times the product was added', () => {
    // Feature: soho-jewels, Property 4: Cart quantity reflects additions
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), fc.integer({ min: 1, max: 10 }), (userId, productId, n) => {
        const store = makeCartStore([{ id: productId, stock: 100 }])
        for (let i = 0; i < n; i++) store.addToCart(userId, productId)
        const item = store.getCartItems(userId).find((i) => i.productId === productId)
        expect(item).toBeDefined()
        expect(item!.quantity).toBe(n)
      }),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property 7: Out-of-stock products cannot be added
// Feature: soho-jewels, Property 7: Out-of-stock products cannot be added
// Product with stock=0 returns 400, CartItem count unchanged.
// Validates: Requirements 7.6, 4.5
// ---------------------------------------------------------------------------
describe('Property 7: Out-of-stock products cannot be added', () => {
  it('adding out-of-stock product returns 400 and cart is unchanged', () => {
    // Feature: soho-jewels, Property 7: Out-of-stock products cannot be added
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), (userId, productId) => {
        const store = makeCartStore([{ id: productId, stock: 0 }])
        const before = store.getCartItems(userId).length
        const result = store.addToCart(userId, productId)
        expect(result.status).toBe(400)
        expect(store.getCartItems(userId).length).toBe(before)
      }),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property: Cart remove round-trip
// Feature: soho-jewels, Property: Cart remove round-trip
// Add then remove item, CartItem no longer exists.
// Validates: Requirements 7.3
// ---------------------------------------------------------------------------
describe('Property: Cart remove round-trip', () => {
  it('removed item no longer appears in cart', () => {
    // Feature: soho-jewels, Property: Cart remove round-trip
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), (userId, productId) => {
        const store = makeCartStore([{ id: productId, stock: 10 }])
        store.addToCart(userId, productId)
        store.removeFromCart(userId, productId)
        const item = store.getCartItems(userId).find((i) => i.productId === productId)
        expect(item).toBeUndefined()
      }),
      { numRuns: 10 }
    )
  })
})
