-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "units" TEXT NOT NULL DEFAULT 'mm',
    "default_currency" TEXT NOT NULL DEFAULT 'eur',
    "default_print_selection" TEXT NOT NULL DEFAULT 'latest',
    "theme" TEXT NOT NULL DEFAULT 'system',
    "collection_view_config" JSONB NOT NULL DEFAULT '{}',
    "notification_preferences" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "oracle_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mana_cost" TEXT,
    "type_line" TEXT NOT NULL,
    "oracle_text" TEXT,
    "colors" TEXT[],
    "cmc" DOUBLE PRECISION NOT NULL,
    "legalities" JSONB NOT NULL,
    "scryfall_uri" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("oracle_id")
);

-- CreateTable
CREATE TABLE "card_prints" (
    "id" TEXT NOT NULL,
    "scryfall_id" TEXT NOT NULL,
    "oracle_id" TEXT NOT NULL,
    "set_code" TEXT NOT NULL,
    "collector_number" TEXT NOT NULL,
    "illustration_id" TEXT,
    "image_uris" JSONB,
    "rarity" TEXT NOT NULL,
    "foil" BOOLEAN NOT NULL,
    "nonfoil" BOOLEAN NOT NULL,
    "prices" JSONB NOT NULL,
    "prices_updated_at" TIMESTAMP(3),
    "language" TEXT NOT NULL DEFAULT 'en',
    "localized_name" TEXT,
    "localized_type" TEXT,
    "localized_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_prints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "public_slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_sections" (
    "id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "validation_rules" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deck_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_cards" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "card_print_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deck_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_folders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "folder_id" TEXT,
    "card_print_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "condition" TEXT NOT NULL,
    "is_foil" BOOLEAN NOT NULL,
    "acquired_date" DATE,
    "notes" TEXT,
    "custom_fields" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_tags" (
    "deck_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "deck_tags_pkey" PRIMARY KEY ("deck_id","tag_id")
);

-- CreateTable
CREATE TABLE "collection_entry_tags" (
    "collection_entry_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "collection_entry_tags_pkey" PRIMARY KEY ("collection_entry_id","tag_id")
);

-- CreateTable
CREATE TABLE "card_tags" (
    "oracle_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "card_tags_pkey" PRIMARY KEY ("oracle_id","tag_id","user_id")
);

-- CreateTable
CREATE TABLE "craft_guide_articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "craft_guide_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_recommendations" (
    "id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "algorithm_version" TEXT NOT NULL,
    "identified_gaps" JSONB NOT NULL,
    "rule_suggestions" JSONB NOT NULL,
    "llm_model" TEXT,
    "llm_prompt_tokens" INTEGER,
    "llm_completion_tokens" INTEGER,
    "llm_cost_usd" DECIMAL(10,6),
    "llm_suggestions" JSONB,
    "llm_summary" TEXT,
    "user_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deck_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_feedback" (
    "id" TEXT NOT NULL,
    "recommendation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "card_prints_scryfall_id_key" ON "card_prints"("scryfall_id");

-- CreateIndex
CREATE UNIQUE INDEX "card_prints_oracle_id_set_code_collector_number_language_key" ON "card_prints"("oracle_id", "set_code", "collector_number", "language");

-- CreateIndex
CREATE UNIQUE INDEX "decks_public_slug_key" ON "decks"("public_slug");

-- CreateIndex
CREATE INDEX "decks_user_id_idx" ON "decks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "deck_sections_deck_id_position_key" ON "deck_sections"("deck_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "deck_cards_section_id_position_key" ON "deck_cards"("section_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "collection_folders_user_id_name_key" ON "collection_folders"("user_id", "name");

-- CreateIndex
CREATE INDEX "collection_entries_user_id_card_print_id_idx" ON "collection_entries"("user_id", "card_print_id");

-- CreateIndex
CREATE UNIQUE INDEX "collection_entries_user_id_card_print_id_is_foil_condition_key" ON "collection_entries"("user_id", "card_print_id", "is_foil", "condition");

-- CreateIndex
CREATE UNIQUE INDEX "tags_user_id_name_key" ON "tags"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "craft_guide_articles_slug_key" ON "craft_guide_articles"("slug");

-- CreateIndex
CREATE INDEX "deck_recommendations_deck_id_idx" ON "deck_recommendations"("deck_id");

-- CreateIndex
CREATE INDEX "deck_recommendations_expires_at_idx" ON "deck_recommendations"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "recommendation_feedback_recommendation_id_user_id_key" ON "recommendation_feedback"("recommendation_id", "user_id");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_prints" ADD CONSTRAINT "card_prints_oracle_id_fkey" FOREIGN KEY ("oracle_id") REFERENCES "cards"("oracle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_sections" ADD CONSTRAINT "deck_sections_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_cards" ADD CONSTRAINT "deck_cards_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "deck_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_cards" ADD CONSTRAINT "deck_cards_card_print_id_fkey" FOREIGN KEY ("card_print_id") REFERENCES "card_prints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_folders" ADD CONSTRAINT "collection_folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_entries" ADD CONSTRAINT "collection_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_entries" ADD CONSTRAINT "collection_entries_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "collection_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_entries" ADD CONSTRAINT "collection_entries_card_print_id_fkey" FOREIGN KEY ("card_print_id") REFERENCES "card_prints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_tags" ADD CONSTRAINT "deck_tags_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_tags" ADD CONSTRAINT "deck_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_entry_tags" ADD CONSTRAINT "collection_entry_tags_collection_entry_id_fkey" FOREIGN KEY ("collection_entry_id") REFERENCES "collection_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_entry_tags" ADD CONSTRAINT "collection_entry_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_oracle_id_fkey" FOREIGN KEY ("oracle_id") REFERENCES "cards"("oracle_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_recommendations" ADD CONSTRAINT "deck_recommendations_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_feedback" ADD CONSTRAINT "recommendation_feedback_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "deck_recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_feedback" ADD CONSTRAINT "recommendation_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
