"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Game {
  id: string
  name: string
}

interface Team {
  id: string
  name: string
}

interface Match {
  id: string
  game_id: string
  team1_id: string
  team2_id: string
  scheduled_date: string
  status: string
}

export function MatchManagement() {
  const [games, setGames] = useState<Game[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [gameId, setGameId] = useState("")
  const [team1Id, setTeam1Id] = useState("")
  const [team2Id, setTeam2Id] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    Promise.all([fetchGames(), fetchTeams(), fetchMatches()])
  }, [])

  async function fetchGames() {
    try {
      const { data, error } = await supabase.from("games").select("*")
      if (error) throw error
      setGames(data || [])
    } catch (error) {
      console.error("Error fetching games:", error)
    }
  }

  async function fetchTeams() {
    try {
      const { data, error } = await supabase.from("teams").select("*")
      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }

  async function fetchMatches() {
    try {
      const { data, error } = await supabase.from("matches").select("*")
      if (error) throw error
      setMatches(data || [])
    } catch (error) {
      console.error("Error fetching matches:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addMatch() {
    if (!gameId || !team1Id || !team2Id || !scheduledDate) return
    if (team1Id === team2Id) {
      alert("Teams must be different")
      return
    }

    try {
      const { data, error } = await supabase
        .from("matches")
        .insert([
          {
            game_id: gameId,
            team1_id: team1Id,
            team2_id: team2Id,
            scheduled_date: scheduledDate,
          },
        ])
        .select()
      if (error) throw error

      setMatches([...matches, data[0]])
      setGameId("")
      setTeam1Id("")
      setTeam2Id("")
      setScheduledDate("")
    } catch (error) {
      console.error("Error adding match:", error)
    }
  }

  async function deleteMatch(id: string) {
    try {
      const { error } = await supabase.from("matches").delete().eq("id", id)
      if (error) throw error
      setMatches(matches.filter((m) => m.id !== id))
    } catch (error) {
      console.error("Error deleting match:", error)
    }
  }

  async function updateMatchStatus(id: string, status: string) {
    try {
      const { error } = await supabase.from("matches").update({ status }).eq("id", id)
      if (error) throw error
      setMatches(matches.map((m) => (m.id === id ? { ...m, status } : m)))
    } catch (error) {
      console.error("Error updating match:", error)
    }
  }

  const gameMap = Object.fromEntries(games.map((g) => [g.id, g]))
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]))

  if (loading) return <div className="text-center text-muted-foreground">Loading...</div>

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Create Match */}
      <Card className="border-border">
        <CardHeader className="bg-primary/5 border-b border-border">
          <CardTitle className="text-foreground">Schedule Match</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Game</label>
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            >
              <option value="">Select a game</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Team 1</label>
            <select
              value={team1Id}
              onChange={(e) => setTeam1Id(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            >
              <option value="">Select team 1</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Team 2</label>
            <select
              value={team2Id}
              onChange={(e) => setTeam2Id(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            >
              <option value="">Select team 2</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Scheduled Date & Time</label>
            <Input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="border-border"
            />
          </div>

          <Button onClick={addMatch} className="w-full bg-primary hover:bg-primary/90">
            Schedule Match
          </Button>
        </CardContent>
      </Card>

      {/* Matches List */}
      <Card className="border-border">
        <CardHeader className="bg-primary/5 border-b border-border">
          <CardTitle className="text-foreground">Scheduled Matches ({matches.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 max-h-96 overflow-y-auto">
          {matches.map((match) => (
            <div key={match.id} className="border-b border-border p-3 hover:bg-muted/50">
              <div className="text-sm font-semibold text-primary mb-1">{gameMap[match.game_id]?.name}</div>
              <div className="text-sm text-foreground mb-2">
                {teamMap[match.team1_id]?.name} vs {teamMap[match.team2_id]?.name}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {new Date(match.scheduled_date).toLocaleString()}
              </div>
              <div className="flex gap-2 flex-wrap mb-2">
                {["scheduled", "ongoing", "completed"].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={match.status === status ? "default" : "outline"}
                    onClick={() => updateMatchStatus(match.id, status)}
                    className="text-xs capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
              <Button variant="destructive" size="sm" onClick={() => deleteMatch(match.id)}>
                Delete
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
