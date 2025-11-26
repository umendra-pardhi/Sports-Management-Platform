"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Team {
  id: string
  name: string
  description?: string
}

interface TeamMember {
  id: string
  team_id: string
  name: string
  email?: string
}

export function TeamDetailsViewer() {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [members, setMembers] = useState<Record<string, TeamMember[]>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTeams()
    subscribeToUpdates()

    return () => {
      supabase.removeAllChannels()
    }
  }, [])

  async function fetchTeams() {
    try {
      const { data, error } = await supabase.from("teams").select("*").order("name")
      if (error) throw error
      const teamsData = data || []
      setTeams(teamsData)
      if (teamsData.length > 0 && !selectedTeamId) {
        setSelectedTeamId(teamsData[0].id)
        fetchMembers(teamsData[0].id)
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMembers(teamId: string) {
    try {
      const { data, error } = await supabase.from("team_members").select("*").eq("team_id", teamId).order("name")
      if (error) throw error
      setMembers((prev) => ({
        ...prev,
        [teamId]: data || [],
      }))
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  function subscribeToUpdates() {
    const teamsChannel = supabase
      .channel("teams_viewer")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
        },
        async () => {
          await fetchTeams()
        },
      )
      .subscribe()

    const membersChannel = supabase
      .channel("members_viewer")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_members",
        },
        async () => {
          if (selectedTeamId) {
            await fetchMembers(selectedTeamId)
          }
        },
      )
      .subscribe()

    return () => {
      teamsChannel.unsubscribe()
      membersChannel.unsubscribe()
    }
  }

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId)
    if (!members[teamId]) {
      fetchMembers(teamId)
    }
  }

  if (loading) return <div className="text-center text-muted-foreground">Loading teams...</div>

  const selectedTeam = teams.find((t) => t.id === selectedTeamId)
  const teamMembers = selectedTeamId ? members[selectedTeamId] || [] : []

  return (
    <div className="space-y-6">
      {/* Teams Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {teams.map((team) => (
          <Card
            key={team.id}
            onClick={() => handleTeamChange(team.id)}
            className={`cursor-pointer border-2 transition-all hover:shadow-md ${
              selectedTeamId === team.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50"
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground">{team.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {team.description && <p className="text-sm text-muted-foreground">{team.description}</p>}
              <Badge variant="outline" className="w-fit">
                {teamMembers.length}/7 Members
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Team Details */}
      {selectedTeam && (
        <Card className="border-border">
          <CardHeader className="bg-primary/5 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-foreground">{selectedTeam.name} - Team Members</CardTitle>
              <Badge className="bg-primary text-primary-foreground">{teamMembers.length}/7</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {teamMembers.length > 0 ? (
              <div className="divide-y divide-border">
                {teamMembers.map((member, idx) => {
                  const initials = member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()

                  return (
                    <div key={member.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                      <Avatar className="bg-primary text-primary-foreground">
                        <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">
                          #{idx + 1} - {member.name}
                        </div>
                        {member.email && <div className="text-sm text-muted-foreground">{member.email}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">No members added yet</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
