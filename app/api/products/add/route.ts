import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { cloudinary } from '@/lib/cloudinary'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const addProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  type: z.string().min(1, 'Type is required'),
  price: z.coerce.number().positive('Price must be positive'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  description: z.string().min(1, 'Description is required'),
})

export async function POST(req: NextRequest) {
  try {
    await requireAuth('ADMIN')
  } catch (response) {
    return response as NextResponse
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Validation error', details: ['Invalid form data'] }, { status: 400 })
  }

  const raw = {
    sku: formData.get('sku'),
    name: formData.get('name'),
    categoryId: formData.get('categoryId'),
    type: formData.get('type'),
    price: formData.get('price'),
    stock: formData.get('stock'),
    description: formData.get('description'),
  }

  const result = addProductSchema.safeParse(raw)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation error', details: result.error.errors.map((e) => e.message) },
      { status: 400 }
    )
  }

  const imageFile = formData.get('image') as File | null
  if (!imageFile) {
    return NextResponse.json({ error: 'Validation error', details: ['Image is required'] }, { status: 400 })
  }

  let imageUrl: string
  try {
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'soho-jewels' }, (err, result) => {
        if (err || !result) return reject(err)
        resolve(result as { secure_url: string })
      }).end(buffer)
    })
    imageUrl = uploadResult.secure_url
  } catch {
    return NextResponse.json({ error: 'Image upload failed' }, { status: 502 })
  }

  try {
    const product = await prisma.product.create({
      data: { ...result.data, imageUrl },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'Conflict', field: 'sku' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
