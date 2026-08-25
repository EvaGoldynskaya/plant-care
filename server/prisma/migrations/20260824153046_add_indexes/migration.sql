-- CreateIndex
CREATE INDEX "plant_actions_plantId_idx" ON "plant_actions"("plantId");

-- CreateIndex
CREATE INDEX "plant_actions_plantId_type_idx" ON "plant_actions"("plantId", "type");

-- CreateIndex
CREATE INDEX "plants_userId_idx" ON "plants"("userId");

-- CreateIndex
CREATE INDEX "plants_userId_name_idx" ON "plants"("userId", "name");

-- CreateIndex
CREATE INDEX "rooms_userId_idx" ON "rooms"("userId");

-- CreateIndex
CREATE INDEX "rooms_userId_name_idx" ON "rooms"("userId", "name");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
