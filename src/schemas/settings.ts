import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const settingSchema = z.object({
  noise_window_minutes: z.coerce.number().min(1),
  auto_assign_shift: z.enum(['true', 'false']),
  auto_assign_tolerance_minutes: z.coerce.number().min(1),
  auto_assign_regularity_percent: z.coerce.number().min(1).max(100),
  lunch_margin_minutes: z.coerce.number().min(0),
  diurnal_start_time: z.string().regex(timeRegex, 'Formato HH:mm'),
  nocturnal_start_time: z.string().regex(timeRegex, 'Formato HH:mm'),
  data_retention_months: z.coerce.number().min(1),
});

export type SettingsFormData = z.infer<typeof settingSchema>;
