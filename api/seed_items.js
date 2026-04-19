const mysql = require('mysql2/promise');

async function seedItems() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'restaurante_angola_db'
  });

  try {
    // Primeiro pega as categorias
    const [categories] = await connection.execute('SELECT id, nome FROM categorias WHERE ativo = 1');
    
    if (categories.length === 0) {
      console.log('❌ Nenhuma categoria encontrada. Insira categorias primeiro.');
      return;
    }

    const items = [
      {
        categoria_nome: 'Entradas',
        nome: 'Pastéis de Carne',
        descricao: 'Pastéis crocantes recheados com carne moída temperada',
        preco_kz: 500,
        tempo_preparo: 15,
        vegetariano: false,
        picante: true
      },
      {
        categoria_nome: 'Principais',
        nome: 'Moamba de Galinha',
        descricao: 'Tradicional frango guisado com fundo de caldo de amendoim',
        preco_kz: 2500,
        tempo_preparo: 45,
        vegetariano: false,
        picante: false
      },
      {
        categoria_nome: 'Principais',
        nome: 'Carbonado Assado',
        descricao: 'Carne de vaca assada no forno com batatas e legumes',
        preco_kz: 3000,
        tempo_preparo: 60,
        vegetariano: false,
        picante: false
      },
      {
        categoria_nome: 'Sobremesas',
        nome: 'Bolo de Chocolate',
        descricao: 'Bolo úmido de chocolate belga com cobertura cremosa',
        preco_kz: 800,
        tempo_preparo: 0,
        vegetariano: true,
        picante: false,
        calorias: 450
      },
      {
        categoria_nome: 'Bebidas',
        nome: 'Cerveja Angolana',
        descricao: 'Cerveja fria premium',
        preco_kz: 300,
        tempo_preparo: 0,
        vegetariano: true,
        vegano: true,
        picante: false
      }
    ];

    for (const item of items) {
      const categoria = categories.find(c => c.nome === item.categoria_nome);
      if (!categoria) {
        console.log(`⚠️  Categoria ${item.categoria_nome} não encontrada`);
        continue;
      }

      await connection.execute(
        `INSERT INTO itens_cardapio 
        (id, categoria_id, nome, descricao, preco_kz, tempo_preparo, vegetariano, vegano, sem_gluten, picante, status, calorias) 
        VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 0, ?, 'disponivel', ?)`,
        [
          categoria.id,
          item.nome,
          item.descricao,
          item.preco_kz,
          item.tempo_preparo || null,
          item.vegetariano ? 1 : 0,
          item.vegano ? 1 : 0,
          item.picante ? 1 : 0,
          item.calorias || null
        ]
      );
      console.log(`✅ Item inserido: ${item.nome}`);
    }

    console.log('\n✅ Todos os itens foram inseridos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inserir itens:', error.message);
  } finally {
    await connection.end();
  }
}

seedItems();
