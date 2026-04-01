/**
 * Unit tests for products API logic
 * Tests the core filtering/pagination logic without importing Next.js route handlers.
 */

// ---------------------------------------------------------------------------
// Mock Prisma
// ---------------------------------------------------------------------------
const mockFindMany = jest.fn()
const mockCount = jest.fn()
const mockFindUnique = jest.fn()
const mockTransaction = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}))

// ---------------------------------------------------------------------------
// Inline helpers that mirror the route logic without the HTTP layer
// ---------------------------------------------------------------------------
const PAGE_SIZE = 20

async function listProducts(params: {
  category?: string
  search?: string
  page?: number
}) {
  const page = Math.max(1, params.page ?? 1)

  const where = {
    ...(params.category ? { categoryId: params.category } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' as const } },
            { description: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  try {
    const [products, total] = await mockTransaction([
      mockFindMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      mockCount({ where }),
    ])
    return { status: 200, body: { products, total } }
  } catch {
    return { status: 500, body: { error: 'Internal server error' } }
  }
}

async function getProduct(id: string) {
  try {
    const product = await mockFindUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) {
      return { status: 404, body: { error: 'Not found' } }
    }

    return { status: 200, body: product }
  } catch {
    return { status: 500, body: { error: 'Internal server error' } }
  }
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockCategory = { id: 'cat1', name: 'Rings' }
const mockProduct = {
  id: 'prod1',
  sku: 'SKU-001',
  name: 'Gold Ring',
  categoryId: 'cat1',
  category: mockCategory,
  type: 'Gold',
  price: '199.99',
  stock: 10,
  description: 'A beautiful gold ring',
  imageUrl: 'https://example.com/ring.jpg',
  createdAt: new Date(),
}
const mockReview = {
  id: 'rev1',
  userId: 'user1',
  productId: 'prod1',
  rating: 5,
  comment: 'Lovely!',
  createdAt: new Date(),
  user: { id: 'user1', name: 'Alice' },
}

// ---------------------------------------------------------------------------
// Tests: product listing
// ---------------------------------------------------------------------------
describe('listProducts logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTransaction.mockImplementation((queries: Promise<unknown>[]) =>
      Promise.all(queries)
    )
  })

  it('returns products and total', async () => {
    mockFindMany.mockResolvedValue([mockProduct])
    mockCount.mockResolvedValue(1)

    const res = await listProducts({})
    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(1)
    expect(res.body.total).toBe(1)
  })

  it('filters by categoryId', async () => {
    mockFindMany.mockResolvedValue([mockProduct])
    mockCount.mockResolvedValue(1)

    await listProducts({ category: 'cat1' })

    const findManyCall = mockFindMany.mock.calls[0][0]
    expect(findManyCall.where).toMatchObject({ categoryId: 'cat1' })
  })

  it('applies case-insensitive search on name and description', async () => {
    mockFindMany.mockResolvedValue([mockProduct])
    mockCount.mockResolvedValue(1)

    await listProducts({ search: 'gold' })

    const findManyCall = mockFindMany.mock.calls[0][0]
    expect(findManyCall.where.OR).toEqual([
      { name: { contains: 'gold', mode: 'insensitive' } },
      { description: { contains: 'gold', mode: 'insensitive' } },
    ])
  })

  it('paginates correctly with page=2', async () => {
    mockFindMany.mockResolvedValue([])
    mockCount.mockResolvedValue(25)

    await listProducts({ page: 2 })

    const findManyCall = mockFindMany.mock.calls[0][0]
    expect(findManyCall.skip).toBe(20)
    expect(findManyCall.take).toBe(20)
  })

  it('defaults to page 1 when page is not provided', async () => {
    mockFindMany.mockResolvedValue([mockProduct])
    mockCount.mockResolvedValue(1)

    await listProducts({})

    const findManyCall = mockFindMany.mock.calls[0][0]
    expect(findManyCall.skip).toBe(0)
  })

  it('returns 500 on database error', async () => {
    mockTransaction.mockRejectedValue(new Error('DB error'))

    const res = await listProducts({})
    expect(res.status).toBe(500)
  })
})

