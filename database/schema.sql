-- Navicare+ Database Schema (PostgreSQL, hosted on Supabase)
-- This file documents the schema for reference/dissertation purposes.
-- Tables are created automatically by backend/server.js on startup.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'volunteer'
  age INTEGER,
  gender TEXT,
  phone TEXT,
  address TEXT, -- private, never returned in public API responses
  bio TEXT,
  photo_url TEXT,
  rating_avg NUMERIC DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS help_requests (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER REFERENCES users(id),
  volunteer_id INTEGER REFERENCES users(id),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' or 'accepted'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS help_offers (
  id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES help_requests(id) ON DELETE CASCADE,
  volunteer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (request_id, volunteer_id)
);

CREATE TABLE IF NOT EXISTS declined_requests (
  request_id INTEGER REFERENCES help_requests(id) ON DELETE CASCADE,
  volunteer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (request_id, volunteer_id)
);

CREATE TABLE IF NOT EXISTS volunteer_certificates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
