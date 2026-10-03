-- Additive catalog classification. Existing rows and permissions are preserved.
-- This does not create Stripe products, prices, charges or subscription entitlements.
BEGIN;
ALTER TABLE public.market_listings ADD COLUMN product_type text NOT NULL DEFAULT 'other'
  CHECK (product_type IN ('physical','digital','service','subscription','donation','ticket','other'));
GRANT SELECT(product_type) ON public.market_listings TO anonymous;
GRANT INSERT(product_type), UPDATE(product_type) ON public.market_listings TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
