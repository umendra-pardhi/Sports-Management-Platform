"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

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
  match_id: string
  team_id: string
  score: number
}

export function CompletedMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [games, setGames] = useState<Record<string, Game>>({})
  const [scores, setScores] = useState<Record<string, MatchScore[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<string>("all")
  const [gamesList, setGamesList] = useState<Game[]>([])
  const supabase = createClient()

  useEffect(() => {
    Promise.all([fetchMatches(), fetchTeams(), fetchGames(), fetchScores()])
    subscribeToUpdates()

    return () => {
      supabase.removeAllChannels()
    }
  }, [])

  async function fetchMatches() {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "completed")
        .order("scheduled_date", { ascending: false })
      if (error) throw error
      setMatches(data || [])
    } catch (error) {
      console.error("Error fetching matches:", error)
    } finally {
      setLoading(false)
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
      const { data, error } = await supabase.from("games").select("*").order("name")
      if (error) throw error
      setGames(Object.fromEntries(data?.map((g) => [g.id, g]) || []))
      setGamesList(data || [])
    } catch (error) {
      console.error("Error fetching games:", error)
    }
  }

  async function fetchScores() {
    try {
      const { data, error } = await supabase.from("match_scores").select("*")
      if (error) throw error

      const scoresByMatch: Record<string, MatchScore[]> = {}
      if (Array.isArray(data)) {
        data.forEach((score: MatchScore) => {
          if (!scoresByMatch[score.match_id]) {
            scoresByMatch[score.match_id] = []
          }
          scoresByMatch[score.match_id].push(score)
        })
      }
      setScores(scoresByMatch)
    } catch (error) {
      console.error("Error fetching scores:", error)
    }
  }

  function subscribeToUpdates() {
    const channel = supabase
      .channel("completed_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        async () => {
          await fetchMatches()
        },
      )
      .subscribe()

    const scoresChannel = supabase
      .channel("completed_scores")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_scores",
        },
        async () => {
          await fetchScores()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
      scoresChannel.unsubscribe()
    }
  }

  const filteredMatches = selectedGame === "all" ? matches : matches.filter((m) => m.game_id === selectedGame)

  // Determine winner
  const getWinner = (match: Match) => {
    const matchScores = scores[match.id]
    if (!matchScores || matchScores.length < 2) return null

    const team1Score = matchScores.find((s) => s.team_id === match.team1_id)?.score || 0
    const team2Score = matchScores.find((s) => s.team_id === match.team2_id)?.score || 0

    if (team1Score > team2Score) return match.team1_id
    if (team2Score > team1Score) return match.team2_id
    return "draw"
  }

  if (loading) return <div className="text-center text-muted-foreground">Loading completed matches...</div>

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="flex gap-4 items-center">
        <span className="text-sm font-semibold text-foreground">Filter by Game:</span>
        <Select value={selectedGame} onValueChange={setSelectedGame}>
          <SelectTrigger className="w-64 border-border">
            <SelectValue placeholder="All Games" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            {gamesList.map((game) => (
              <SelectItem key={game.id} value={game.id}>
                {game.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Completed Matches Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMatches.map((match) => {
          const team1 = teams[match.team1_id]
          const team2 = teams[match.team2_id]
          const game = games[match.game_id]
          const matchScores = scores[match.id] || []
          const team1Score = matchScores.find((s) => s.team_id === match.team1_id)?.score || 0
          const team2Score = matchScores.find((s) => s.team_id === match.team2_id)?.score || 0
          const winner = getWinner(match)
          const date = new Date(match.scheduled_date)

          return (
            <Card key={match.id} className="border-border hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 bg-primary/5 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-primary">{game?.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
                  >
                    Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Team 1 */}
                <div
                  className={`p-3 rounded-lg border ${
                    winner === match.team1_id ? "bg-yellow-500/10 border-yellow-500/30" : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="font-semibold text-foreground flex items-center justify-between">
                    <span>{team1?.name}</span>
                    {winner === match.team1_id && (
                      <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">Winner</span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-accent mt-2">{team1Score}</div>
                </div>

                {/* VS */}
                <div className="text-center text-muted-foreground font-semibold">vs</div>

                {/* Team 2 */}
                <div
                  className={`p-3 rounded-lg border ${
                    winner === match.team2_id ? "bg-yellow-500/10 border-yellow-500/30" : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="font-semibold text-foreground flex items-center justify-between">
                    <span>{team2?.name}</span>
                    {winner === match.team2_id && (
                      <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">Winner</span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-accent mt-2">{team2Score}</div>
                </div>

                {/* Draw or Result */}
                {winner === "draw" && (
                  <div className="text-center text-sm font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 py-2 rounded">
                    Draw Match
                  </div>
                )}

                {/* Date */}
                <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                  {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredMatches.length === 0 && (
        <Card className="border-border">
          <CardContent className="p-8 text-center text-muted-foreground">
            {selectedGame !== "all" ? "No completed matches for this game yet" : "No completed matches yet"}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
