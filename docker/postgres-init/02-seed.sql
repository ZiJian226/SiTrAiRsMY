-- Development seed data for local PostgreSQL
-- This file is executed automatically by Docker Postgres init process.

INSERT INTO users (email, password_hash, is_active)
VALUES
  ('admin@starmy.com', crypt('admin123', gen_salt('bf')), true),
  ('talent@starmy.com', crypt('talent123', gen_salt('bf')), true),
  ('artist@starmy.com', crypt('artist123', gen_salt('bf')), true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO profiles (user_id, email, full_name, role, avatar_url, bio)
VALUES
  (
    (SELECT id FROM users WHERE email = 'admin@starmy.com'),
    'admin@starmy.com',
    'Admin User',
    'admin',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    'System administrator'
  ),
  (
    (SELECT id FROM users WHERE email = 'talent@starmy.com'),
    'talent@starmy.com',
    'Sakura Hoshino',
    'talent',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=talent',
    'Virtual talent and content creator'
  ),
  (
    (SELECT id FROM users WHERE email = 'artist@starmy.com'),
    'artist@starmy.com',
    'Luna Artworks',
    'artist',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=artist',
    'Digital artist and illustrator'
  )
ON CONFLICT (email) DO NOTHING;

INSERT INTO talent_profiles (user_id, stage_name, character_description, social_links, tags, is_published)
VALUES
  (
    (SELECT id FROM users WHERE email = 'talent@starmy.com'),
    'Sakura Hoshino',
    'Gaming and singing VTuber with cozy streams.',
    '{"youtubeUrl": "https://youtube.com/@sakurahoshino", "twitchUrl": "https://twitch.tv/sakurahoshino", "tiktokUrl": "https://tiktok.com/@sakurahoshino"}'::jsonb,
    ARRAY['Gaming', 'Singing', 'Cozy'],
    true
  )
ON CONFLICT DO NOTHING;

INSERT INTO events (title, description, event_date, location, image_url, category, is_published)
VALUES
  (
    'Welcome to StarMy',
    'Platform launch announcement for StarMy community.',
    NOW() - INTERVAL '2 day',
    'Online',
    'https://placehold.co/800x400/a855f7/ffffff?text=StarMy+Launch',
    'Announcement',
    true
  ),
  (
    'Community Collab Stream',
    'Special collaboration event with community talents.',
    NOW() + INTERVAL '5 day',
    'Online',
    'https://placehold.co/800x400/8b5cf6/ffffff?text=Collab+Event',
    'Events',
    true
  )
ON CONFLICT DO NOTHING;

INSERT INTO gallery_items (title, image_url, description, category, artist_name, is_published)
VALUES
  (
    'StarMy Community Meetup 2025',
    'https://placehold.co/800x600/a855f7/ffffff?text=Community+Meetup',
    'Our first offline community gathering featuring talents and fans.',
    'Offline Event',
    'StarMy Team',
    true
  ),
  (
    'Collaboration Stream Highlights',
    'https://placehold.co/800x600/8b5cf6/ffffff?text=Collab+Highlights',
    'Memorable moments from our collaboration stream.',
    'Collab Event',
    'StarMy Team',
    true
  )
ON CONFLICT DO NOTHING;

INSERT INTO merchandise (name, description, price, image_url, category, talent_id, stock, is_published)
VALUES
  (
    'Sakura Hoshino Acrylic Stand',
    'Official acrylic stand featuring Sakura Hoshino.',
    45.00,
    'https://placehold.co/400x400/a855f7/ffffff?text=Acrylic+Stand',
    'Accessories',
    (SELECT id FROM talent_profiles WHERE stage_name = 'Sakura Hoshino' LIMIT 1),
    35,
    true
  ),
  (
    'StarMy Sticker Pack',
    'Pack of 10 waterproof vinyl stickers featuring talents.',
    20.00,
    'https://placehold.co/400x400/facc15/000000?text=Stickers',
    'Accessories',
    (SELECT id FROM talent_profiles WHERE stage_name = 'Sakura Hoshino' LIMIT 1),
    100,
    true
  )
ON CONFLICT DO NOTHING;
