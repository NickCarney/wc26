import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getFlag } from '@/lib/flags'

const GRASS =
  'repeating-linear-gradient(180deg, #2a6124 0px, #2a6124 56px, #235319 56px, #235319 112px)'

export default async function PicksPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: picks, error } = await supabase
    .from('picks')
    .select('username, winner')
    .order('username', { ascending: true })

  return (
    <div className="min-h-screen" style={{ background: GRASS }}>
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
            Everyone's Picks
          </h1>
          <Link
            href="/"
            className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            ← Submit yours
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl bg-white/95 p-6 text-center text-red-600 shadow-2xl">
            Failed to load picks.
          </div>
        ) : !picks?.length ? (
          <div className="rounded-2xl bg-white/95 p-6 text-center text-zinc-400 shadow-2xl">
            No picks submitted yet.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {picks.map((p) => (
              <li key={p.username}>
                <Link
                  href={`/picks/${encodeURIComponent(p.username)}`}
                  className="flex items-center justify-between rounded-xl bg-white/95 px-5 py-3.5 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg"
                >
                  <span className="font-semibold text-zinc-900">{p.username}</span>
                  <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                    {getFlag(p.winner)}
                    <span>{p.winner}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1 text-zinc-300" aria-hidden="true">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
