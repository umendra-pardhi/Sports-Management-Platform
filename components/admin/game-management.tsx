"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Game {
  id: string
  name: string
  description?: string
}

const DEFAULT_GAMES = [
  { name: "Carrom", description: "Carrom board game" },
  { name: "Chess", description: "Strategic chess game" },
  { name: "Cricket", description: "Cricket match" },
  { name: "Presentation", description: "Presentation competition" },
  { name: "Hide & Seek", description: "Hide and seek game" },
  { name: "Badminton", description: "Badminton tournament" },
  { name: "Table Tennis", description: "Ping pong tournament" },
]

export function GameManagement() {
  const [games, setGames] = useState<Game[]>([])
  const [gameName, setGameName] = useState("")
  const [gameDesc, setGameDesc] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchGames()
  }, [])

  async function fetchGames() {
    try {
      const { data, error } = await supabase.from("games").select("*")
      if (error) throw error
      setGames(data || [])
    } catch (error) {
      console.error("Error fetching games:", error)
    } finally {
      setLoading(false)
    }
  }

  async function addGame() {
    if (!gameName.trim()) return
    try {
      const { data, error } = await supabase
        .from("games")
        .insert([{ name: gameName, description: gameDesc }])
        .select()
      if (error) throw error
      setGames([...games, data[0]])
      setGameName("")
      setGameDesc("")
    } catch (error) {
      console.error("Error adding game:", error)
    }
  }

  async function deleteGame(id: string) {
    try {
      const { error } = await supabase.from("games").delete().eq("id", id)
      if (error) throw error
      setGames(games.filter((g) => g.id !== id))
    } catch (error) {
      console.error("Error deleting game:", error)
    }
  }

  async function seedDefaultGames() {
    try {
      const existingNames = games.map((g) => g.name)
      const toAdd = DEFAULT_GAMES.filter((g) => !existingNames.includes(g.name))
      if (toAdd.length === 0) return

      const { data, error } = await supabase.from("games").insert(toAdd).select()
      if (error) throw error
      setGames([...games, ...data])
    } catch (error) {
      console.error("Error seeding games:", error)
    }
  }

  if (loading) return <div className="text-center text-muted-foreground">Loading games...</div>

  return (
    <Card className="border-border">
      <CardHeader className="bg-primary/5 border-b border-border">
        <CardTitle className="text-foreground">Sports Games ({games.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Input
              placeholder="Game name (e.g., Carrom, Chess)"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="border-border"
            />
            <Input
              placeholder="Description (optional)"
              value={gameDesc}
              onChange={(e) => setGameDesc(e.target.value)}
              className="border-border"
            />
            <div className="flex gap-2">
              <Button onClick={addGame} className="flex-1 bg-primary hover:bg-primary/90">
                Add Game
              </Button>
              {games.length < DEFAULT_GAMES.length && (
                <Button onClick={seedDefaultGames} variant="outline" className="flex-1 border-border bg-transparent">
                  Load Defaults
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-2 max-h-96 overflow-y-auto">
            {games.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-3 hover:bg-card transition-colors"
              >
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{game.name}</div>
                  {game.description && <div className="text-sm text-muted-foreground">{game.description}</div>}
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteGame(game.id)}>
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
