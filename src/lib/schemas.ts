import { z } from 'zod';

export const GuestPostSchema = z.object({
  type: z.enum(['personal', 'rombongan']).default('personal'),
  name: z.string().min(1, 'Nama dan Kota wajib diisi.'),
  city: z.string().min(1, 'Nama dan Kota wajib diisi.'),
  province: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  gender: z.enum(['L', 'P']).optional().nullable(),
  visitPurpose: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  impression: z.string().optional().nullable(),
  pekerjaan: z.string().optional().nullable(),
  orgName: z.string().optional().nullable(),
  orgMembers: z.number().int().min(1).optional().nullable(),
  orgPosition: z.string().optional().nullable(),
  jenisOrganisasi: z.string().optional().nullable(),
});

export const GuestPutSchema = z.object({
  id: z.number({ error: 'Missing guest ID for update' }),
  type: z.enum(['personal', 'rombongan']).optional(),
}).passthrough();

export const AuthLoginSchema = z.object({
  action: z.literal('login'),
  password: z.string({ error: 'Password wajib diisi.' }).min(1, 'Password wajib diisi.'),
});

export const AuthChangePasswordSchema = z.object({
  action: z.literal('changePassword'),
  oldPassword: z.string().min(1, 'Sandi lama dan sandi baru wajib diisi.'),
  newPassword: z.string().min(1, 'Sandi lama dan sandi baru wajib diisi.'),
});

export const AuthUpdateSettingsSchema = z.object({
  action: z.literal('updateSettings'),
  gpsLockEnabled: z.boolean(),
  candiLatitude: z.number(),
  candiLongitude: z.number(),
  allowedRadiusMeters: z.number().int().min(1),
});

export const AuthPostSchema = z.discriminatedUnion('action', [
  AuthLoginSchema,
  AuthChangePasswordSchema,
  AuthUpdateSettingsSchema,
]);
