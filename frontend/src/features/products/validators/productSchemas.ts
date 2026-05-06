import { z } from 'zod'

export const productReviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be 5 or less'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be 1000 characters or less'),
})
