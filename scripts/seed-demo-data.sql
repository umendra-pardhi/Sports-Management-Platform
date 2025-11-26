-- Seed Games
INSERT INTO games (name, description) VALUES
('Carrom', 'Carrom board game'),
('Chess', 'Strategic chess game'),
('Cricket', 'Cricket match'),
('Presentation', 'Presentation competition'),
('Hide & Seek', 'Hide and seek game'),
('Badminton', 'Badminton tournament'),
('Table Tennis', 'Ping pong tournament')
ON CONFLICT (name) DO NOTHING;

-- Seed Teams
INSERT INTO teams (name, description) VALUES
('Team Alpha', 'The pioneering team'),
('Team Beta', 'The dynamic team'),
('Team Gamma', 'The strategic team')
ON CONFLICT (name) DO NOTHING;

-- Get team IDs (adjust these based on actual UUIDs after first run)
-- You may need to run this in parts and use actual UUIDs
