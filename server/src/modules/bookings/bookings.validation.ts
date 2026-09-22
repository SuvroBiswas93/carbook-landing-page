import { z } from 'zod'

const bookingLocationSchema = z.object({
  name: z.string().trim().min(1),
  latitude: z.coerce.number().finite(),
  longitude: z.coerce.number().finite(),
})

export const createBookingSchema = z.object({
  carId: z.coerce.number().int().nonnegative(),
  carName: z.string().trim().min(1, 'Car name is required.'),
  carType: z.string().trim().optional(),
  category: z.enum(['city', 'hourly', 'intercity', 'airport']),
  customerName: z.string().trim().min(1, 'Customer name is required.'),
  mobileNumber: z.string().regex(/^01[3-9]\d{8}$/, 'Enter a valid Bangladesh mobile number.'),
  pickupLocation: bookingLocationSchema,
  dropoffLocation: bookingLocationSchema,
  pickupDate: z.string().datetime({ local: true }).or(z.string().min(1)),
  dropoffDate: z.string().optional(),
  tripType: z.enum(['One Way', 'Round Trip']),
}).passthrough()
