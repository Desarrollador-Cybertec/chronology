import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export const shiftBreakSchema = z.object({
  type: z.string().min(1, 'El tipo es requerido').max(50),
  start_time: z.string().regex(timeRegex, 'Formato HH:mm'),
  end_time: z.string().regex(timeRegex, 'Formato HH:mm'),
  duration_minutes: z.coerce.number().min(1, 'Mínimo 1 minuto').max(120),
  position: z.coerce.number().min(0),
});

type ShiftBreakFormData = z.infer<typeof shiftBreakSchema>;

export const shiftSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  start_time: z.string().regex(timeRegex, 'Formato HH:mm'),
  end_time: z.string().regex(timeRegex, 'Formato HH:mm'),
  crosses_midnight: z.boolean().optional(),
  tolerance_minutes: z.coerce.number().min(0).max(60).optional(),
  overtime_enabled: z.boolean().optional(),
  overtime_min_block_minutes: z.coerce.number().min(0).optional(),
  max_daily_overtime_minutes: z.coerce.number().min(0).optional(),
  is_active: z.boolean().optional(),
  breaks: z.array(shiftBreakSchema).optional(),
});

export type ShiftFormData = z.infer<typeof shiftSchema>;
