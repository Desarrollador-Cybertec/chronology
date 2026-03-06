import { z } from 'zod';

export const shiftAssignmentSchema = z.object({
  employee_id: z.coerce.number().min(1, 'Selecciona un empleado'),
  shift_id: z.coerce.number().min(1, 'Selecciona un turno'),
  effective_date: z.string().min(1, 'La fecha de inicio es requerida'),
  end_date: z.string().optional().or(z.literal('')),
  work_days: z.array(z.number().min(0).max(6)).min(1, 'Selecciona al menos un día'),
});

export type ShiftAssignmentFormData = z.infer<typeof shiftAssignmentSchema>;

export const scheduleExceptionSchema = z.object({
  employee_id: z.coerce.number().min(1, 'Selecciona un empleado'),
  date: z.string().min(1, 'La fecha es requerida'),
  shift_id: z.coerce.number().optional(),
  is_working_day: z.boolean(),
  reason: z.string().max(500).optional().or(z.literal('')),
});

export type ScheduleExceptionFormData = z.infer<typeof scheduleExceptionSchema>;
