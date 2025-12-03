-- RLS policies to unblock saving admin/merchant settings
-- Idempotent using DO blocks checking pg_policies

-- Admins: allow owner SELECT/UPDATE; allow INSERT by owner
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admins' AND policyname = 'Admins can view own data'
  ) THEN
    CREATE POLICY "Admins can view own data" ON public.admins FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admins' AND policyname = 'Admins can update own data'
  ) THEN
    CREATE POLICY "Admins can update own data" ON public.admins FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admins' AND policyname = 'Admins can create own record'
  ) THEN
    CREATE POLICY "Admins can create own record" ON public.admins FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Merchants: allow INSERT by owner (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'merchants' AND policyname = 'Users can create own merchant record'
  ) THEN
    CREATE POLICY "Users can create own merchant record" ON public.merchants FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Optionally allow admins (identified by presence in admins table) to manage merchants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'merchants' AND policyname = 'Admins can create merchants'
  ) THEN
    CREATE POLICY "Admins can create merchants" ON public.merchants FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));
  END IF;
END $$;

