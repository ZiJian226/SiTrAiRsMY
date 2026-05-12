INSERT INTO artist_profiles (user_id, specialty, portfolio_links, portfolio_art, social_media_links, featured, is_published)
SELECT p.user_id, '{}'::text[], '{}'::text[], '{}'::text[], '{}'::jsonb, false, true
FROM profiles p
LEFT JOIN artist_profiles ap ON ap.user_id = p.user_id
WHERE p.role = 'artist' AND ap.user_id IS NULL;
