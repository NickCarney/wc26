import PicksForm from '@/app/components/PicksForm'
import { getTeams, getAllPlayers, getGoalkeepers, getYoungPlayers } from '@/lib/data'

export default function Page() {
  const teams = getTeams()
  const allPlayers = getAllPlayers()
  const goalkeepers = getGoalkeepers()
  const youngPlayers = getYoungPlayers()

  return (
    <PicksForm
      teams={teams}
      allPlayers={allPlayers}
      goalkeepers={goalkeepers}
      youngPlayers={youngPlayers}
    />
  )
}
