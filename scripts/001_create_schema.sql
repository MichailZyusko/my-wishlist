-- Profiles table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  referral_code TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  share_code TEXT UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishes (items in a wishlist)
CREATE TABLE IF NOT EXISTS public.wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  original_url TEXT NOT NULL,
  referral_url TEXT,
  image_url TEXT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  priority INTEGER DEFAULT 0,
  is_reserved BOOLEAN DEFAULT false,
  reserved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reserved_at TIMESTAMPTZ,
  is_purchased BOOLEAN DEFAULT false,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral settings (store-specific referral codes)
CREATE TABLE IF NOT EXISTS public.referral_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_domain TEXT NOT NULL,
  referral_param TEXT NOT NULL,
  referral_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, store_domain)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Wishlists policies
CREATE POLICY "Users can view own wishlists" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public wishlists" ON public.wishlists FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own wishlists" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wishlists" ON public.wishlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlists" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- Wishes policies
CREATE POLICY "Users can view own wishes" ON public.wishes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view wishes in public wishlists" ON public.wishes FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.wishlists WHERE id = wishlist_id AND is_public = true));
CREATE POLICY "Users can insert wishes to own wishlists" ON public.wishes FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.wishlists WHERE id = wishlist_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own wishes" ON public.wishes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishes" ON public.wishes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can reserve wishes in public wishlists" ON public.wishes FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.wishlists WHERE id = wishlist_id AND is_public = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.wishlists WHERE id = wishlist_id AND is_public = true));

-- Referral settings policies
CREATE POLICY "Users can view own referral settings" ON public.referral_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own referral settings" ON public.referral_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own referral settings" ON public.referral_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own referral settings" ON public.referral_settings FOR DELETE USING (auth.uid() = user_id);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_share_code ON public.wishlists(share_code);
CREATE INDEX IF NOT EXISTS idx_wishes_wishlist_id ON public.wishes(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishes_user_id ON public.wishes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_settings_user_domain ON public.referral_settings(user_id, store_domain);
