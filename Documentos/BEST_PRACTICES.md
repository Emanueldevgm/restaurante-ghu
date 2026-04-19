# 📜 Boas Práticas de Desenvolvimento - Restaurante GHU

## 🎯 Princípios Gerais

1. **Security First** - Segurança é prioridade em cada decisão
2. **Type Safety** - TypeScript strict mode em todos os projetos
3. **Error Handling** - Tratamento completo de erros com feedback claro
4. **Testing** - Código testado garante qualidade
5. **Documentation** - Código documentado é código melhor

## 🔐 Segurança

### Backend

```typescript
// ✅ BOM - Validar entrada
import { validateBody } from '@middleware/validation.middleware';
import { LoginDTOSchema } from '@schemas/validation.schemas';

router.post('/login', validateBody(LoginDTOSchema), asyncHandler(handler));

// ❌ RUIM - Sem validação
router.post('/login', (req, res) => {
    const { email, password } = req.body; // Sem validar!
});
```

### Autenticação

```typescript
// ✅ BOM - Usar middleware de autenticação
router.get('/profile', authMiddleware, asyncHandler(controller));

// ✅ BOM - Verificar permissões
router.post('/admin', authMiddleware, adminMiddleware, asyncHandler(controller));

// ❌ RUIM - Sem proteção
router.get('/secret-data', (req, res) => {
    // Qualquer um acessa!
});
```

### Variáveis de Ambiente

```typescript
// ✅ BOM - Usar variáveis validadas
import env from '@config/env.config';
const dbUrl = env.DB_HOST; // Já validado

// ❌ RUIM - Usar process.env diretamente
const dbUrl = process.env.DB_HOST; // Pode ser undefined
```

## 📝 Tipagem TypeScript

### Backend

```typescript
// ✅ BOM - Tipos completos
interface CreateUserDTO {
    email: string;
    senha: string;
}

export const register = async (
    req: Request<{}, {}, CreateUserDTO>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // ...
};

// ❌ RUIM - Tipagem fraca
const register = (req: any, res: any) => {
    const { email } = req.body; // Qualquer email!
};
```

### Frontend

```typescript
// ✅ BOM - Componentes com tipos
interface ButtonProps {
    variant: 'primary' | 'secondary';
    onClick: () => void;
    children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant, onClick, children }) => {
    // ...
};

// ❌ RUIM - Props genéricos
const Button: React.FC<any> = (props) => {
    // Sem saber o que vai receber
};
```

## 🚀 Padrões de Código

### Controllers

```typescript
// ✅ BOM - Tratamento de erro com asyncHandler
export class UserController {
    static async getProfile(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const user = await query('SELECT * FROM usuarios WHERE id = ?', [req.user?.userId]);
            res.json({ success: true, data: user });
        } catch (error) {
            next(error); // Deixar middleware tratar
        }
    }
}

// Usar nas rotas
router.get('/profile', authMiddleware, asyncHandler(UserController.getProfile));
```

### Validação com Zod

```typescript
// ✅ BOM - Validar com Zod
const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

router.post('/login', validateBody(LoginSchema), asyncHandler(handler));

// ❌ RUIM - Validação manual
router.post('/login', (req, res) => {
    if (!req.body.email) throw new Error('Email required'); // Repetido em vários lugares
});
```

### Tratamento de Erros

```typescript
// ✅ BOM - Usar erros customizados
throw new NotFoundError('User');
throw new UnauthorizedError('Invalid credentials');
throw new BadRequestError('Email already exists');

// ❌ RUIM - Strings de erro genéricas
res.status(404).json({ message: 'error' });
throw new Error('something went wrong');
```

## 🗄️ Banco de Dados

### Queries

```typescript
// ✅ BOM - Usar prepared statements (anti SQL injection)
const users = await query(
    'SELECT * FROM usuarios WHERE email = ?',
    [email]
);

// ❌ RUIM - Concatenar strings
const users = await query(`SELECT * FROM usuarios WHERE email = '${email}'`);
```

### Transações

```typescript
// ✅ BOM - Usar transações para operações críticas
const result = await transaction(async (conn) => {
    await conn.query('INSERT INTO pedidos ...');
    await conn.query('UPDATE mesas ...');
    return result;
});

// ❌ RUIM - Sem transação
await query('INSERT INTO pedidos ...');
await query('UPDATE mesas ...'); // Se falhar, dados inconsistentes
```

## 🎨 Frontend React

### Componentes

```typescript
// ✅ BOM - Componentes funcionais com tipos
interface CardProps {
    title: string;
    description: string;
    onAction: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, onAction }) => {
    return (
        <div>
            <h3>{title}</h3>
            <p>{description}</p>
            <button onClick={onAction}>Ação</button>
        </div>
    );
};

// ❌ RUIM - Componentes sem tipagem
const Card = ({ title, description, onAction }) => {
    // Não há garantia dos tipos
};
```

