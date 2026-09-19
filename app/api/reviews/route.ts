import { NextResponse } from 'next/server'
import { getReviews, nextNumericId, saveReviews, type Review } from '@/lib/store'

export async function GET(request: Request) {
  const includeHidden = new URL(request.url).searchParams.get('admin') === '1'
  return NextResponse.json(await getReviews(includeHidden))
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Review>
  const reviews = await getReviews(true)
  const requestedRating = Number(body.rating ?? 5)
  const review: Review = {
    id: nextNumericId(reviews),
    name: String(body.name ?? '').trim(),
    rating: Number.isFinite(requestedRating)
      ? Math.min(5, Math.max(1, requestedRating))
      : 5,
    text: String(body.text ?? '').trim(),
    location: String(body.location ?? '').trim(),
    hidden: true,
    createdAt: new Date().toISOString(),
  }

  if (!review.name || !review.location || !review.text) {
    return NextResponse.json({ error: 'Name, location, and review text are required.' }, { status: 400 })
  }

  reviews.unshift(review)
  await saveReviews(reviews)
  return NextResponse.json(review, { status: 201 })
}
