import { NextResponse } from 'next/server'
import { getReviews, saveReviews, type Review } from '@/lib/store'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params
  const reviewId = Number(id)
  const body = (await request.json()) as Partial<Review>
  const reviews = await getReviews(true)
  const index = reviews.findIndex((review) => review.id === reviewId)

  if (index === -1) {
    return NextResponse.json({ error: 'Review not found.' }, { status: 404 })
  }

  const updated: Review = {
    ...reviews[index],
    name: String(body.name ?? reviews[index].name).trim(),
    rating: Math.min(5, Math.max(1, Number(body.rating ?? reviews[index].rating))),
    text: String(body.text ?? reviews[index].text).trim(),
    location: String(body.location ?? reviews[index].location).trim(),
    hidden: body.hidden ?? reviews[index].hidden,
  }

  reviews[index] = updated
  await saveReviews(reviews)
  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const reviewId = Number(id)
  const reviews = await getReviews(true)
  const nextReviews = reviews.filter((review) => review.id !== reviewId)

  if (nextReviews.length === reviews.length) {
    return NextResponse.json({ error: 'Review not found.' }, { status: 404 })
  }

  await saveReviews(nextReviews)
  return NextResponse.json({ ok: true })
}
