import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import {
    Usuario,
    RegisterDTO,
    AdminCreateUserDTO,
    LoginDTO,
    AuthResponse,
} from '../types';
import {
    BadRequestError,
    UnauthorizedError,
    ConflictError,
} from '../middleware/error.middleware';
import { v4 as uuidv4 } from 'uuid';

type UserStatus = 'ativo' | 'inativo' | 'bloqueado';

export class AuthController {
    // Registro de novo usuário
    static async register(
        req: Request<{}, {}, RegisterDTO>,
        res: Response<AuthResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const {
                nome_completo,
                email,
                telefone,
                senha,
                bi,
                data_nascimento,
                genero,
            } = req.body;

            if (!nome_completo || !telefone || !senha) {
                throw new BadRequestError('Nome completo, telefone e senha são obrigatórios');
            }

            if (senha.length < 6) {
                throw new BadRequestError('A senha deve ter pelo menos 6 caracteres');
            }

            if (email) {
                const existingEmail = await query<Usuario[]>(
                    'SELECT id FROM usuarios WHERE email = ?',
                    [email]
                );
                if (existingEmail.length > 0) {
                    throw new ConflictError('Este email já está cadastrado');
                }
            }

            const existingPhone = await query<Usuario[]>(
                'SELECT id FROM usuarios WHERE telefone = ?',
                [telefone]
            );
            if (existingPhone.length > 0) {
                throw new ConflictError('Este telefone já está cadastrado');
            }

            const senha_hash = await hashPassword(senha);

            const userId = uuidv4();
            await query(
                `INSERT INTO usuarios (
          id, nome_completo, email, telefone, senha_hash, bi, 
          data_nascimento, genero, role, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'cliente', 'ativo')`,
                [
                    userId,
                    nome_completo,
                    email || null,
                    telefone,
                    senha_hash,
                    bi || null,
                    data_nascimento || null,
                    genero || null,
                ]
            );

            const [user] = await query<Usuario[]>(
                'SELECT id, nome_completo, email, telefone, role FROM usuarios WHERE id = ?',
                [userId]
            );

            const token = generateToken({
                userId: user.id,
                email: user.email || '',
                role: user.role,
            });

            res.status(201).json({
                success: true,
                message: 'Usuário registrado com sucesso',
                data: {
                    token,
                    user: {
                        id: user.id,
                        nome_completo: user.nome_completo,
                        email: user.email,
                        telefone: user.telefone,
                        role: user.role,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // Login
    static async login(
        req: Request<{}, {}, LoginDTO>,
        res: Response<AuthResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const { email, telefone, senha } = req.body;

            if (!senha || (!email && !telefone)) {
                throw new BadRequestError('Email ou telefone e senha são obrigatórios');
            }

            let user: Usuario | null = null;
            if (email) {
                const users = await query<Usuario[]>(
                    'SELECT * FROM usuarios WHERE email = ? AND status = "ativo"',
                    [email]
                );
                user = users[0] || null;
            } else if (telefone) {
                const users = await query<Usuario[]>(
                    'SELECT * FROM usuarios WHERE telefone = ? AND status = "ativo"',
                    [telefone]
                );
                user = users[0] || null;
            }

            if (!user) {
                console.log(`[AUTH] Usuário não encontrado: email=${email}, telefone=${telefone}`);
                throw new UnauthorizedError('Credenciais inválidas');
            }

            const isPasswordValid = await comparePassword(senha, user.senha_hash);
            if (!isPasswordValid) {
                console.log(`[AUTH] Senha inválida para usuário: ${email || telefone}`);
                throw new UnauthorizedError('Credenciais inválidas');
            }

            await query('UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?', [
                user.id,
            ]);

            const token = generateToken({
                userId: user.id,
                email: user.email || '',
                role: user.role,
            });

            console.log(`[AUTH] ✅ Login bem-sucedido: ${user.nome_completo}`);

            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                data: {
                    token,
                    user: {
                        id: user.id,
                        nome_completo: user.nome_completo,
                        email: user.email,
                        telefone: user.telefone,
                        role: user.role,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // Obter perfil do usuário autenticado
    static async getProfile(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = (req as any).user?.userId;

            const [user] = await query<any[]>(
                `SELECT id, nome_completo, email, telefone, telefone_alternativo, 
         bi, nif, role, status, foto_perfil, data_nascimento, genero, 
         created_at, ultimo_acesso
         FROM usuarios WHERE id = ?`,
                [userId]
            );

            if (!user) {
                throw new UnauthorizedError('Usuário não encontrado');
            }

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    // Atualizar perfil
    static async updateProfile(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const {
                nome_completo,
                email,
                telefone,
                telefone_alternativo,
                data_nascimento,
                genero,
                foto_perfil,
            } = req.body;

            if (email) {
                const existing = await query<Usuario[]>(
                    'SELECT id FROM usuarios WHERE email = ? AND id != ?',
                    [email, userId]
                );
                if (existing.length > 0) {
                    throw new ConflictError('Este email já está em uso');
                }
            }

            await query(
                `UPDATE usuarios SET 
         nome_completo = COALESCE(?, nome_completo),
         email = COALESCE(?, email),
         telefone = COALESCE(?, telefone),
         telefone_alternativo = COALESCE(?, telefone_alternativo),
         data_nascimento = COALESCE(?, data_nascimento),
         genero = COALESCE(?, genero),
         foto_perfil = COALESCE(?, foto_perfil),
         updated_at = NOW()
         WHERE id = ?`,
                [
                    nome_completo,
                    email,
                    telefone,
                    telefone_alternativo,
                    data_nascimento,
                    genero,
                    foto_perfil,
                    userId,
                ]
            );

            res.json({
                success: true,
                message: 'Perfil atualizado com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    // Alterar senha
    static async changePassword(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const { senha_atual, senha_nova } = req.body;

            if (!senha_atual || !senha_nova) {
                throw new BadRequestError('Senha atual e nova senha são obrigatórias');
            }

            if (senha_nova.length < 6) {
                throw new BadRequestError('A nova senha deve ter pelo menos 6 caracteres');
            }

            const [user] = await query<Usuario[]>(
                'SELECT senha_hash FROM usuarios WHERE id = ?',
                [userId]
            );

            const isPasswordValid = await comparePassword(senha_atual, user.senha_hash);
            if (!isPasswordValid) {
                throw new UnauthorizedError('Senha atual incorreta');
            }

            const senha_hash = await hashPassword(senha_nova);
            await query('UPDATE usuarios SET senha_hash = ?, updated_at = NOW() WHERE id = ?', [
                senha_hash,
                userId,
            ]);

            res.json({
                success: true,
                message: 'Senha alterada com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    // Listar todos os usuários (apenas admin)
    static async listUsers(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userRole = (req as any).user?.role;
            if (userRole !== 'administrador') {
                throw new UnauthorizedError('Acesso negado. Apenas administradores podem listar usuários.');
            }

            const users = await query<Usuario[]>(
                `SELECT id, nome_completo, email, telefone, telefone_alternativo,
         bi, nif, role, status, foto_perfil, data_nascimento, genero,
         created_at, ultimo_acesso
         FROM usuarios ORDER BY created_at DESC`
            );

            res.json({
                success: true,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }

    // Criar usuário (apenas admin)
    static async createUser(
        req: Request<{}, {}, AdminCreateUserDTO>,
        res: Response<AuthResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const userRole = (req as any).user?.role;
            if (userRole !== 'administrador') {
                throw new UnauthorizedError('Acesso negado. Apenas administradores podem criar usuários.');
            }

            const {
                nome_completo,
                email,
                telefone,
                senha,
                bi,
                nif,
                telefone_alternativo,
                data_nascimento,
                genero,
                role,
                status,
            } = req.body;

            if (!nome_completo || !telefone || !senha) {
                throw new BadRequestError('Nome completo, telefone e senha são obrigatórios');
            }

            if (senha.length < 6) {
                throw new BadRequestError('A senha deve ter pelo menos 6 caracteres');
            }

            if (email) {
                const existingEmail = await query<Usuario[]>(
                    'SELECT id FROM usuarios WHERE email = ?',
                    [email]
                );
                if (existingEmail.length > 0) {
                    throw new ConflictError('Este email já está cadastrado');
                }
            }

            const existingPhone = await query<Usuario[]>(
                'SELECT id FROM usuarios WHERE telefone = ?',
                [telefone]
            );
            if (existingPhone.length > 0) {
                throw new ConflictError('Este telefone já está cadastrado');
            }

            if (bi) {
                const existingBI = await query<Usuario[]>(
                    'SELECT id FROM usuarios WHERE bi = ?',
                    [bi]
                );
                if (existingBI.length > 0) {
                    throw new ConflictError('Este BI já está cadastrado');
                }
            }

            if (nif) {
                const existingNIF = await query<Usuario[]>(
                    'SELECT id FROM usuarios WHERE nif = ?',
                    [nif]
                );
                if (existingNIF.length > 0) {
                    throw new ConflictError('Este NIF já está cadastrado');
                }
            }

            const senha_hash = await hashPassword(senha);

            const userId = uuidv4();
            await query(
                `INSERT INTO usuarios (
          id, nome_completo, email, telefone, telefone_alternativo, senha_hash,
          bi, nif, role, status, data_nascimento, genero
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    nome_completo,
                    email || null,
                    telefone,
                    telefone_alternativo || null,
                    senha_hash,
                    bi || null,
                    nif || null,
                    role || 'cliente',
                    status || 'ativo',
                    data_nascimento || null,
                    genero || null,
                ]
            );

            const [user] = await query<any[]>(
                `SELECT id, nome_completo, email, telefone, telefone_alternativo,
         bi, nif, role, status, data_nascimento, genero, created_at
         FROM usuarios WHERE id = ?`,
                [userId]
            );

            res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso',
                data: {
                    user: {
                        id: user.id,
                        nome_completo: user.nome_completo,
                        email: user.email,
                        telefone: user.telefone,
                        telefone_alternativo: user.telefone_alternativo || null,
                        bi: user.bi || null,
                        nif: user.nif || null,
                        role: user.role,
                        status: user.status,
                        data_nascimento: user.data_nascimento || null,
                        genero: user.genero || null,
                        created_at: user.created_at,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // Alterar status do usuário (apenas admin)
    static async updateUserStatus(
        req: Request<{ id: string }, {}, { status: string }>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userRole = (req as any).user?.role;
            if (userRole !== 'administrador') {
                throw new UnauthorizedError('Acesso negado. Apenas administradores podem alterar status de usuários.');
            }

            const { id } = req.params;
            const { status } = req.body;

            if (!['ativo', 'inativo', 'bloqueado'].includes(status)) {
                throw new BadRequestError('Status inválido');
            }

            const [existingUser] = await query<Usuario[]>(
                'SELECT id FROM usuarios WHERE id = ?',
                [id]
            );

            if (!existingUser) {
                throw new BadRequestError('Usuário não encontrado');
            }

            await query(
                'UPDATE usuarios SET status = ?, updated_at = NOW() WHERE id = ?',
                [status, id]
            );

            res.json({
                success: true,
                message: 'Status do usuário atualizado com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }
}