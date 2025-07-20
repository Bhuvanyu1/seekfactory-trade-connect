-- Phase 2: Core Database Schema for B2B Marketplace

-- Create enum types for better data integrity
CREATE TYPE user_type AS ENUM ('buyer', 'supplier', 'admin');
CREATE TYPE inquiry_status AS ENUM ('pending', 'responded', 'closed', 'cancelled');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'pending_approval');

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL DEFAULT 'buyer',
  company_name TEXT,
  contact_person TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  website TEXT,
  description TEXT,
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Product categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  description TEXT,
  specifications JSONB,
  price_range TEXT,
  min_order_quantity INTEGER,
  images JSONB DEFAULT '[]'::jsonb,
  status product_status DEFAULT 'pending_approval',
  tags TEXT[],
  country_of_origin TEXT DEFAULT 'China',
  certification_standards TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inquiries table
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  quantity_required INTEGER,
  target_price TEXT,
  delivery_timeline TEXT,
  status inquiry_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inquiry responses table
CREATE TABLE public.inquiry_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- RLS Policies for products
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT 
  USING (status = 'active');
CREATE POLICY "Suppliers can manage their own products" ON public.products 
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = supplier_id));

-- RLS Policies for inquiries
CREATE POLICY "Users can view their own inquiries" ON public.inquiries FOR SELECT 
  USING (auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = buyer_id OR id = supplier_id
  ));
CREATE POLICY "Buyers can create inquiries" ON public.inquiries FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = buyer_id));
CREATE POLICY "Users can update inquiries they're involved in" ON public.inquiries FOR UPDATE 
  USING (auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = buyer_id OR id = supplier_id
  ));

-- RLS Policies for inquiry responses
CREATE POLICY "Users can view responses to their inquiries" ON public.inquiry_responses FOR SELECT 
  USING (auth.uid() IN (
    SELECT p.user_id FROM public.profiles p 
    JOIN public.inquiries i ON (p.id = i.buyer_id OR p.id = i.supplier_id)
    WHERE i.id = inquiry_id
  ));
CREATE POLICY "Users can create responses to inquiries they're involved in" ON public.inquiry_responses FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = sender_id));

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, contact_person)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
('Textile Machinery', 'Equipment for textile manufacturing and processing'),
('Construction Equipment', 'Heavy machinery for construction and infrastructure'),
('Food Processing', 'Machinery for food production and packaging'),
('Packaging Machinery', 'Equipment for product packaging and labeling'),
('CNC Machines', 'Computer-controlled machining equipment'),
('Agricultural Equipment', 'Farming and agricultural machinery'),
('Printing Machinery', 'Equipment for printing and publishing'),
('Plastic Machinery', 'Equipment for plastic manufacturing and molding');