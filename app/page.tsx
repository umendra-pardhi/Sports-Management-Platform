"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RealTimeLeaderboard } from "@/components/real-time-leaderboard"
import { LiveMatchesDisplay } from "@/components/live-matches-display"
import { CompletedMatches } from "@/components/completed-matches"
import { TeamDetailsViewer } from "@/components/team-details-viewer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="text-2xl font-bold text-primary">

            <a href="/" aria-current="page" className="nav-logo-wp w-inline-block w--current">
            <img width="142" loading="eager" alt="" src={"./logo-AA.png"} className="nav-logo-img" />
            </a>

          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live Updates</span>
            </div>
            <Link href="/admin">
              <Button size="sm">Admin Panel</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10  bg-[url('/indore-aa-team.jpg')] bg-cover bg-center ">
      <div className="bg-black/50 w-full h-full py-38" >
        <div className="container mx-auto px-4 text-center ">
          <h1 className="text-4xl font-bold text-foreground text-white text-shadow-2xs text-shadow-amber-900  mb-2">GameoThon 1.0</h1>
          <p className=" text-lg text-white">Live scores, team management, and real-time leaderboards</p>
        </div>
        </div>
      </section>

      {/* Main Content with Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card border border-border mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="completed">Completed Matches</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Live & Upcoming Matches</h2>
                <LiveMatchesDisplay />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Quick Leaderboard</h2>
                <RealTimeLeaderboard />
              </div>
            </div>
          </TabsContent>

          {/* Completed Matches Tab with Filter */}
          <TabsContent value="completed" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Completed Matches</h2>
              <CompletedMatches />
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Team Details & Members</h2>
              <TeamDetailsViewer />
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Full Leaderboard</h2>
              <RealTimeLeaderboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>

<div className="p-3 text-center ">
<p>Developed by <a href="https://umend.in" className="text-blue-500 hover:text-blue-700" target="_blank" >Umendra Pardhi</a> | Guided by: Mahesh Bajait</p>
</div>

    </div>
  )
}
