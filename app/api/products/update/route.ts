import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { cloudinary } from '@/lib/cloudinary'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const updateProductSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  price: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  description: z.string().min(1).optional(),
  // base64-encoded image for optional re-upload
  imageBase64: z.string().optional(),
})

export async function PUT(req: NextRequest) {
  try {
    await requireAuth('ADMIN')
  } catch (response) {
    return response as NextResponse
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Validation error', details: ['Invalid JSON body'] }, { status: 400 })
  }

  const result = updateProductSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation error', details: result.error.errors.map((e) => e.message) },
      { status: 400 }
    )
  }

  const { id, imageBase64, ...fields } = result.data

  let imageUrl: string | undefined
  if (imageBase64) {
    try {
      const uploadResult = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${imageBase64}`,
        { folder: 'soho-jewels' }
      )
      imageUrl = uploadResult.secure_url
    } catch {
      return NextResponse.json({ error: 'Image upload failed' }, { status: 502 })
    }
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: { ...fields, ...(imageUrl ? { imageUrl } : {}) },
    })
    return NextResponse.json(product)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if (err.code === 'P2002') return NextResponse.json({ error: 'Conflict', field: 'sku' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
