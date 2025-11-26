"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [teamName, setTeamName] = useState("")
  const [teamDesc, setTeamDesc] = useState("")
  const [memberName, setMemberName] = useState("")
  const [memberEmail, setMemberEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    try {
      const { data, error } = await supabase.from("teams").select("*")
      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMembers(teamId: string) {
    try {
      const { data, error } = await supabase.from("team_members").select("*").eq("team_id", teamId)
      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  async function addTeam() {
    if (!teamName.trim()) return
    try {
      const { data, error } = await supabase
        .from("teams")
        .insert([{ name: teamName, description: teamDesc }])
        .select()
      if (error) throw error
      setTeams([...teams, data[0]])
      setTeamName("")
      setTeamDesc("")
    } catch (error) {
      console.error("Error adding team:", error)
    }
  }

  async function deleteTeam(id: string) {
    try {
      const { error } = await supabase.from("teams").delete().eq("id", id)
      if (error) throw error
      setTeams(teams.filter((t) => t.id !== id))
      setSelectedTeam(null)
      setMembers([])
    } catch (error) {
      console.error("Error deleting team:", error)
    }
  }

  async function addMember() {
    if (!selectedTeam || !memberName.trim()) return
    try {
      const { data, error } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: selectedTeam.id,
            name: memberName,
            email: memberEmail || undefined,
          },
        ])
        .select()
      if (error) throw error
      setMembers([...members, data[0]])
      setMemberName("")
      setMemberEmail("")
    } catch (error) {
      console.error("Error adding member:", error)
    }
  }

  async function deleteMember(id: string) {
    try {
      const { error } = await supabase.from("team_members").delete().eq("id", id)
      if (error) throw error
      setMembers(members.filter((m) => m.id !== id))
    } catch (error) {
      console.error("Error deleting member:", error)
    }
  }

  if (loading) return <div className="text-center text-muted-foreground">Loading teams...</div>

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Teams List */}
      <Card className="border-border">
        <CardHeader className="bg-primary/5 border-b border-border">
          <CardTitle className="text-foreground">Teams ({teams.length}/3)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 p-4">
            <Input
              placeholder="Team name (e.g., Team Alpha)"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="border-border"
            />
            <Input
              placeholder="Description (optional)"
              value={teamDesc}
              onChange={(e) => setTeamDesc(e.target.value)}
              className="border-border"
            />
            <Button onClick={addTeam} className="w-full bg-primary hover:bg-primary/90">
              Add Team
            </Button>
          </div>

          <div className="border-t border-border">
            {teams.map((team) => (
              <div
                key={team.id}
                onClick={() => {
                  setSelectedTeam(team)
                  fetchMembers(team.id)
                }}
                className={`p-4 border-b border-border cursor-pointer transition-colors ${
                  selectedTeam?.id === team.id ? "bg-primary/10" : "hover:bg-muted/50"
                }`}
              >
                <div className="font-semibold text-foreground">{team.name}</div>
                {team.description && <div className="text-sm text-muted-foreground">{team.description}</div>}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteTeam(team.id)
                  }}
                  className="mt-2"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="border-border">
        <CardHeader className="bg-primary/5 border-b border-border">
          <CardTitle className="text-foreground">
            {selectedTeam ? `${selectedTeam.name} Members (${members.length}/7)` : "Select a team"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {selectedTeam && (
            <div className="space-y-2 p-4">
              <Input
                placeholder="Member name"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="border-border"
              />
              <Input
                placeholder="Email (optional)"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="border-border"
              />
              <Button onClick={addMember} className="w-full bg-secondary hover:bg-secondary/90">
                Add Member
              </Button>
            </div>
          )}

          <div className="border-t border-border">
            {members.map((member) => (
              <div key={member.id} className="p-4 border-b border-border hover:bg-muted/50">
                <div className="font-semibold text-foreground">{member.name}</div>
                {member.email && <div className="text-sm text-muted-foreground">{member.email}</div>}
                <Button variant="destructive" size="sm" onClick={() => deleteMember(member.id)} className="mt-2">
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
