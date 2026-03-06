import { z } from 'zod';

export const employeeUpdateSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  department: z.string().optional(),
  position: z.string().optional(),
});

export type EmployeeUpdateFormData = z.infer<typeof employeeUpdateSchema>;
