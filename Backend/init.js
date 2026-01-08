// init.js
const Pool = require('./db/index');
const  initializeDb  = require('./db/schema');

const initDb = async () => {
  try {
    const client = await Pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Connected to PostgreSQL at:', res.rows[0].now);
    client.release();

    await initializeDb();
  } catch (err) {
    console.error('Error during DB initialization:', err);
    // process.exit(1); 
  }
};

module.exports = initDb;