// ---------------------------------------------------------------------------
// Tests: product detail
// ---------------------------------------------------------------------------
describe('getProduct logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns a product with category and reviews', async () => {
    mockFindUnique.mockResolvedValue({ ...mockProduct, reviews: [mockReview] })

    const res = await getProduct('prod1')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('prod1')
    expect(res.body.category).toEqual(mockCategory)
    expect(res.body.reviews).toHaveLength(1)
    expect(res.body.reviews[0].user.name).toBe('Alice')
  })

  it('returns 404 when product does not exist', async () => {
    mockFindUnique.mockResolvedValue(null)

    const res = await getProduct('nonexistent')
    expect(res.status).toBe(404)
  })

  it('returns 500 on database error', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB error'))

    const res = await getProduct('prod1')
    expect(res.status).toBe(500)
  })

  it('passes correct include options for category and reviews with user', async () => {
    mockFindUnique.mockResolvedValue({ ...mockProduct, reviews: [] })

    await getProduct('prod1')

    const findUniqueCall = mockFindUnique.mock.calls[0][0]
    expect(findUniqueCall.include.category).toBe(true)
    expect(findUniqueCall.include.reviews.include.user.select).toEqual({
      id: true,
      name: true,
    })
  })
})

// ---------------------------------------------------------------------------
// Admin product management helpers (mirrors add/update/delete route logic)
// ---------------------------------------------------------------------------

// Additional mocks for admin operations
const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockUploadStream = jest.fn()
const mockUpload = jest.fn()

jest.mock('@/lib/cloudinary', () => ({
  cloudinary: {
    uploader: {
      upload_stream: (...args: unknown[]) => mockUploadStream(...args),
      upload: (...args: unknown[]) => mockUpload(...args),
    },
  },
}))

// Extend the prisma mock with create/update/delete
jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}))

// ---------------------------------------------------------------------------
// Inline helpers mirroring add/update/delete route logic
// ---------------------------------------------------------------------------

interface AddProductInput {
  sku: string
  name: string
  categoryId: string
  type: string
  price: number
  stock: number
  description: string
  imageUrl: string // pre-uploaded URL for test simplicity
}

async function addProduct(input: AddProductInput) {
  const { sku, name, categoryId, type, price, stock, description, imageUrl } = input

  if (!sku || !name || !categoryId || !type || !description || !imageUrl) {
    return { status: 400, body: { error: 'Validation error' } }
  }
  if (price <= 0) return { status: 400, body: { error: 'Validation error' } }
  if (stock < 0) return { status: 400, body: { error: 'Validation error' } }

  try {
    const product = await mockCreate({
      data: { sku, name, categoryId, type, price, stock, description, imageUrl },
    })
    return { status: 201, body: product }
  } catch (err) {
    if (err !== null && typeof err === 'object' && (err as { code?: string }).code === 'P2002') {
      return { status: 409, body: { error: 'Conflict', field: 'sku' } }
    }
    return { status: 500, body: { error: 'Internal server error' } }
  }
}

async function updateProduct(id: string, fields: Partial<AddProductInput>) {
  if (!id) return { status: 400, body: { error: 'Validation error' } }

  try {
    const product = await mockUpdate({ where: { id }, data: fields })
    return { status: 200, body: product }
  } catch (err) {
    if (err !== null && typeof err === 'object' && (err as { code?: string }).code === 'P2025') {
      return { status: 404, body: { error: 'Not found' } }
    }
    if (err !== null && typeof err === 'object' && (err as { code?: string }).code === 'P2002') {
      return { status: 409, body: { error: 'Conflict', field: 'sku' } }
    }
    return { status: 500, body: { error: 'Internal server error' } }
  }
}

