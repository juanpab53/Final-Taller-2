-- Drop paymentMethod column and its enum
ALTER TABLE "pay" DROP COLUMN "paymentMethod";
DROP TYPE IF EXISTS "payment_method";

-- Add expired_at to cart
ALTER TABLE "cart" ADD COLUMN "expired_at" TIMESTAMP;

-- Add unit_price to cartItem
ALTER TABLE "cartItem" ADD COLUMN "unit_price" DOUBLE PRECISION NOT NULL;

-- Add lenguage to book
ALTER TABLE "book" ADD COLUMN "lenguage" VARCHAR(50) NOT NULL;

-- Add Stripe fields to pay
ALTER TABLE "pay" ADD COLUMN "stripe_checkout_session_id" VARCHAR(255);
ALTER TABLE "pay" ADD COLUMN "stripe_payment_intent_id" VARCHAR(255);
ALTER TABLE "pay" ADD COLUMN "currency" VARCHAR(3) NOT NULL DEFAULT 'usd';

-- Create stripe_event table
CREATE TABLE "stripe_event" (
    "id" UUID NOT NULL,
    "stripe_event_id" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP,
    CONSTRAINT "stripe_event_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "pay_stripe_checkout_session_id_key" ON "pay"("stripe_checkout_session_id");
CREATE UNIQUE INDEX "pay_stripe_payment_intent_id_key" ON "pay"("stripe_payment_intent_id");
CREATE UNIQUE INDEX "stripe_event_stripe_event_id_key" ON "stripe_event"("stripe_event_id");
