-- Create B-tree indexes for text search on name fields
CREATE INDEX "book_name_idx" ON "book" USING btree ("name");
CREATE INDEX "author_name_idx" ON "author" USING btree ("name");
CREATE INDEX "category_name_idx" ON "category" USING btree ("name");
