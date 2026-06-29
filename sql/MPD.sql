-- =============================================================================
-- MERISE - Modele Physique de Donnees (MPD)
-- Projet : Parcours DevOps Guide
-- SGBD : PostgreSQL
--
-- Aligne avec docs/diagrams/mpd.puml et docs/DATA_MODEL.md
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('learner', 'admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'module_publication_status_enum') THEN
        CREATE TYPE module_publication_status_enum AS ENUM ('draft', 'published', 'hidden');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type_enum') THEN
        CREATE TYPE resource_type_enum AS ENUM ('article', 'video', 'link', 'checklist');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'progress_status_enum') THEN
        CREATE TYPE progress_status_enum AS ENUM ('todo', 'done');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'learner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    learning_objective TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    publication_status module_publication_status_enum NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT modules_display_order_unique UNIQUE (display_order)
);

CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    resource_type resource_type_enum NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    status progress_status_enum NOT NULL DEFAULT 'todo',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_resources_module_id ON resources(module_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_module_id ON progress(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_publication_status ON modules(publication_status);
