import { z } from 'zod';

// ============ AUTH SCHEMAS ============

export const LoginDTOSchema = z
  .object({
    email: z
      .string()
      .min(0)
      .transform((v) => v?.trim() || undefined)
      .pipe(z.union([z.literal(undefined), z.string().email('Email inválido')]))
      .optional(),
    telefone: z
      .string()
      .min(0)
      .transform((v) => v?.trim() || undefined)
      .pipe(
        z.union([
          z.literal(undefined),
          z.string().min(7, 'Telefone deve ter pelo menos 7 dígitos'),
        ]),
      )
      .optional(),
    // No login validamos apenas presença da senha.
    // Regra de tamanho mínimo fica no cadastro/alteração de senha.
    senha: z.string().min(1, 'Senha é obrigatória'),
  })
  .refine((data) => data.email || data.telefone, { message: 'Email ou telefone é obrigatório' });

export const RegisterDTOSchema = z.object({
  nome_completo: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres'),
  email: z
    .string()
    .min(0)
    .transform((v) => v?.trim() || undefined)
    .pipe(z.union([z.literal(undefined), z.string().email('Email inválido')]))
    .optional(),
  telefone: z.string().min(7, 'Telefone deve ter pelo menos 7 dígitos'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  bi: z
    .string()
    .min(0)
    .transform((v) => v?.trim() || undefined)
    .optional(),
  nif: z
    .string()
    .min(0)
    .transform((v) => v?.trim() || undefined)
    .optional(),
  data_nascimento: z.coerce.date().optional(),
  genero: z.enum(['masculino', 'feminino', 'outro']).optional(),
});

export const AdminCreateUserDTOSchema = z.object({
  nome_completo: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres'),
  email: z
    .string()
    .min(0)
    .transform((v) => v?.trim() || undefined)
    .pipe(z.union([z.literal(undefined), z.string().email('Email inválido')]))
    .optional(),
  telefone: z.string().min(7, 'Telefone deve ter pelo menos 7 dígitos'),
  telefone_alternativo: z
    .string()
    .min(0)
    .transform((v) => v?.trim() || undefined)
    .optional(),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  bi: z
    .string()
    .min(0)
    .transform((v) => v?.trim() || undefined)
    .optional(),
  nif: z
    .string()
    .min(0)
    .transform((v) => v?.trim() || undefined)
    .optional(),
  role: z
    .enum(['cliente', 'administrador', 'garcom', 'cozinha', 'entregador', 'gerente'])
    .default('cliente'),
  status: z.enum(['ativo', 'inativo', 'bloqueado']).default('ativo'),
  data_nascimento: z.coerce.date().optional(),
  genero: z.enum(['masculino', 'feminino', 'outro']).optional(),
});

export const ChangePasswordDTOSchema = z
  .object({
    senha_atual: z.string().min(6, 'Senha atual inválida'),
    senha_nova: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
    confirmacao: z.string(),
  })
  .refine((data) => data.senha_nova === data.confirmacao, {
    message: 'Senhas não correspondem',
    path: ['confirmacao'],
  });

export const UpdateProfileDTOSchema = z.object({
  nome_completo: z.string().min(3).optional(),
  email: z.string().email().optional(),
  telefone: z.string().min(7).optional(),
  data_nascimento: z.coerce.date().optional(),
  genero: z.enum(['masculino', 'feminino', 'outro']).optional(),
});

export const ForgotPasswordDTOSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const ResetPasswordDTOSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
});

// ============ MENU SCHEMAS ============

const CreateItemCardapioBaseSchema = z.object({
  categoria_id: z.string().uuid('ID da categoria inválido'),
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  nome_en: z.string().max(100).optional().nullable(),
  descricao: z.string().max(500).optional().nullable(),
  preco_kz: z
    .union([z.number(), z.string()])
    .transform((v) => {
      if (typeof v === 'string') {
        const num = parseFloat(v);
        return isNaN(num) ? undefined : num;
      }
      return v;
    })
    .pipe(z.number().positive('Preço deve ser positivo').finite()),
  preco_promocional_kz: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined || v === '') return undefined;
      if (typeof v === 'string') {
        const num = parseFloat(v);
        return isNaN(num) ? undefined : num;
      }
      return v;
    })
    .pipe(z.number().positive().optional().nullable())
    .optional()
    .nullable(),
  tempo_preparo: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined || v === '') return undefined;
      if (typeof v === 'string') {
        const num = parseInt(v, 10);
        return isNaN(num) ? undefined : num;
      }
      return v;
    })
    .pipe(z.number().int().positive().optional().nullable())
    .optional()
    .nullable(),
  calorias: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined || v === '') return undefined;
      if (typeof v === 'string') {
        const num = parseInt(v, 10);
        return isNaN(num) ? undefined : num;
      }
      return v;
    })
    .pipe(z.number().int().nonnegative().optional().nullable())
    .optional()
    .nullable(),
  // CORREÇÃO: Aceitar boolean ou string "true"/"false" com default false
  vegetariano: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === 'true')
    .default(false)
    .optional(),
  vegano: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === 'true')
    .default(false)
    .optional(),
  sem_gluten: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === 'true')
    .default(false)
    .optional(),
  picante: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === 'true')
    .default(false)
    .optional(),
  destaque: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === 'true')
    .default(false)
    .optional(),
  prato_do_dia: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === 'true')
    .default(false)
    .optional(),
  // CORREÇÃO: Imagem aceita null, string ou undefined
  imagem: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined || v === '') return undefined;
      return v;
    })
    .optional()
    .nullable(),
  ordem_exibicao: z
    .union([z.number(), z.string()])
    .transform((v) => {
      if (typeof v === 'string') {
        const num = parseInt(v, 10);
        return isNaN(num) ? 0 : num;
      }
      return v;
    })
    .pipe(z.number().int().nonnegative())
    .default(0)
    .optional(),
});

