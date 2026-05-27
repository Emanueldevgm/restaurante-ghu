/* eslint-disable @typescript-eslint/no-var-requires */
const bcrypt = require('bcryptjs');

const senhas = ['admin123', '123456', 'cliente123'];

senhas.forEach(senha => {
    const hash = bcrypt.hashSync(senha, 10);
    console.log(`Senha: ${senha} -> Hash: ${hash}`);
});