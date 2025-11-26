"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Match {
  id: string
  game_id: string
  team1_id: string
  team2_id: string
  scheduled_date: string
  status: string
}

interface Team {
  id: string
  name: string
}

interface Game {
  id: string
  name: string
}

interface MatchScore {
  id: string
  match_id: string
  team_id: string
  score: number
}

export function ScoreManagement() {
  const [matches, setMatches] = useState<Match[]>([])
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [games, setGames] = useState<Record<string, Game>>({})
  const [scores, setScores] = useState<Record<string, MatchScore[]>>({})
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [team1Score, setTeam1Score] = useState("0")
  const [team2Score, setTeam2Score] = useState("0")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    Promise.all([fetchMatches(), fetchTeams(), fetchGames(), fetchScores()])
  }, [])

  async function fetchMatches() {
    try {
      const { data, error } = await supabase.from("matches").select("*")
      if (error) throw error
      setMatches(data || [])
    } catch (error) {
      console.error("Error fetching matches:", error)
    }
  }

  async function fetchTeams() {
    try {
      const { data, error } = await supabase.from("teams").select("*")
      if (error) throw error
      setTeams(Object.fromEntries(data?.map((t) => [t.id, t]) || []))
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }

  async function fetchGames() {
    try {
      const { data, error } = await supabase.from("games").select("*")
      if (error) throw error
      setGames(Object.fromEntries(data?.map((g) => [g.id, g]) || []))
    } catch (error) {
      console.error("Error fetching games:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchScores() {
    try {
      const { data, error } = await supabase.from("match_scores").select("*")
      if (error) throw error

      if (Array.isArray(data)) {
        const scoresMap = (data || []).reduce((acc: Record<string, any[]>, score: any) => {
          if (!acc[score.match_id]) acc[score.match_id] = []
          acc[score.match_id].push(score)
          return acc
        }, {})
        setScores(scoresMap)
      }
    } catch (error) {
      console.error("Error fetching scores:", error)
    }
  }

  async function updateScore() {
    if (!selectedMatch) return

    try {
      const team1ScoreNum = Number.parseInt(team1Score)
      const team2ScoreNum = Number.parseInt(team2Score)

      const team1Scores = scores[selectedMatch.id] || []
      const team1Score1 = team1Scores.find((s) => s.team_id === selectedMatch.team1_id)
      const team2Score1 = team1Scores.find((s) => s.team_id === selectedMatch.team2_id)

      if (team1Score1) {
        await supabase.from("match_scores").update({ score: team1ScoreNum }).eq("id", team1Score1.id)
      } else {
        await supabase
          .from("match_scores")
          .insert([{ match_id: selectedMatch.id, team_id: selectedMatch.team1_id, score: team1ScoreNum }])
      }

      if (team2Score1) {
        await supabase.from("match_scores").update({ score: team2ScoreNum }).eq("id", team2Score1.id)
      } else {
        await supabase
          .from("match_scores")
          .insert([{ match_id: selectedMatch.id, team_id: selectedMatch.team2_id, score: team2ScoreNum }])
      }

      await fetchScores()
    } catch (error) {
      console.error("Error updating scores:", error)
    }
  }

  const upcomingMatches = matches
    .filter((m) => m.status !== "completed")
    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())

  if (loading) return <div className="text-center text-muted-foreground">Loading...</div>

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Matches List */}
      <Card className="border-border">
        <CardHeader className="bg-primary/5 border-b border-border">
          <CardTitle className="text-foreground">Active Matches</CardTitle>
        </CardHeader>
        <CardContent className="p-0 max-h-96 overflow-y-auto">
          {upcomingMatches.map((match) => (
            <div
              key={match.id}
              onClick={() => {
                setSelectedMatch(match)
                const matchScores = scores[match.id] || []
                const t1Score = matchScores.find((s) => s.team_id === match.team1_id)?.score || 0
                const t2Score = matchScores.find((s) => s.team_id === match.team2_id)?.score || 0
                setTeam1Score(t1Score.toString())
                setTeam2Score(t2Score.toString())
              }}
              className={`p-3 border-b border-border cursor-pointer transition-colors ${
                selectedMatch?.id === match.id ? "bg-primary/10" : "hover:bg-muted/50"
              }`}
            >
              <div className="text-sm font-semibold text-primary mb-1">{games[match.game_id]?.name}</div>
              <div className="text-sm text-foreground">
                {teams[match.team1_id]?.name} vs {teams[match.team2_id]?.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(match.scheduled_date).toLocaleString()}
              </div>
              <div className="text-xs font-semibold text-accent mt-1 capitalize">{match.status}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Score Update */}
      <Card className="border-border">
        <CardHeader className="bg-primary/5 border-b border-border">
          <CardTitle className="text-foreground">{selectedMatch ? "Update Scores" : "Select a match"}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {selectedMatch && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {teams[selectedMatch.team1_id]?.name} Score
                </label>
                <Input
                  type="number"
                  min="0"
                  value={team1Score}
                  onChange={(e) => setTeam1Score(e.target.value)}
                  className="border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {teams[selectedMatch.team2_id]?.name} Score
                </label>
                <Input
                  type="number"
                  min="0"
                  value={team2Score}
                  onChange={(e) => setTeam2Score(e.target.value)}
                  className="border-border"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={updateScore} className="flex-1 bg-primary hover:bg-primary/90">
                  Update Score
                </Button>
                <Button onClick={() => setSelectedMatch(null)} variant="outline" className="flex-1 border-border">
                  Clear
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
