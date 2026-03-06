import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const shiftSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  start_time: z.string().regex(timeRegex, 'Formato HH:mm'),
  end_time: z.string().regex(timeRegex, 'Formato HH:mm'),
  crosses_midnight: z.boolean().optional(),
  lunch_required: z.boolean().optional(),
  lunch_start_time: z.string().regex(timeRegex, 'Formato HH:mm').optional().or(z.literal('')),
  lunch_end_time: z.string().regex(timeRegex, 'Formato HH:mm').optional().or(z.literal('')),
  lunch_duration_minutes: z.coerce.number().min(0).max(120).optional(),
  tolerance_minutes: z.coerce.number().min(0).max(60).optional(),
  overtime_enabled: z.boolean().optional(),
  overtime_min_block_minutes: z.coerce.number().min(0).optional(),
  max_daily_overtime_minutes: z.coerce.number().min(0).optional(),
  is_active: z.boolean().optional(),
});

export type ShiftFormData = z.infer<typeof shiftSchema>;
