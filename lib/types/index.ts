export interface Game {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface Team {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  name: string
  email?: string
  created_at: string
}

export interface Match {
  id: string
  game_id: string
  team1_id: string
  team2_id: string
  scheduled_date: string
  status: "scheduled" | "ongoing" | "completed"
  created_at: string
}

export interface MatchScore {
  id: string
  match_id: string
  team_id: string
  score: number
  updated_at: string
}

export interface LeaderboardEntry {
  id: string
  name: string
  wins: number
  draws: number
  losses: number
  total_points: number
}
