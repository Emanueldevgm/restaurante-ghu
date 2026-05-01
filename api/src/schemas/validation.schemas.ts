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

// ============ MENU SCHEMAS ============

const CreateItemCardapioBaseSchema = z.object({
  categoria_id: z.string().uuid('ID da categoria inválido'),
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  nome_en: z.string().max(100).optional(),
  descricao: z
    .string()
    .max(500)
    .transform((v) => v?.trim() || undefined)
    .pipe(z.union([z.literal(undefined), z.string()]))
    .optional(),
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
    .union([z.number(), z.string()])
    .transform((v) => {
      if (typeof v === 'string') {
        if (!v || !v.trim()) return undefined;
        const num = parseFloat(v);
        return isNaN(num) ? undefined : num;
      }
      return v;
    })
    .pipe(z.union([z.number().positive('Preço promocional deve ser positivo').finite(), z.undefined(), z.null()]))
    .optional()
    .nullable(),
  tempo_preparo: z
    .union([z.number(), z.string()])
    .transform((v) => {
      if (typeof v === 'string') {
        if (!v || !v.trim()) return undefined;
        const num = parseInt(v, 10);
        return isNaN(num) ? undefined : num;
      }
      return v;
    })
    .pipe(z.union([z.number().int().positive('Tempo deve ser em minutos positivos'), z.undefined(), z.null()]))
    .optional()
    .nullable(),
  calorias: z
    .union([z.number(), z.string()])
    .transform((v) => {
      if (typeof v === 'string') {
        if (!v || !v.trim()) return undefined;
        const num = parseInt(v, 10);
        return isNaN(num) ? undefined : num;
      }
      return v;
    })
    .pipe(z.union([z.number().int().nonnegative('Calorias deve ser não-negativo'), z.undefined(), z.null()]))
    .optional()
    .nullable(),
  vegetariano: z.boolean().default(false).optional(),
  vegano: z.boolean().default(false).optional(),
  sem_gluten: z.boolean().default(false).optional(),
  picante: z.boolean().default(false).optional(),
  destaque: z.boolean().default(false).optional(),
  prato_do_dia: z.boolean().default(false).optional(),
  imagem: z
    .string()
    .min(0)
    .transform((v) => v?.trim() || undefined)
    .pipe(z.union([z.literal(undefined), z.string().url('URL da imagem inválida')]))
    .optional(),
  ordem_exibicao: z.number().int().nonnegative().default(0).optional().nullable(),
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
  mesa_id: z.string().uuid('ID da mesa inválido'),
  data_reserva: z.coerce.date().min(new Date(), 'Data deve ser no futuro'),
  hora_reserva: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:mm'),
  numero_pessoas: z.number().int().min(1, 'Mínimo 1 pessoa').max(20, 'Máximo 20 pessoas'),
  observacoes: z.string().optional(),
  nome_reserva: z.string().min(3).optional(),
  telefone_reserva: z.string().min(7).optional(),
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
