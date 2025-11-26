"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamManagement } from "@/components/admin/team-management"
import { GameManagement } from "@/components/admin/game-management"
import { MatchManagement } from "@/components/admin/match-management"
import { ScoreManagement } from "@/components/admin/score-management"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="text-2xl font-bold text-primary">⚙️ Admin Panel</div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">Manage teams, games, matches & scores</div>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Admin Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-4">
            <GameManagement />
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <TeamManagement />
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            <MatchManagement />
          </TabsContent>

          <TabsContent value="scores" className="space-y-4">
            <ScoreManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