export const CreateItemCardapioDTOSchema = CreateItemCardapioBaseSchema.refine(
  (data) => !data.preco_promocional_kz || data.preco_promocional_kz < data.preco_kz,
  {
    message: 'Preço promocional deve ser menor que o preço normal',
    path: ['preco_promocional_kz'],
  },
);

export const UpdateItemCardapioDTOSchema = CreateItemCardapioBaseSchema.partial().refine(
  (data) =>
    !data.preco_promocional_kz ||
    data.preco_kz === undefined ||
    data.preco_promocional_kz < data.preco_kz,
  {
    message: 'Preço promocional deve ser menor que o preço normal',
    path: ['preco_promocional_kz'],
  },
);

export const UpdateItemStatusDTOSchema = z.object({
  status: z.enum(['disponivel', 'indisponivel', 'esgotado']),
});

export const CategoriaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(50),
  nome_en: z.string().max(50).optional(),
  descricao: z.string().max(200).optional(),
  imagem: z.string().url().optional(),
  ordem_exibicao: z.number().int().nonnegative().default(0).optional(),
  ativo: z.boolean().default(true).optional(),
});

// ============ ORDER SCHEMAS ============

export const CreatePedidoDTOSchema = z
  .object({
    tipo: z.enum(['delivery', 'retirada', 'mesa'], {
      errorMap: () => ({ message: 'Tipo de pedido inválido' }),
    }),
    endereco_id: z.string().uuid().optional(),
    mesa_id: z.string().uuid().optional(),
    itens: z
      .array(
        z.object({
          item_cardapio_id: z.string().uuid(),
          quantidade: z.number().int().positive('Quantidade deve ser positiva'),
        }),
      )
      .min(1, 'Pedido deve ter pelo menos um item'),
    observacoes: z.string().optional(),
    observacoes_entrega: z.string().optional(),
    cupom_codigo: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.tipo === 'delivery') return !!data.endereco_id;
      if (data.tipo === 'mesa') return !!data.mesa_id;
      return true;
    },
    { message: 'Informações obrigatórias ausentes para tipo de pedido' },
  );

// ============ RESERVATION SCHEMAS ============

export const CreateReservacionDTOSchema = z.object({
  mesa_id: z.string().uuid('ID da mesa inválido').optional(),
  nome_cliente: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  telefone_cliente: z.string().min(7, 'Telefone deve ter pelo menos 7 dígitos'),
  email_cliente: z.string().email('Email inválido').optional().or(z.literal('')),
  quantidade_pessoas: z.number().int().min(1, 'Mínimo 1 pessoa').max(20, 'Máximo 20 pessoas'),
  data_reserva: z.string().min(1, 'Data é obrigatória'),
  hora_reserva: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:mm'),
  ocasiao_especial: z.string().optional().or(z.literal('')),
  observacoes: z.string().optional().or(z.literal('')),
});

// ============ EXPORT TYPES ============

export type LoginDTO = z.infer<typeof LoginDTOSchema>;
export type RegisterDTO = z.infer<typeof RegisterDTOSchema>;
export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTOSchema>;
export type ChangePasswordDTO = z.infer<typeof ChangePasswordDTOSchema>;
export type UpdateProfileDTO = z.infer<typeof UpdateProfileDTOSchema>;
export type CreateItemCardapioDTO = z.infer<typeof CreateItemCardapioDTOSchema>;
export type UpdateItemCardapioDTO = z.infer<typeof UpdateItemCardapioDTOSchema>;
export type CreatePedidoDTO = z.infer<typeof CreatePedidoDTOSchema>;
export type CreateReservacionDTO = z.infer<typeof CreateReservacionDTOSchema>;
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordDTOSchema>;
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTOSchema>;
