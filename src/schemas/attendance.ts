import { z } from 'zod';

export const attendanceEditSchema = z.object({
  first_check_in: z.string().optional().or(z.literal('')),
  last_check_out: z.string().optional().or(z.literal('')),
  worked_minutes: z.coerce.number().min(0).optional(),
  overtime_minutes: z.coerce.number().min(0).optional(),
  overtime_diurnal_minutes: z.coerce.number().min(0).optional(),
  overtime_nocturnal_minutes: z.coerce.number().min(0).optional(),
  late_minutes: z.coerce.number().min(0).optional(),
  early_departure_minutes: z.coerce.number().min(0).optional(),
  status: z.enum(['present', 'absent', 'incomplete', 'rest', 'holiday']).optional(),
  reason: z.string().min(1, 'El motivo es requerido').max(500),
});

export type AttendanceEditFormData = z.infer<typeof attendanceEditSchema>;
