import { z } from 'zod';

// ============ AUTH SCHEMAS ============

export const LoginFormSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().min(7, 'Telefone deve ter pelo menos 7 dígitos').optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
}).refine(
  (data) => data.email || data.telefone,
  { message: 'Email ou telefone é obrigatório' }
);

export const RegisterFormSchema = z.object({
  nome_completo: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().min(7, 'Telefone deve ter pelo menos 7 dígitos'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não correspondem',
  path: ['confirmPassword'],
});

// ============ RESERVATION SCHEMAS ============

export const ReservationFormSchema = z.object({
  mesa_id: z.string().uuid('Mesa inválida'),
  data_reserva: z.date({
    errorMap: () => ({ message: 'Data inválida' }),
  }).min(new Date(), 'Data deve ser no futuro'),
  hora_reserva: z.string().regex(/^\d{2}:\d{2}$/, 'Hora no formato HH:mm'),
  numero_pessoas: z.number().int().min(1).max(20),
  observacoes: z.string().optional(),
});

// ============ CART SCHEMAS ============

export const CheckoutFormSchema = z.object({
  tipo: z.enum(['delivery', 'retirada', 'mesa']),
  endereco_id: z.string().uuid().optional(),
  mesa_id: z.string().uuid().optional(),
  observacoes: z.string().optional(),
  cupom_codigo: z.string().optional(),
}).refine(
  (data) => {
    if (data.tipo === 'delivery') return !!data.endereco_id;
    if (data.tipo === 'mesa') return !!data.mesa_id;
    return true;
  },
  { message: 'Informações obrigatórias para este tipo de pedido' }
);

// ============ ADDRESS SCHEMAS ============

export const AddressFormSchema = z.object({
  nome_endereco: z.string().min(3, 'Nome mínimo 3 caracteres'),
  provincia: z.string(),
  municipio: z.string().min(2),
  bairro: z.string().min(2),
  rua: z.string().min(3),
  numero: z.string().optional(),
  condominio: z.string().optional(),
  apartamento: z.string().optional(),
  ponto_referencia: z.string().optional(),
  coordenadas_gps: z.string().optional(),
  principal: z.boolean().default(false),
});

// ============ PROFILE SCHEMAS ============

export const ProfileFormSchema = z.object({
  nome_completo: z.string().min(3).optional(),
  email: z.string().email().optional(),
  telefone: z.string().min(7).optional(),
  data_nascimento: z.date().optional(),
  genero: z.enum(['masculino', 'feminino', 'outro']).optional(),
});

export const ChangePasswordFormSchema = z.object({
  senha_atual: z.string().min(6),
  senha_nova: z.string().min(6),
  confirmacao: z.string(),
}).refine((data) => data.senha_nova === data.confirmacao, {
  message: 'Senhas não correspondem',
  path: ['confirmacao'],
});

// ============ EXPORT TYPES ============

export type LoginFormData = z.infer<typeof LoginFormSchema>;
export type RegisterFormData = z.infer<typeof RegisterFormSchema>;
export type ReservationFormData = z.infer<typeof ReservationFormSchema>;
export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;
export type AddressFormData = z.infer<typeof AddressFormSchema>;
export type ProfileFormData = z.infer<typeof ProfileFormSchema>;
export type ChangePasswordFormData = z.infer<typeof ChangePasswordFormSchema>;
