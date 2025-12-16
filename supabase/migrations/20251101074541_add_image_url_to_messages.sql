/*
  # Add image_url column to messages table
  
  1. Changes
    - Add `image_url` column to store base64 images or external image URLs
    - This allows storing both uploaded images and AI-generated images
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE messages ADD COLUMN image_url text;
  END IF;
END $$;
