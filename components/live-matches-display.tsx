"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"

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
  team_id: string
  score: number
}

export function LiveMatchesDisplay() {
  const [matches, setMatches] = useState<Match[]>([])
  const [teams, setTeams] = useState<Record<string, Team>>({})
  const [games, setGames] = useState<Record<string, Game>>({})
  const [scores, setScores] = useState<Record<string, MatchScore[]>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    Promise.all([fetchMatches(), fetchTeams(), fetchGames(), fetchScores()])
    const unsubscribe = subscribeToMatches()

    return () => {
      supabase.removeAllChannels()
      unsubscribe()
    }
  }, [])

  async function fetchMatches() {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .neq("status", "completed")
        .order("scheduled_date", { ascending: true })
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
      const { data, error } = await supabase.from("games").select("*")
      if (error) throw error
      setGames(Object.fromEntries(data?.map((g) => [g.id, g]) || []))
    } catch (error) {
      console.error("Error fetching games:", error)
    }
  }

  async function fetchScores() {
    try {
      const { data, error } = await supabase.from("match_scores").select("*")
      if (error) throw error

      if (Array.isArray(data)) {
        const scoresMap = data.reduce((acc: Record<string, any[]>, score: any) => {
          if (!acc[score.match_id]) acc[score.match_id] = []
          acc[score.match_id].push(score)
          return acc
        }, {})
        setScores(scoresMap)
      } else {
        setScores({})
      }
    } catch (error) {
      console.error("Error fetching scores:", error)
    }
  }

  function subscribeToMatches() {
    const channel = supabase
      .channel("matches_changes")
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

    // Subscribe to scores for real-time updates
    const scoresChannel = supabase
      .channel("scores_changes")
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

  if (loading) return <div className="text-center text-muted-foreground">Loading matches...</div>

  const ongoingMatches = matches.filter((m) => m.status === "ongoing")
  const upcomingMatches = matches.filter((m) => m.status === "scheduled")

  return (
    <div className="space-y-6">
      {/* Ongoing Matches */}
      {ongoingMatches.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-accent mb-3">🔴 Live Now</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {ongoingMatches.map((match) => (
              <Card
                key={match.id}
                className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/50 animate-pulse"
              >
                <CardContent className="p-4">
                  <div className="text-xs font-bold text-accent uppercase mb-2">
                    {games[match.game_id]?.name} - LIVE
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-foreground">{teams[match.team1_id]?.name}</div>
                    </div>
                    <div className="mx-2 text-center">
                      <div className="text-2xl font-bold text-accent">
                        {scores[match.id]?.find((s) => s.team_id === match.team1_id)?.score || 0}
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-muted-foreground text-xs mb-3">vs</div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-foreground">{teams[match.team2_id]?.name}</div>
                    </div>
                    <div className="mx-2 text-center">
                      <div className="text-2xl font-bold text-accent">
                        {scores[match.id]?.find((s) => s.team_id === match.team2_id)?.score || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-foreground mb-3">📅 Upcoming</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.slice(0, 3).map((match) => {
              const date = new Date(match.scheduled_date)
              return (
                <Card key={match.id} className="border-border hover:bg-card/80 transition-colors">
                  <CardContent className="p-4">
                    <div className="text-xs font-semibold text-primary uppercase mb-2">
                      {games[match.game_id]?.name}
                    </div>
                    <div className="font-semibold text-sm text-foreground mb-3">{teams[match.team1_id]?.name}</div>
                    <div className="text-center text-muted-foreground text-sm mb-3 font-medium">vs</div>
                    <div className="font-semibold text-sm text-foreground mb-3">{teams[match.team2_id]?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <Card className="border-border">
          <CardContent className="p-8 text-center text-muted-foreground">No ongoing or upcoming matches</CardContent>
        </Card>
      )}
    </div>
  )
}
