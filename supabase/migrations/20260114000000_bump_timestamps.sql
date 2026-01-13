UPDATE public.generated_videos 
SET created_at = NOW() 
WHERE created_at < '2025-01-01';
