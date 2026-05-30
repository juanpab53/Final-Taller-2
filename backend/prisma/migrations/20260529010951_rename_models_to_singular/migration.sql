/*
  Warnings:

  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `authors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `books` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cartItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_details` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `password_hash` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_author_id_fkey";

-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_category_id_fkey";

-- DropForeignKey
ALTER TABLE "cartItems" DROP CONSTRAINT "cartItems_book_id_fkey";

-- DropForeignKey
ALTER TABLE "cartItems" DROP CONSTRAINT "cartItems_cart_id_fkey";

-- DropForeignKey
ALTER TABLE "order_details" DROP CONSTRAINT "order_details_book_id_fkey";

-- DropForeignKey
ALTER TABLE "order_details" DROP CONSTRAINT "order_details_order_id_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "password",
ADD COLUMN     "password_hash" VARCHAR(60) NOT NULL;

-- DropTable
DROP TABLE "authors";

-- DropTable
DROP TABLE "books";

-- DropTable
DROP TABLE "cartItems";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "order_details";

-- CreateTable
CREATE TABLE "cartItem" (
    "id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cart_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,

    CONSTRAINT "cartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_detail" (
    "id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "book_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,

    CONSTRAINT "order_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "image_url" VARCHAR(500),
    "publication_date" DATE NOT NULL,
    "description" TEXT,
    "author_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "author" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cartItem" ADD CONSTRAINT "cartItem_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartItem" ADD CONSTRAINT "cartItem_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_detail" ADD CONSTRAINT "order_detail_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_detail" ADD CONSTRAINT "order_detail_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book" ADD CONSTRAINT "book_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book" ADD CONSTRAINT "book_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
