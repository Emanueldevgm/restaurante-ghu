const bcrypt = require('bcryptjs'); 

const password = '';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Hash gerado:', hash);
});