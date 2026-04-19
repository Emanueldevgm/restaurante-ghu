// Enums baseados no schema MySQL
export type UserRole = 'cliente' | 'administrador' | 'garcom' | 'cozinha' | 'entregador' | 'gerente';
export type UserStatus = 'ativo' | 'inativo' | 'bloqueado';
export type Genero = 'masculino' | 'feminino' | 'outro';

export type Provincia =
    | 'Luanda' | 'Bengo' | 'Benguela' | 'Bié' | 'Cabinda'
    | 'Cuando Cubango' | 'Cuanza Norte' | 'Cuanza Sul' | 'Cunene'
    | 'Huambo' | 'Huíla' | 'Lunda Norte' | 'Lunda Sul' | 'Malanje'
    | 'Moxico' | 'Namibe' | 'Uíge' | 'Zaire';

export type StatusItem = 'disponivel' | 'indisponivel' | 'esgotado';
export type TipoPedido = 'delivery' | 'retirada' | 'mesa';
export type StatusPedido =
    | 'carrinho' | 'pendente' | 'confirmado' | 'em_preparo'
    | 'pronto' | 'saiu_entrega' | 'entregue' | 'cancelado';

export type MetodoPagamento =
    | 'dinheiro' | 'multicaixa' | 'multicaixa_express'
    | 'transferencia_bancaria' | 'paypal'
    | 'unitel_money' | 'atlantico_money';

export type StatusPagamento =
    | 'pendente' | 'processando' | 'aprovado'
    | 'recusado' | 'estornado' | 'cancelado';

export type TipoMesa = 'normal' | 'vip' | 'familia' | 'casal';
export type StatusReserva =
    | 'pendente' | 'confirmada' | 'em_andamento'
    | 'finalizada' | 'cancelada' | 'nao_compareceu';

export type StatusEntrega =
    | 'preparando' | 'saiu_entrega' | 'em_transito'
    | 'proximo_destino' | 'entregue' | 'falha_entrega';

// Interfaces de Modelos
export interface Usuario {
    id: string;
    nome_completo: string;
    email: string | null;
    telefone: string;
    telefone_alternativo: string | null;
    senha_hash: string;
    bi: string | null;
    nif: string | null;
    role: UserRole;
    status: UserStatus;
    foto_perfil: string | null;
    data_nascimento: Date | null;
    genero: Genero | null;
    created_at: Date;
    updated_at: Date;
    ultimo_acesso: Date | null;
}

export interface EnderecoCliente {
    id: string;
    usuario_id: string;
    nome_endereco: string;
    provincia: Provincia;
    municipio: string;
    bairro: string;
    rua: string;
    numero: string | null;
    condominio: string | null;
    apartamento: string | null;
    ponto_referencia: string | null;
    coordenadas_gps: string | null;
    principal: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Categoria {
    id: string;
    nome: string;
    nome_en: string | null;
    descricao: string | null;
    imagem: string | null;
    ordem_exibicao: number;
    ativo: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ItemCardapio {
    id: string;
    categoria_id: string;
    nome: string;
    nome_en: string | null;
    descricao: string | null;
    preco_kz: number;
    preco_promocional_kz: number | null;
    tempo_preparo: number | null;
    calorias: number | null;
    vegetariano: boolean;
    vegano: boolean;
    sem_gluten: boolean;
    picante: boolean;
    status: StatusItem;
    destaque: boolean;
    prato_do_dia: boolean;
    imagem: string | null;
    ordem_exibicao: number;
    created_at: Date;
    updated_at: Date;
}

export interface Pedido {
    id: string;
    numero_pedido: number;
    usuario_id: string | null;
    tipo: TipoPedido;
    status: StatusPedido;
    endereco_id: string | null;
    taxa_entrega_kz: number;
    distancia_km: number | null;
    subtotal_kz: number;
    desconto_kz: number;
    total_kz: number;
    observacoes: string | null;
    observacoes_entrega: string | null;
    tempo_estimado: number | null;
    data_prevista_entrega: Date | null;
    reserva_id: string | null;
    mesa_id: string | null;
    cupom_id: string | null;
    created_at: Date;
    updated_at: Date;
    confirmado_em: Date | null;
    finalizado_em: Date | null;
}

export interface ItemPedido {
    id: string;
    pedido_id: string;
    item_cardapio_id: string | null;
    nome_item: string;
    preco_unitario_kz: number;
    quantidade: number;
    subtotal_kz: number;
    observacoes: string | null;
    created_at: Date;
}

export interface Mesa {
    id: string;
    numero: string;
    capacidade: number;
    localizacao: string | null;
    tipo: TipoMesa;
    ativa: boolean;
    observacoes: string | null;
    created_at: Date;
}

export interface Reserva {
    id: string;
    usuario_id: string | null;
    mesa_id: string | null;
    nome_cliente: string;
    telefone_cliente: string;
    email_cliente: string | null;
    quantidade_pessoas: number;
    data_reserva: Date;
    hora_reserva: string;
    status: StatusReserva;
    ocasiao_especial: string | null;
    observacoes: string | null;
    created_at: Date;
    updated_at: Date;
    confirmada_em: Date | null;
    check_in_em: Date | null;
    check_out_em: Date | null;
}

// DTOs para Requests
export interface RegisterDTO {
    nome_completo: string;
    email?: string;
    telefone: string;
    senha: string;
    bi?: string;
    nif?: string;
    data_nascimento?: string;
    genero?: Genero;
}

export interface AdminCreateUserDTO {
    nome_completo: string;
    email?: string;
    telefone: string;
    telefone_alternativo?: string;
    senha: string;
    bi?: string;
    nif?: string;
    role?: UserRole;
    status?: UserStatus;
    data_nascimento?: string;
    genero?: Genero;
}

export interface LoginDTO {
    email?: string;
    telefone?: string;
    senha: string;
}

export interface ChangePasswordDTO {
    senha_atual: string;
    senha_nova: string;
    confirmacao: string;
}

export interface UpdateProfileDTO {
    nome_completo?: string;
    email?: string;
    telefone?: string;
    data_nascimento?: string;
    genero?: Genero;
}

export interface CreateItemCardapioDTO {
    categoria_id: string;
    nome: string;
    nome_en?: string;
    descricao?: string;
    preco_kz: number;
    preco_promocional_kz?: number;
    tempo_preparo?: number;
    calorias?: number;
    vegetariano?: boolean;
    vegano?: boolean;
    sem_gluten?: boolean;
    picante?: boolean;
    destaque?: boolean;
    prato_do_dia?: boolean;
    imagem?: string;
}

export interface UpdateItemCardapioDTO extends Partial<CreateItemCardapioDTO> {}

export interface CreatePedidoDTO {
    tipo: TipoPedido;
    endereco_id?: string;
    mesa_id?: string;
    itens: {
        item_cardapio_id: string;
        quantidade: number;
        observacoes?: string;
    }[];
    observacoes?: string;
    observacoes_entrega?: string;
    cupom_codigo?: string;
}

export interface CreateReservaDTO {
    mesa_id?: string;
    nome_cliente: string;
    telefone_cliente: string;
    email_cliente?: string;
    quantidade_pessoas: number;
    data_reserva: string;
    hora_reserva: string;
    ocasiao_especial?: string;
    observacoes?: string;
}

// Response types
export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        token: string;
        user: {
            id: string;
            nome_completo: string;
            email: string | null;
            telefone: string;
            role: UserRole;
        };
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
