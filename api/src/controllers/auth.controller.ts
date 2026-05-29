/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable comma-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable quotes */
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { sendEmail } from '../utils/email.util';
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
    NotFoundError,
    ForbiddenError,
} from '../middleware/error.middleware';
import { v4 as uuidv4 } from 'uuid';

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
                    'SELECT id FROM usuarios WHERE email = $1',
                    [email]
                );
                if (existingEmail.length > 0) {
                    throw new ConflictError('Este email já está cadastrado');
                }
            }

            const existingPhone = await query<Usuario[]>(
                'SELECT id FROM usuarios WHERE telefone = $1',
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'cliente', 'ativo')`,
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

            const user = await query<Usuario[]>(
                'SELECT id, nome_completo, email, telefone, role FROM usuarios WHERE id = $1',
                [userId]
            );

            const userData = user[0];

            const token = generateToken({
                userId: userData.id,
                email: userData.email || '',
                role: userData.role,
            });

            console.log(`[AUTH] ✅ Novo usuário registrado: ${userData.nome_completo} (${userData.email || userData.telefone})`);

            res.status(201).json({
                success: true,
                message: 'Usuário registrado com sucesso',
                data: {
                    token,
                    user: {
                        id: userData.id,
                        nome_completo: userData.nome_completo,
                        email: userData.email,
                        telefone: userData.telefone,
                        role: userData.role,
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
            let searchField = '';

            if (email) {
                const users = await query<Usuario[]>(
                    "SELECT * FROM usuarios WHERE email = $1",
                    [email]
                );
                user = users[0] || null;
                searchField = `email=${email}`;
            } else if (telefone) {
                const users = await query<Usuario[]>(
                    "SELECT * FROM usuarios WHERE telefone = $1",
                    [telefone]
                );
                user = users[0] || null;
                searchField = `telefone=${telefone}`;
            }

            if (!user) {
                console.log(`[AUTH] ❌ Falha login - usuário não encontrado: ${searchField}`);
                throw new UnauthorizedError('Credenciais inválidas. Verifique seu email/telefone e senha.');
            }

            // Verifica status da conta
            if (user.status !== 'ativo') {
                let statusMsg = '';
                if (user.status === 'bloqueado') statusMsg = 'sua conta está bloqueada. Contacte o administrador.';
                else if (user.status === 'inativo') statusMsg = 'sua conta está inativa. Contacte o administrador.';
                else statusMsg = `status da conta: ${user.status}`;
                console.log(`[AUTH] ❌ Tentativa de login em conta ${user.status}: ${user.nome_completo}`);
                throw new UnauthorizedError(`Acesso negado: ${statusMsg}`);
            }

            const isPasswordValid = await comparePassword(senha, user.senha_hash);
            if (!isPasswordValid) {
                console.log(`[AUTH] ❌ Senha inválida para usuário: ${user.nome_completo} (${searchField})`);
                throw new UnauthorizedError('Credenciais inválidas. Verifique sua senha.');
            }

            // Atualiza último acesso
            await query('UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = $1', [user.id]);

            const token = generateToken({
                userId: user.id,
                email: user.email || '',
                role: user.role,
            });

            console.log(`[AUTH] ✅ Login bem-sucedido: ${user.nome_completo} (${user.role})`);

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

    // Atualizar usuário (admin)
    static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { nome_completo, email, telefone, role, status, data_nascimento, genero } = req.body;
            const currentAdminId = (req as any).user?.userId;

            // Impedir que o admin desative ou rebaixe a si mesmo
            if (id === currentAdminId) {
                // Permite apenas alterar dados não sensíveis, mas bloqueia mudança de role/status
                if (role && role !== 'administrador') {
                    throw new ForbiddenError('Não é possível alterar sua própria função de administrador.');
                }
                if (status && status !== 'ativo') {
                    throw new ForbiddenError('Não é possível desativar/bloquear a própria conta.');
                }
            }

            const userResult = await query<Usuario[]>(
                'SELECT id, role FROM usuarios WHERE id = $1',
                [id]
            );
            if (!userResult[0]) throw new NotFoundError('Usuário não encontrado');

            if (email) {
                const existing = await query<Usuario[]>(
                    'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
                    [email, id]
                );
                if (existing.length > 0) throw new ConflictError('Este email já está em uso');
            }

            await query(
                `UPDATE usuarios SET 
                    nome_completo = COALESCE($1, nome_completo),
                    email = COALESCE($2, email),
                    telefone = COALESCE($3, telefone),
                    role = COALESCE($4, role),
                    status = COALESCE($5, status),
                    data_nascimento = COALESCE($6, data_nascimento),
                    genero = COALESCE($7, genero),
                    updated_at = NOW()
                WHERE id = $8`,
                [nome_completo, email, telefone, role, status, data_nascimento, genero, id]
            );

            console.log(`[ADMIN] Usuário ${id} atualizado por ${currentAdminId}`);
            res.json({ success: true, message: 'Usuário atualizado com sucesso' });
        } catch (error) {
            next(error);
        }
    }

    // Deletar usuário (admin)
    static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const currentAdminId = (req as any).user?.userId;

            if (id === currentAdminId) {
                throw new ForbiddenError('Não é possível eliminar a própria conta de administrador.');
            }

            const userResult = await query<Usuario[]>(
                'SELECT id FROM usuarios WHERE id = $1',
                [id]
            );
            if (!userResult[0]) throw new NotFoundError('Usuário não encontrado');

            // Verificar se o usuário tem pedidos ou reservas antes de deletar? (opcional, mas boa prática)
            // Neste caso, vamos apenas deletar (cascade no DB cuida das referências)
            await query('DELETE FROM usuarios WHERE id = $1', [id]);

            console.log(`[ADMIN] Usuário ${id} eliminado por ${currentAdminId}`);
            res.json({ success: true, message: 'Usuário eliminado com sucesso' });
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

            const user = await query<any[]>(
                `SELECT id, nome_completo, email, telefone, telefone_alternativo, 
         bi, nif, role, status, foto_perfil, data_nascimento, genero, 
         created_at, ultimo_acesso
         FROM usuarios WHERE id = $1`,
                [userId]
            );

            if (!user[0]) {
                throw new UnauthorizedError('Usuário não encontrado');
            }

            res.json({
                success: true,
                data: user[0],
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
                    'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
                    [email, userId]
                );
                if (existing.length > 0) {
                    throw new ConflictError('Este email já está em uso');
                }
            }

            await query(
                `UPDATE usuarios SET 
         nome_completo = COALESCE($1, nome_completo),
         email = COALESCE($2, email),
         telefone = COALESCE($3, telefone),
         telefone_alternativo = COALESCE($4, telefone_alternativo),
         data_nascimento = COALESCE($5, data_nascimento),
         genero = COALESCE($6, genero),
         foto_perfil = COALESCE($7, foto_perfil),
         updated_at = NOW()
         WHERE id = $8`,
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

    static async forgotPassword(
        req: Request<{}, {}, { email: string }>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { email } = req.body;
            if (!email) {
                throw new BadRequestError('Email é obrigatório.');
            }

            const users = await query<Usuario[]>(
                'SELECT id, nome_completo FROM usuarios WHERE email = $1',
                [email]
            );

            if (users.length === 0) {
                // Por segurança, não revelamos se o email existe
                res.json({
                    success: true,
                    message: 'Se o email estiver cadastrado, receberá um link de recuperação.',
                });
                return;
            }

            const token = uuidv4();
            const expiresAt = new Date(Date.now() + 3600000); // 1 hora

            await query(
                'INSERT INTO password_resets (id, email, token, expires_at, used) VALUES ($1, $2, $3, $4, FALSE)',
                [uuidv4(), email, token, expiresAt]
            );

            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

            await sendEmail(
                email,
                'Redefinição de Senha - Restaurante GHU',
                `<p>Olá ${users[0].nome_completo},</p>
       <p>Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo para continuar:</p>
       <p><a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#2563EB;color:#fff;border-radius:5px;text-decoration:none;">Redefinir Senha</a></p>
       <p>Se não foi você, ignore este email. O link expira em 1 hora.</p>`
            );

            console.log(`[AUTH] Link de redefinição enviado para ${email}`);
            res.json({
                success: true,
                message: 'Se o email estiver cadastrado, receberá um link de recuperação.',
            });
        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(
        req: Request<{}, {}, { token: string; newPassword: string }>,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                throw new BadRequestError('Token e nova senha são obrigatórios.');
            }
            if (newPassword.length < 6) {
                throw new BadRequestError('A nova senha deve ter pelo menos 6 caracteres.');
            }

            const resets = await query<any[]>(
                'SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW() AND used = FALSE',
                [token]
            );

            if (resets.length === 0) {
                throw new BadRequestError('Token inválido ou expirado.');
            }

            const reset = resets[0];
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await query('UPDATE usuarios SET senha_hash = $1 WHERE email = $2', [hashedPassword, reset.email]);
            await query('UPDATE password_resets SET used = TRUE WHERE id = $1', [reset.id]);

            console.log(`[AUTH] Senha redefinida para ${reset.email}`);
            res.json({
                success: true,
                message: 'Senha atualizada com sucesso.',
            });
        } catch (error) {
            next(error);
        }
    }

    // Alterar senha (usuário logado)
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

            const userResult = await query<Usuario[]>(
                'SELECT senha_hash FROM usuarios WHERE id = $1',
                [userId]
            );

            const user = userResult[0];

            const isPasswordValid = await comparePassword(senha_atual, user.senha_hash);
            if (!isPasswordValid) {
                throw new UnauthorizedError('Senha atual incorreta');
            }

            const senha_hash = await hashPassword(senha_nova);
            await query('UPDATE usuarios SET senha_hash = $1, updated_at = NOW() WHERE id = $2', [
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
                    'SELECT id FROM usuarios WHERE email = $1',
                    [email]
                );
                if (existingEmail.length > 0) {
                    throw new ConflictError('Este email já está cadastrado');
                }
            }

            const existingPhone = await query<Usuario[]>(
                'SELECT id FROM usuarios WHERE telefone = $1',
                [telefone]
            );
            if (existingPhone.length > 0) {
                throw new ConflictError('Este telefone já está cadastrado');
            }

            if (bi) {
                const existingBI = await query<Usuario[]>(
                    'SELECT id FROM usuarios WHERE bi = $1',
                    [bi]
                );
                if (existingBI.length > 0) {
                    throw new ConflictError('Este BI já está cadastrado');
                }
            }

            if (nif) {
                const existingNIF = await query<Usuario[]>(
                    'SELECT id FROM usuarios WHERE nif = $1',
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
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

            const userResult = await query<any[]>(
                `SELECT id, nome_completo, email, telefone, telefone_alternativo,
         bi, nif, role, status, data_nascimento, genero, created_at
         FROM usuarios WHERE id = $1`,
                [userId]
            );

            const user = userResult[0];

            console.log(`[ADMIN] Novo usuário criado por ${(req as any).user?.userId}: ${user.nome_completo} (${user.role})`);

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
            const currentAdminId = (req as any).user?.userId;

            if (id === currentAdminId) {
                throw new ForbiddenError('Não é possível alterar o status da própria conta de administrador.');
            }

            if (!['ativo', 'inativo', 'bloqueado'].includes(status)) {
                throw new BadRequestError('Status inválido. Use: ativo, inativo, bloqueado.');
            }

            const existingUser = await query<Usuario[]>(
                'SELECT id, role FROM usuarios WHERE id = $1',
                [id]
            );

            if (!existingUser[0]) {
                throw new NotFoundError('Usuário não encontrado');
            }

            // Impedir que um admin bloqueie outro admin (exceto se for ele mesmo, já barrado acima)
            if (existingUser[0].role === 'administrador' && status !== 'ativo') {
                throw new ForbiddenError('Não é possível bloquear ou inativar outro administrador.');
            }

            await query(
                'UPDATE usuarios SET status = $1, updated_at = NOW() WHERE id = $2',
                [status, id]
            );

            console.log(`[ADMIN] Status do usuário ${id} alterado para ${status} por ${currentAdminId}`);
            res.json({
                success: true,
                message: `Status do usuário atualizado para ${status}`,
            });
        } catch (error) {
            next(error);
        }
    }
}