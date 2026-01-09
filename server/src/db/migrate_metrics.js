const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'calculator_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function migrateMetrics() {
  console.log('🔄 Starting metrics tables migration...');

  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'metrics_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schemaSql);

    console.log('✅ Metrics tables created successfully');
    console.log('✅ Indexes created');
    console.log('✅ Views created');
    console.log('✅ Functions created');
    console.log('🎉 Metrics migration completed successfully!');

    // Verify tables exist
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('calculation_metrics', 'performance_metrics', 'user_activity')
      ORDER BY table_name;
    `);

    console.log('\n📊 Metrics tables created:');
    tableCheck.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    // Verify views exist
    const viewCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND table_name IN ('active_users_last_hour', 'calculation_statistics', 'average_performance')
      ORDER BY table_name;
    `);

    console.log('\n📈 Metrics views created:');
    viewCheck.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
migrateMetrics()
  .then(() => {
    console.log('\n✨ Metrics system is ready!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error);
    process.exit(1);
  });
