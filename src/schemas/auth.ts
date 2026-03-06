import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().min(1, 'El email es requerido').email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    password_confirmation: z.string().min(1, 'Confirma la contraseña'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
