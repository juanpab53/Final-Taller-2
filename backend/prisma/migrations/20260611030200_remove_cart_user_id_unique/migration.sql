DROP INDEX IF EXISTS "cart_user_id_key";
CREATE INDEX IF NOT EXISTS "cart_user_id_idx" ON "cart"("user_id");
