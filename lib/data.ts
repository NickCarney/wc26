import groupsData from '@/data/worldcup.groups.json'
import squadsData from '@/data/worldcup.squads.json'

export type Player = {
  name: string
  pos: string
  team: string
  dob: string
}

export function getTeams(): string[] {
  return groupsData.groups.flatMap((g) => g.teams).sort()
}

export function getAllPlayers(): Player[] {
  return squadsData.flatMap((team) =>
    team.players.map((p) => ({
      name: p.name,
      pos: p.pos,
      team: team.name,
      dob: p.date_of_birth,
    }))
  )
}

export function getGoalkeepers(): Player[] {
  return getAllPlayers().filter((p) => p.pos === 'GK')
}

export function getYoungPlayers(): Player[] {
  const cutoff = new Date('2005-06-10')
  return getAllPlayers().filter((p) => new Date(p.dob) >= cutoff)
}
