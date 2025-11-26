"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LeaderboardEntry {
  id: string
  name: string
  wins: number
  draws: number
  losses: number
  total_points: number
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  async function fetchLeaderboard() {
    try {
      const { data, error } = await supabase.from("leaderboard").select("*")
      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center text-muted-foreground">Loading leaderboard...</div>

  return (
    <Card className="bg-card border-border">
      <CardHeader className="bg-primary/5 border-b border-border">
        <CardTitle className="text-foreground">Rankings</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Rank</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Team</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Wins</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Draws</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Losses</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Points</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={entry.id} className="border-b border-border hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3 font-bold text-primary">#{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{entry.name}</td>
                  <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-semibold">
                    {entry.wins}
                  </td>
                  <td className="px-4 py-3 text-center text-yellow-600 dark:text-yellow-400 font-semibold">
                    {entry.draws}
                  </td>
                  <td className="px-4 py-3 text-center text-red-600 dark:text-red-400 font-semibold">{entry.losses}</td>
                  <td className="px-4 py-3 text-right font-bold text-accent">{entry.total_points || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {entries.length === 0 && <div className="px-4 py-8 text-center text-muted-foreground">No teams yet</div>}
      </CardContent>
    </Card>
  )
}
