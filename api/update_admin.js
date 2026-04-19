
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updateAdminPassword() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'restaurante_angola_db',
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await connection.execute(
            'UPDATE usuarios SET senha_hash = ? WHERE email = ?',
            [hashedPassword, 'admin@ghu.ao']
        );

        console.log('Senha de admin atualizada com sucesso para: admin123');
        await connection.end();
    } catch (error) {
        console.error('Erro ao atualizar senha:', error);
        process.exit(1);
    }
}

updateAdminPassword();
