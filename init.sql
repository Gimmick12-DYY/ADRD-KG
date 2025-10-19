-- Initial database setup for ADRD Knowledge Graph
-- This file is automatically executed when PostgreSQL container starts

-- Create the database if it doesn't exist
-- (This is handled by POSTGRES_DB environment variable)

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search optimization

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (will be created by Django migrations)
-- These are just placeholders and will be overridden by Django

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE adrd_kg TO adrd_user;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'ADRD Knowledge Graph database initialized successfully';
END $$;
