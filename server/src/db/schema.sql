-- Database schema for Parenteral Nutrition Calculator

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calculations table (для зарегистрированных пользователей)
CREATE TABLE IF NOT EXISTS calculations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Input data
    glucose_volume DECIMAL(10, 2) NOT NULL,
    glucose_concentration DECIMAL(10, 2) NOT NULL,
    amino_acids_volume DECIMAL(10, 2) NOT NULL,
    amino_acids_concentration DECIMAL(10, 2) NOT NULL,
    lipids_volume DECIMAL(10, 2) NOT NULL,
    lipids_concentration DECIMAL(10, 2) NOT NULL,
    
    -- Calculated results
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
