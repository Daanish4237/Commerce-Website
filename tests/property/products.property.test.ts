import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// Mock Prisma so we never need a real database connection
// ---------------------------------------------------------------------------
const mockCategoryCreate = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      create: (...args: unknown[]) => mockCategoryCreate(...args),
    },
  },
}))

// ---------------------------------------------------------------------------
// Helper: mirrors the POST /api/categories route logic without the HTTP layer
// ---------------------------------------------------------------------------
async function createCategory(name: string) {
  try {
    const category = await mockCategoryCreate({ data: { name } })
    return { status: 201, body: category }
  } catch (err) {
    if (
      err !== null &&
      typeof err === 'object' &&
      (err as { code?: string }).code === 'P2002'
    ) {
      return { status: 409, body: { error: 'Conflict', field: 'name' } }
    }
    return { status: 500, body: { error: 'Internal server error' } }
  }
}

// ---------------------------------------------------------------------------
// Property 15: Category name uniqueness
// Feature: soho-jewels, Property 15: Category name uniqueness
// For any category name string, creating it twice → second returns 409 and
// exactly one record exists.
// Validates: Requirements 12.4
// ---------------------------------------------------------------------------
describe('Property 15: Category name uniqueness', () => {
  beforeEach(() => {
    mockCategoryCreate.mockReset()
  })

  it('creating two categories with the same name returns 409 and one record exists', async () => {
    // Feature: soho-jewels, Property 15: Category name uniqueness
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        async (name) => {
          // Track created categories in a local array
          const records: { id: string; name: string }[] = []

          mockCategoryCreate.mockImplementation(
            (args: { data: { name: string } }) => {
              const existing = records.find((r) => r.name === args.data.name)
              if (existing) {
                const err = Object.assign(
                  new Error('Unique constraint failed on the fields: (`name`)'),
                  { code: 'P2002' }
                )
                throw err
              }
              const newRecord = { id: `id-${records.length}`, name: args.data.name }
              records.push(newRecord)
              return Promise.resolve(newRecord)
            }
          )

          // First creation — should succeed
          const first = await createCategory(name)
          expect(first.status).toBe(201)

          // Second creation with same name — should be rejected
          const second = await createCategory(name)
          expect(second.status).toBe(409)

          // Exactly one record should exist for this name
          const nameRecords = records.filter((r) => r.name === name)
          expect(nameRecords).toHaveLength(1)
        }
      ),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// Pure filter function — mirrors the logic in app/api/products/route.ts
// ---------------------------------------------------------------------------
interface Product {
  id: string
  name: string
  description: string
  categoryId: string
}

function filterProducts(
  products: Product[],
  { category, search }: { category?: string; search?: string }
): Product[] {
  return products.filter((p) => {
    if (category && p.categoryId !== category) return false
    if (search) {
      const kw = search.toLowerCase()
      if (
        !p.name.toLowerCase().includes(kw) &&
        !p.description.toLowerCase().includes(kw)
      )
        return false
    }
    return true
  })
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------
const productArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 80 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  categoryId: fc.string({ minLength: 1, maxLength: 20 }),
})

// ---------------------------------------------------------------------------
// Property: Category filter correctness
// Feature: soho-jewels, Property: Category filter correctness
// For any category filter, all returned products belong to that category.
// Validates: Requirements 4.2
// ---------------------------------------------------------------------------
describe('Property: Category filter correctness', () => {
  it('all returned products belong to the filtered category', () => {
    // Feature: soho-jewels, Property: Category filter correctness
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (products, category) => {
          const result = filterProducts(products, { category })
          return result.every((p) => p.categoryId === category)
        }
      ),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property: Search filter correctness
// Feature: soho-jewels, Property: Search filter correctness
// For any keyword, all returned products contain the keyword (case-insensitive)
// in name or description.
// Validates: Requirements 4.3
// ---------------------------------------------------------------------------
describe('Property: Search filter correctness', () => {
  it('all returned products contain the keyword in name or description', () => {
    // Feature: soho-jewels, Property: Search filter correctness
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (products, search) => {
          const result = filterProducts(products, { search })
          const kw = search.toLowerCase()
          return result.every(
            (p) =>
              p.name.toLowerCase().includes(kw) ||
              p.description.toLowerCase().includes(kw)
          )
        }
      ),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// In-memory product store helpers for Properties 12, update round-trip, delete
// ---------------------------------------------------------------------------
interface ProductRecord {
  id: string
  sku: string
  name: string
  categoryId: string
  type: string
  price: number
  stock: number
  description: string
  imageUrl: string
}

function makeProductStore() {
  const records: ProductRecord[] = []

  function addProduct(data: Omit<ProductRecord, 'id'>): { status: number; body: ProductRecord | { error: string; field?: string } } {
    if (records.find((r) => r.sku === data.sku)) {
      return { status: 409, body: { error: 'Conflict', field: 'sku' } }
    }
    const product = { id: `id-${records.length}`, ...data }
    records.push(product)
    return { status: 201, body: product }
  }

  function updateProduct(id: string, fields: Partial<Omit<ProductRecord, 'id'>>): { status: number; body: ProductRecord | { error: string } } {
    const idx = records.findIndex((r) => r.id === id)
    if (idx === -1) return { status: 404, body: { error: 'Not found' } }
    records[idx] = { ...records[idx], ...fields }
    return { status: 200, body: records[idx] }
  }

  function deleteProduct(id: string): { status: number } {
    const idx = records.findIndex((r) => r.id === id)
    if (idx === -1) return { status: 404 }
    records.splice(idx, 1)
    return { status: 204 }
  }

  function getProduct(id: string): ProductRecord | null {
    return records.find((r) => r.id === id) ?? null
  }

  return { addProduct, updateProduct, deleteProduct, getProduct, records }
}

const productDataArb = fc.record({
  sku: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 80 }),
  categoryId: fc.uuid(),
  type: fc.string({ minLength: 1, maxLength: 30 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(9999), noNaN: true }),
  stock: fc.integer({ min: 0, max: 1000 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  imageUrl: fc.webUrl(),
})

// ---------------------------------------------------------------------------
// Property 12: SKU uniqueness invariant
// Feature: soho-jewels, Property 12: SKU uniqueness invariant
// Inserting two products with same SKU returns 409 and one record exists.
// Validates: Requirements 11.4
// ---------------------------------------------------------------------------
describe('Property 12: SKU uniqueness invariant', () => {
  it('inserting two products with same SKU returns 409 and one record exists', () => {
    // Feature: soho-jewels, Property 12: SKU uniqueness invariant
    fc.assert(
      fc.property(productDataArb, (data) => {
        const store = makeProductStore()
        const first = store.addProduct(data)
        expect(first.status).toBe(201)

        const second = store.addProduct({ ...data, name: 'Different Name' })
        expect(second.status).toBe(409)

        const skuRecords = store.records.filter((r) => r.sku === data.sku)
        expect(skuRecords).toHaveLength(1)
      }),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property: Product update round-trip
// Feature: soho-jewels, Property: Product update round-trip
// Update product fields, fetch product, verify stored values match.
// Validates: Requirements 11.2, 11.3
// ---------------------------------------------------------------------------
describe('Property: Product update round-trip', () => {
  it('updated fields are reflected when product is fetched', () => {
    // Feature: soho-jewels, Property: Product update round-trip
    fc.assert(
      fc.property(
        productDataArb,
        fc.string({ minLength: 1, maxLength: 80 }),
        (data, newName) => {
          const store = makeProductStore()
          const created = store.addProduct(data)
          expect(created.status).toBe(201)
          const id = (created.body as ProductRecord).id

          store.updateProduct(id, { name: newName })
          const fetched = store.getProduct(id)

          expect(fetched).not.toBeNull()
          expect(fetched!.name).toBe(newName)
        }
      ),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// Property: Product delete
// Feature: soho-jewels, Property: Product delete
// Add then delete product, fetch returns null (404).
// Validates: Requirements 11.3
// ---------------------------------------------------------------------------
describe('Property: Product delete', () => {
  it('deleted product is no longer retrievable', () => {
    // Feature: soho-jewels, Property: Product delete
    fc.assert(
      fc.property(productDataArb, (data) => {
        const store = makeProductStore()
        const created = store.addProduct(data)
        expect(created.status).toBe(201)
        const id = (created.body as ProductRecord).id

        const del = store.deleteProduct(id)
        expect(del.status).toBe(204)

        const fetched = store.getProduct(id)
        expect(fetched).toBeNull()
      }),
      { numRuns: 10 }
    )
  })
})