### Hooks Customizados

```typescript
// ✅ BOM - Usar hooks validados
interface UseFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

function useFetch<T>(url: string): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetch(url)
            .then((res) => res.json())
            .then((data) => setData(data))
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, [url]);

    return { data, loading, error };
}

// ❌ RUIM - Sem tipos
function useFetch(url) {
    // Qualquer coisa pode vir
}
```

### Formulários com Validação

```typescript
// ✅ BOM - Usar Zod + react-hook-form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginFormData } from '@schemas/validation.schemas';

const LoginForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(LoginSchema),
    });

    const onSubmit = (data: LoginFormData) => {
        // Data está garantido ser do tipo LoginFormData
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('email')} />
            {errors.email && <span>{errors.email.message}</span>}
            <button type="submit">Login</button>
        </form>
    );
};

// ❌ RUIM - Sem validação
const LoginForm = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        // E se for inválido?
    };
};
```

## 📦 Commits e Versionamento

### Commit Messages (Conventional Commits)

```
✅ BOM
feat: adicionar validação Zod no login
fix: corrigir erro de conexão ao banco
docs: melhorar documentação de setup
refactor: simplificar estrutura de tipos

❌ RUIM
update
fixed bug
changes
test
```

### Branches

```
main          - Produção (releases)
develop       - Desenvolvimento (próxima versão)
feature/*     - Novas features
bugfix/*      - Correções de bugs
hotfix/*      - Correções críticas em produção
```

## 🧪 Testando

### Testes Unitários

```typescript
// Backend (Jest)
describe('AuthController', () => {
    it('deve criar novo usuário', async () => {
        const result = await AuthController.register({
            body: {
                nome_completo: 'Test User',
                telefone: '123456789',
                senha: 'password123',
            }
        }, mockResponse, mockNext);

        expect(result.success).toBe(true);
    });

    it('deve rejeitar senha fraca', async () => {
        await expect(
            AuthController.register({
                body: { senha: '123' }
            }, mockResponse, mockNext)
        ).rejects.toThrow('senhas fraca');
    });
});

// Frontend (Vitest)
describe('Button Component', () => {
    it('deve renderizar botão', () => {
        const { getByRole } = render(<Button>Clique</Button>);
        expect(getByRole('button')).toBeInTheDocument();
    });

    it('deve chamar onClick', () => {
        const onClick = vi.fn();
        const { getByRole } = render(<Button onClick={onClick}>Clique</Button>);
        fireEvent.click(getByRole('button'));
        expect(onClick).toHaveBeenCalled();
    });
});
```

## 📊 Performance

### Otimizações Frontend

```typescript
// ✅ BOM - Lazy loading de componentes
const AdminPanel = lazy(() => import('@pages/Admin'));

<Suspense fallback={<Loading />}>
    <AdminPanel />
</Suspense>

// ✅ BOM - Memoização
const Card = React.memo(({ title, data }) => (
    <div>{title}: {data}</div>
));

// ✅ BOM - useCallback para funções estáveis
const handleClick = useCallback(() => {
    doSomething();
}, []);
```

### Otimizações Backend

```typescript
// ✅ BOM - Índices no banco
CREATE INDEX idx_email ON usuarios(email);  // Para buscas rápidas

// ✅ BOM - Connection pooling (já configurado)
const pool = mysql.createPool({
    connectionLimit: 10,
    // ...
});

// ✅ BOM - Paginação
router.get('/items', validateQuery(PaginationSchema), handler);
```

## 🐛 Debugging

### Backend

```typescript
// Usar logging estruturado
console.error('❌ Erro ao processar pedido:', {
    timestamp: new Date().toISOString(),
    userId: req.user?.userId,
    path: req.path,
    error: err.message,
});

// Não fazer
console.log('error'); // Buscando.
```

### Frontend

```typescript
// Usar React DevTools
// Verificar componente tree
// Ver estado e props
// Profile performance

// Console com estrutura
console.log('🔍 Debug info:', {
    item,
    cart,
    total,
});
```

## ✅ Checklist Antes de um PR

- [ ] Código passa no ESLint
- [ ] TypeScript sem erros
- [ ] Testes passando
- [ ] Não há console.log() de debug
- [ ] Commit message segue padrão
- [ ] Variáveis de ambiente validadas
- [ ] Senha nunca em logs
- [ ] Sem dados sensíveis expostos
- [ ] Documentação atualizada

---

**Lembre-se**: Código limpo hoje é menos bugs amanhã! 🚀
