-- J4 Internal Manager Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'operador', 'consulta');
CREATE TYPE import_status AS ENUM ('en_transito', 'recibido', 'parcial');
CREATE TYPE product_type AS ENUM ('acrilico_cast', 'espejo', 'accesorios');
CREATE TYPE movement_type AS ENUM ('entrada', 'salida', 'transferencia');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role DEFAULT 'consulta',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Branches table
CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert initial branches
INSERT INTO branches (name) VALUES
  ('acriestilo-cucuta'),
  ('creatis-cucuta'),
  ('acriestilo-bucaramanga'),
  ('acriestilo-medellin');

-- Imports table
CREATE TABLE imports (
  id SERIAL PRIMARY KEY,
  supplier VARCHAR(255) NOT NULL,
  total_usd DECIMAL(12,2) NOT NULL,
  trm DECIMAL(8,2) NOT NULL,
  import_cost_percent DECIMAL(5,2) DEFAULT 40.00,
  total_cop DECIMAL(15,2) NOT NULL,
  status import_status DEFAULT 'en_transito',
  proforma_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  import_id INTEGER REFERENCES imports(id) ON DELETE CASCADE NOT NULL,
  type product_type NOT NULL,
  dimensions VARCHAR(100) NOT NULL,
  thickness DECIMAL(5,2),
  color VARCHAR(100),
  weight_per_unit DECIMAL(8,2),
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost_cop DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inventory table
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(product_id, branch_id)
);

-- Inventory movements table
CREATE TABLE inventory_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  from_branch_id INTEGER REFERENCES branches(id),
  to_branch_id INTEGER REFERENCES branches(id),
  quantity INTEGER NOT NULL,
  type movement_type NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Prices table
CREATE TABLE prices (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  margin_percent DECIMAL(5,2) NOT NULL,
  suggested_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(product_id)
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Branches policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view branches" ON branches
  FOR SELECT TO authenticated USING (true);

-- Imports policies
CREATE POLICY "Users can view their own imports and seed data" ON imports
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Operadores and admins can create imports" ON imports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('operador', 'admin')
    )
  );

CREATE POLICY "Users can update their own imports" ON imports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all imports" ON imports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Products policies
CREATE POLICY "Authenticated users can view products" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create products" ON products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE TO authenticated USING (true);

-- Inventory policies
CREATE POLICY "Authenticated users can view inventory" ON inventory
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage inventory" ON inventory
  FOR ALL TO authenticated USING (true);

-- Prices policies
CREATE POLICY "Authenticated users can view prices" ON prices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage prices" ON prices
  FOR ALL TO authenticated USING (true);

-- Inventory policies
CREATE POLICY "Authenticated users can view inventory" ON inventory
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Operadores and admins can manage inventory" ON inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('operador', 'admin')
    )
  );

-- Inventory movements policies
CREATE POLICY "Authenticated users can view movements" ON inventory_movements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Operadores and admins can create movements" ON inventory_movements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('operador', 'admin')
    )
  );

-- Prices policies
CREATE POLICY "Authenticated users can view prices" ON prices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Operadores and admins can manage prices" ON prices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('operador', 'admin')
    )
  );

-- Function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'consulta');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_imports_updated_at
  BEFORE UPDATE ON imports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
