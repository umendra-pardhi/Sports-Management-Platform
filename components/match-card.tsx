"use client"

interface MatchCardProps {
  match: {
    id: string
    scheduled_date: string
    status: string
  }
  game: {
    id: string
    name: string
  }
  team1: {
    id: string
    name: string
  }
  team2: {
    id: string
    name: string
  }
  scores: Array<{ team_id: string; score: number }>
}

export function MatchCard({ match, game, team1, team2, scores }: MatchCardProps) {
  const score1 = scores.find((s) => s.team_id === team1?.id)?.score || 0
  const score2 = scores.find((s) => s.team_id === team2?.id)?.score || 0
  const date = new Date(match.scheduled_date)

  return (
    <div className="rounded-lg border border-border bg-card p-4 hover:bg-card/80 transition-colors">
      <div className="mb-2 text-xs font-semibold text-primary uppercase">{game?.name}</div>
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm font-medium text-foreground truncate">{team1?.name || "Team 1"}</div>
        <div className="mx-3 flex items-center gap-1">
          <span className="font-bold text-accent">{score1}</span>
          <span className="text-muted-foreground">-</span>
          <span className="font-bold text-accent">{score2}</span>
        </div>
        <div className="flex-1 text-right text-sm font-medium text-foreground truncate">{team2?.name || "Team 2"}</div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  )
}
