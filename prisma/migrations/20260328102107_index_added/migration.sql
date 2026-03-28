-- CreateIndex
CREATE INDEX "category_name_idx" ON "categories"("name");

-- CreateIndex
CREATE INDEX "category_description_idx" ON "categories"("description");

-- CreateIndex
CREATE INDEX "comment_idea_id_idx" ON "comments"("ideaId");

-- CreateIndex
CREATE INDEX "comment_author_id_idx" ON "comments"("authorId");

-- CreateIndex
CREATE INDEX "comment_parent_id_idx" ON "comments"("parentId");

-- CreateIndex
CREATE INDEX "idea_title_idx" ON "ideas"("title");

-- CreateIndex
CREATE INDEX "idea_problem_idx" ON "ideas"("problem");

-- CreateIndex
CREATE INDEX "idea_solution_idx" ON "ideas"("solution");

-- CreateIndex
CREATE INDEX "idea_description_idx" ON "ideas"("description");

-- CreateIndex
CREATE INDEX "payment_amount_idx" ON "payments"("amount");

-- CreateIndex
CREATE INDEX "payment_status_idx" ON "payments"("status");
