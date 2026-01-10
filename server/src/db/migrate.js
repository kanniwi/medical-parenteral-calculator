const { pool } = require('./pool');

async function migrate() {
  try {
    console.log('Starting database migration...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table created');

    // Create calculations table (user_id is nullable for guest mode)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS calculations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        glucose_volume DECIMAL(10, 2) NOT NULL,
        glucose_concentration DECIMAL(10, 2) NOT NULL,
        amino_acids_volume DECIMAL(10, 2) NOT NULL,
        amino_acids_concentration DECIMAL(10, 2) NOT NULL,
        lipids_volume DECIMAL(10, 2) NOT NULL,
        lipids_concentration DECIMAL(10, 2) NOT NULL,
        glucose_grams DECIMAL(10, 2) NOT NULL,
        glucose_calories DECIMAL(10, 2) NOT NULL,
        amino_acids_grams DECIMAL(10, 2) NOT NULL,
        amino_acids_calories DECIMAL(10, 2) NOT NULL,
        lipids_grams DECIMAL(10, 2) NOT NULL,
        lipids_calories DECIMAL(10, 2) NOT NULL,
        total_calories DECIMAL(10, 2) NOT NULL,
        total_volume DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Calculations table created');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    console.log('Indexes created');

    // Create trigger for updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('Triggers created');

    console.log('Database migration completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
