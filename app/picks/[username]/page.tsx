import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getFlag } from '@/lib/flags'

const GRASS =
  'repeating-linear-gradient(180deg, #2a6124 0px, #2a6124 56px, #235319 56px, #235319 112px)'

const LABELS: Record<string, string> = {
  winner: 'Winner',
  biggest_surprise: 'Biggest Surprise',
  biggest_disappointment: 'Biggest Disappointment',
  golden_boot: 'Golden Boot',
  top_assister: 'Top Assister',
  golden_glove: 'Golden Glove',
  golden_ball: 'Golden Ball',
  highest_scoring_team: 'Highest Scoring Team',
  young_player: 'Young Player of the Tournament',
}

const TEAM_FIELDS = new Set([
  'winner',
  'biggest_surprise',
  'biggest_disappointment',
  'highest_scoring_team',
])

export default async function UserPicksPage({ params }: PageProps<'/picks/[username]'>) {
  const { username } = await params
  const decoded = decodeURIComponent(username)

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .eq('username', decoded)
    .single()

  if (error || !data) notFound()

  return (
    <div className="min-h-screen" style={{ background: GRASS }}>
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
            {decoded}'s Picks
          </h1>
          <Link
            href="/picks"
            className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            ← All picks
          </Link>
        </div>

        <div className="rounded-2xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          <ul className="flex flex-col divide-y divide-zinc-100">
            {Object.entries(LABELS).map(([field, label]) => {
              const value = data[field] as string
              const isTeam = TEAM_FIELDS.has(field)
              return (
                <li key={field} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {label}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-900">
                    {isTeam && <span>{getFlag(value)}</span>}
                    <span>{value}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
