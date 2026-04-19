const mysql = require('mysql2/promise');

async function seedCategories() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'restaurante_angola_db'
  });

  try {
    const categories = [
      { nome: 'Entradas', descricao: 'Pratos para começar a refeição', ordem: 1 },
      { nome: 'Principais', descricao: 'Pratos principais de nossa culinária', ordem: 2 },
      { nome: 'Sobremesas', descricao: 'Doces e sobremesas', ordem: 3 },
      { nome: 'Bebidas', descricao: 'Bebidas quentes e frias', ordem: 4 }
    ];

    for (const cat of categories) {
      await connection.execute(
        'INSERT INTO categorias (id, nome, descricao, ativo, ordem_exibicao) VALUES (UUID(), ?, ?, 1, ?)',
        [cat.nome, cat.descricao, cat.ordem]
      );
      console.log(`✅ Categoria inserida: ${cat.nome}`);
    }

    console.log('\n✅ Todas as categorias foram inseridas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inserir categorias:', error.message);
  } finally {
    await connection.end();
  }
}

seedCategories();
