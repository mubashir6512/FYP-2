
-- Create storage bucket for room images
INSERT INTO storage.buckets (id, name, public) VALUES ('room-images', 'room-images', true);

-- Allow anyone to upload to room-images bucket
CREATE POLICY "Anyone can upload room images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'room-images');

-- Allow anyone to view room images
CREATE POLICY "Anyone can view room images"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-images');

-- Allow anyone to delete their uploads
CREATE POLICY "Anyone can delete room images"
ON storage.objects FOR DELETE
USING (bucket_id = 'room-images');
