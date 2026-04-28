const db = require('./src/config/db');
const bcrypt = require('bcrypt');

async function setPassword() {
  try {
    const hashedPassword = await bcrypt.hash('test123', 10);
    await db.query('UPDATE user SET mot_de_passe = ? WHERE email = ?', [hashedPassword, 'houwaida@gmail.com']);
    console.log('Password set for houwaida@gmail.com: test123');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

setPassword();