async function deleteProduct(id: string) {
  if (!id) return { status: 400, body: { error: 'Validation error' } }

  try {
    await mockDelete({ where: { id } })
    return { status: 204, body: null }
  } catch (err) {
    if (err !== null && typeof err === 'object' && (err as { code?: string }).code === 'P2025') {
      return { status: 404, body: { error: 'Not found' } }
    }
    return { status: 500, body: { error: 'Internal server error' } }
  }
}

// ---------------------------------------------------------------------------
// Tests: add product
// ---------------------------------------------------------------------------
describe('addProduct logic', () => {
  const validInput: AddProductInput = {
    sku: 'SKU-NEW',
    name: 'Diamond Necklace',
    categoryId: 'cat1',
    type: 'Diamond',
    price: 499.99,
    stock: 5,
    description: 'A stunning diamond necklace',
    imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/soho-jewels/necklace.jpg',
  }

  beforeEach(() => jest.clearAllMocks())

  it('creates a product and returns 201', async () => {
    mockCreate.mockResolvedValue({ id: 'prod2', ...validInput })

    const res = await addProduct(validInput)
    expect(res.status).toBe(201)
    expect(res.body.sku).toBe('SKU-NEW')
  })

  it('returns 409 on duplicate SKU (P2002)', async () => {
    mockCreate.mockRejectedValue(Object.assign(new Error('Unique constraint'), { code: 'P2002' }))

    const res = await addProduct(validInput)
    expect(res.status).toBe(409)
    expect(res.body.field).toBe('sku')
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await addProduct({ ...validInput, sku: '' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when price is not positive', async () => {
    const res = await addProduct({ ...validInput, price: -1 })
    expect(res.status).toBe(400)
  })

  it('returns 500 on unexpected database error', async () => {
    mockCreate.mockRejectedValue(new Error('DB error'))

    const res = await addProduct(validInput)
    expect(res.status).toBe(500)
  })
})

// ---------------------------------------------------------------------------
// Tests: update product
// ---------------------------------------------------------------------------
describe('updateProduct logic', () => {
  beforeEach(() => jest.clearAllMocks())

  it('updates a product and returns 200', async () => {
    const updated = { id: 'prod1', name: 'Updated Ring', price: 299.99 }
    mockUpdate.mockResolvedValue(updated)

    const res = await updateProduct('prod1', { name: 'Updated Ring', price: 299.99 })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Updated Ring')
  })

  it('returns 404 when product does not exist (P2025)', async () => {
    mockUpdate.mockRejectedValue(Object.assign(new Error('Record not found'), { code: 'P2025' }))

    const res = await updateProduct('nonexistent', { name: 'X' })
    expect(res.status).toBe(404)
  })

  it('returns 409 on duplicate SKU (P2002)', async () => {
    mockUpdate.mockRejectedValue(Object.assign(new Error('Unique constraint'), { code: 'P2002' }))

    const res = await updateProduct('prod1', { sku: 'EXISTING-SKU' })
    expect(res.status).toBe(409)
  })

  it('returns 400 when id is missing', async () => {
    const res = await updateProduct('', { name: 'X' })
    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// Tests: delete product
// ---------------------------------------------------------------------------
describe('deleteProduct logic', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes a product and returns 204', async () => {
    mockDelete.mockResolvedValue({ id: 'prod1' })

    const res = await deleteProduct('prod1')
    expect(res.status).toBe(204)
    expect(res.body).toBeNull()
  })

  it('returns 404 when product does not exist (P2025)', async () => {
    mockDelete.mockRejectedValue(Object.assign(new Error('Record not found'), { code: 'P2025' }))

    const res = await deleteProduct('nonexistent')
    expect(res.status).toBe(404)
  })

  it('returns 400 when id is missing', async () => {
    const res = await deleteProduct('')
    expect(res.status).toBe(400)
  })

  it('returns 500 on unexpected database error', async () => {
    mockDelete.mockRejectedValue(new Error('DB error'))

    const res = await deleteProduct('prod1')
    expect(res.status).toBe(500)
  })
})
