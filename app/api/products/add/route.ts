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
  materialCare: z.string().optional(),
  colours: z.string().optional(),
  sizes: z.string().optional(),
})

async function uploadToCloudinary(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: 'soho-jewels' }, (err, result) => {
      if (err || !result) return reject(err)
      resolve(result.secure_url)
    }).end(buffer)
  })
}

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
    materialCare: formData.get('materialCare') ?? '',
    colours: formData.get('colours') ?? '',
    sizes: formData.get('sizes') ?? '',
  }

  const result = addProductSchema.safeParse(raw)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation error', details: result.error.errors.map((e) => e.message) },
      { status: 400 }
    )
  }

  // Get all image files (images[0], images[1], ... or image for backwards compat)
  const imageFiles: File[] = []
  for (let i = 0; i < 10; i++) {
    const f = formData.get(`images[${i}]`) as File | null
    if (f && f.size > 0) imageFiles.push(f)
  }
  // fallback single image
  if (imageFiles.length === 0) {
    const single = formData.get('image') as File | null
    if (single && single.size > 0) imageFiles.push(single)
  }

  if (imageFiles.length < 1) {
    return NextResponse.json({ error: 'Validation error', details: ['At least 3 images are required'] }, { status: 400 })
  }

  try {
    const uploadedUrls = await Promise.all(imageFiles.map(uploadToCloudinary))
    const imageUrl = uploadedUrls[0]
    const imageUrls = uploadedUrls.join(',')

    // Upload video if provided
    let videoUrl = ''
    const videoFile = formData.get('video') as File | null
    if (videoFile && videoFile.size > 0) {
      const videoBuffer = Buffer.from(await videoFile.arrayBuffer())
      videoUrl = await new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'soho-jewels/videos', resource_type: 'video', max_bytes: 100 * 1024 * 1024 },
          (err, result) => {
            if (err || !result) return reject(err)
            resolve(result.secure_url)
          }
        ).end(videoBuffer)
      })
    }

    const product = await prisma.product.create({
      data: { ...result.data, imageUrl, imageUrls, videoUrl },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'Conflict', field: 'sku' }, { status: 409 })
    }
    if ((err as Error)?.message?.includes('upload')) {
      return NextResponse.json({ error: 'Image upload failed' }, { status: 502 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
