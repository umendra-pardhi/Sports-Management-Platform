-- Create games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create team members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, name)
);

-- Create matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id),
  team1_id UUID NOT NULL REFERENCES teams(id),
  team2_id UUID NOT NULL REFERENCES teams(id),
  scheduled_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, ongoing, completed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (team1_id != team2_id)
);

-- Create match scores table
CREATE TABLE match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  score INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(match_id, team_id)
);

-- Create leaderboard view (computed from match results)
CREATE VIEW leaderboard AS
SELECT 
  t.id,
  t.name,
  COUNT(CASE WHEN ms1.score > COALESCE(ms2.score, 0) THEN 1 END) as wins,
  COUNT(CASE WHEN ms1.score = COALESCE(ms2.score, 0) THEN 1 END) as draws,
  COUNT(CASE WHEN ms1.score < COALESCE(ms2.score, 0) THEN 1 END) as losses,
  SUM(ms1.score) as total_points
FROM teams t
LEFT JOIN match_scores ms1 ON t.id = ms1.team_id
LEFT JOIN match_scores ms2 ON ms1.match_id = ms2.match_id AND ms1.team_id != ms2.team_id
GROUP BY t.id, t.name
ORDER BY wins DESC, total_points DESC;

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Games are readable by everyone" ON games FOR SELECT USING (true);
CREATE POLICY "Teams are readable by everyone" ON teams FOR SELECT USING (true);
CREATE POLICY "Team members are readable by everyone" ON team_members FOR SELECT USING (true);
CREATE POLICY "Matches are readable by everyone" ON matches FOR SELECT USING (true);
CREATE POLICY "Scores are readable by everyone" ON match_scores FOR SELECT USING (true);

-- Admin can insert/update/delete (in a real app, you'd check user roles)
CREATE POLICY "Admins can manage games" ON games FOR ALL USING (true);
CREATE POLICY "Admins can manage teams" ON teams FOR ALL USING (true);
CREATE POLICY "Admins can manage team members" ON team_members FOR ALL USING (true);
CREATE POLICY "Admins can manage matches" ON matches FOR ALL USING (true);
CREATE POLICY "Admins can manage scores" ON match_scores FOR ALL USING (true);
