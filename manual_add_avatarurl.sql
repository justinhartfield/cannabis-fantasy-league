-- Manual migration to add avatarUrl column to users table
-- Run this directly on your database if the automatic migration doesn't work

-- Add the avatarUrl column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'avatarUrl'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "avatarUrl" varchar(500);
        RAISE NOTICE 'Column avatarUrl added successfully';
    ELSE
        RAISE NOTICE 'Column avatarUrl already exists';
    END IF;
END $$;
