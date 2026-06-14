"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { savePicks, type FormState } from "@/app/actions";
import type { Player } from "@/lib/data";
import { getFlag } from "@/lib/flags";

type Props = {
  teams: string[];
  allPlayers: Player[];
  goalkeepers: Player[];
  youngPlayers: Player[];
};

const GRASS =
  "repeating-linear-gradient(180deg, #2a6124 0px, #2a6124 56px, #235319 56px, #235319 112px)";

const inputCls =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 hover:border-zinc-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/15";

const triggerCls =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm shadow-sm transition-colors cursor-pointer text-left hover:border-zinc-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/15";

const dropdownCls =
  "absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg";

const searchInputCls =
  "w-full border-0 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none";

// ── Shared helpers ────────────────────────────────────────────────────────────

function useClickOutside(
  ref: React.RefObject<HTMLDivElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

function ChevronIcon() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-zinc-400" aria-hidden="true">
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return <li className="px-4 py-3 text-sm text-zinc-400">{text}</li>;
}

// ── Team combobox (controlled) ────────────────────────────────────────────────

function TeamCombobox({
  name,
  teams,
  value,
  onChange,
}: {
  name: string;
  teams: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const close = () => { setOpen(false); setQuery(""); };
  useClickOutside(ref, close);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const filtered = teams.filter((t) => t.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setQuery(""); }}
        className={`${triggerCls} ${value ? "text-zinc-900" : "text-zinc-400"}`}
      >
        {value ? (
          <span className="flex items-center gap-2">
            <span>{getFlag(value)}</span>
            <span>{value}</span>
          </span>
        ) : (
          "Select a team…"
        )}
      </button>
      <ChevronIcon />

      {open && (
        <div className={dropdownCls}>
          <div className="border-b border-zinc-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams…"
              className={searchInputCls}
            />
          </div>
          <ul className="max-h-60 overflow-auto py-1">
            {filtered.length === 0 ? (
              <EmptyMessage text="No teams found" />
            ) : (
              filtered.map((t) => (
                <li
                  key={t}
                  onMouseDown={() => { onChange(t); setOpen(false); setQuery(""); }}
                  className={`flex cursor-pointer items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 ${value === t ? "font-medium text-green-700" : "text-zinc-900"}`}
                >
                  <span className="text-base leading-none">{getFlag(t)}</span>
                  <span>{t}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Player combobox (controlled) ──────────────────────────────────────────────

function PlayerCombobox({
  name,
  players,
  value,
  onChange,
}: {
  name: string;
  players: Player[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const close = () => { setOpen(false); setQuery(""); setActiveTeam(null); };
  useClickOutside(ref, close);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeTeam) { setActiveTeam(null); setQuery(""); }
        else close();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, activeTeam]);

  const byTeam = players.reduce<Record<string, Player[]>>((acc, p) => {
    (acc[p.team] ??= []).push(p);
    return acc;
  }, {});

  const teams = Object.keys(byTeam).sort();
  const q = query.toLowerCase();
  const mode = activeTeam ? "drill" : query ? "search" : "teams";

  const filteredTeams = teams.filter((t) => t.toLowerCase().includes(q));
  const searchResults = mode === "search"
    ? players.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 50)
    : [];
  const drillPlayers = mode === "drill"
    ? (byTeam[activeTeam!] ?? []).filter((p) => p.name.toLowerCase().includes(q))
    : [];

  const selectedPlayer = value ? players.find((p) => p.name === value) : null;

  const pick = (p: Player) => { onChange(p.name); setOpen(false); setQuery(""); setActiveTeam(null); };
  const drill = (team: string) => { setActiveTeam(team); setQuery(""); };

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => { setOpen(true); setQuery(""); setActiveTeam(null); }}
        className={`${triggerCls} ${selectedPlayer ? "text-zinc-900" : "text-zinc-400"}`}
      >
        {selectedPlayer ? (
          <span className="flex items-center gap-2">
            <span>{getFlag(selectedPlayer.team)}</span>
            <span className="text-zinc-400">{selectedPlayer.team} ·</span>
            <span>{selectedPlayer.name}</span>
          </span>
        ) : (
          "Select a player…"
        )}
      </button>
      <ChevronIcon />

      {open && (
        <div className={dropdownCls}>
          <div className="border-b border-zinc-100">
            {mode === "drill" && (
              <button
                type="button"
                onMouseDown={() => { setActiveTeam(null); setQuery(""); }}
                className="flex w-full items-center gap-1.5 px-4 pt-2.5 pb-1 text-xs font-medium text-green-700 hover:text-green-600"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{getFlag(activeTeam!)}</span>
                <span>{activeTeam}</span>
              </button>
            )}
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === "drill" ? "Search players…" : "Search players or browse by team…"}
              className={searchInputCls}
            />
          </div>

          <ul className="max-h-64 overflow-auto py-1">
            {mode === "teams" && filteredTeams.map((team) => (
              <li
                key={team}
                onMouseDown={() => drill(team)}
                className="flex cursor-pointer items-center justify-between px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{getFlag(team)}</span>
                  <span>{team}</span>
                </span>
                <ChevronRight />
              </li>
            ))}

            {mode === "search" && searchResults.length === 0 && <EmptyMessage text="No players found" />}
            {mode === "search" && searchResults.map((p) => (
              <li
                key={`${p.team}-${p.name}`}
                onMouseDown={() => pick(p)}
                className={`flex cursor-pointer items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 ${value === p.name ? "font-medium text-green-700" : "text-zinc-900"}`}
              >
                <span className="text-base leading-none">{getFlag(p.team)}</span>
                <span>{p.name}</span>
                <span className="ml-auto text-xs text-zinc-400">{p.team}</span>
              </li>
            ))}

            {mode === "drill" && drillPlayers.length === 0 && <EmptyMessage text="No players found" />}
            {mode === "drill" && drillPlayers.map((p) => (
              <li
                key={p.name}
                onMouseDown={() => pick(p)}
                className={`cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-zinc-50 ${value === p.name ? "font-medium text-green-700" : "text-zinc-900"}`}
              >
                {p.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Goal SVG ──────────────────────────────────────────────────────────────────

function GoalSvg({ flip = false }: { flip?: boolean }) {
  const id = flip ? "net-b" : "net-t";
  return (
    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" width="100%" height="100" className="block" aria-hidden="true" style={flip ? { transform: "scaleY(-1)" } : undefined}>
      <defs>
        <pattern id={id} x="0" y="0" width="22" height="16" patternUnits="userSpaceOnUse">
          <line x1="0"  y1="0"  x2="11" y2="8"  stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
          <line x1="11" y1="8"  x2="22" y2="0"  stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
          <line x1="0"  y1="16" x2="11" y2="8"  stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
          <line x1="11" y1="8"  x2="22" y2="16" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect x="9" y="9" width="982" height="91" fill={`url(#${id})`} />
      <rect x="0" y="0" width="1000" height="10" fill="white" />
      <rect x="0" y="0" width="10" height="100" fill="white" />
      <rect x="990" y="0" width="10" height="100" fill="white" />
    </svg>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({ label, name, children }: { label: string; name: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

const EMPTY = {
  username: "",
  winner: "",
  biggest_surprise: "",
  biggest_disappointment: "",
  golden_boot: "",
  top_assister: "",
  golden_glove: "",
  golden_ball: "",
  highest_scoring_team: "",
  young_player: "",
};

export default function PicksForm({ teams, allPlayers, goalkeepers, youngPlayers }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePicks, {});
  const [picks, setPicks] = useState(EMPTY);

  const set = (key: keyof typeof EMPTY) => (v: string) =>
    setPicks((prev) => ({ ...prev, [key]: v }));

  if (state.success) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: GRASS }}>
        <div className="rounded-2xl bg-white px-12 py-10 text-center shadow-xl">
          <div className="mb-3 text-5xl">⚽</div>
          <p className="text-2xl font-bold text-zinc-900">Picks submitted!</p>
          <p className="mt-2 text-zinc-500">Your WC26 picks have been saved.</p>
          <Link
            href={`/picks/${encodeURIComponent(picks.username)}`}
            className="mt-5 inline-block rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
          >
            View your picks →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col" style={{ background: GRASS }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[100px] left-1/2 h-28 w-80 -translate-x-1/2 rounded-b border-b border-l border-r border-white/15" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/15" />
        <div className="absolute top-1/2 left-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
        <div className="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25" />
        <div className="absolute bottom-[100px] left-1/2 h-28 w-80 -translate-x-1/2 rounded-t border-l border-r border-t border-white/15" />
      </div>

      <GoalSvg />

      <div className="relative z-10 flex-1 px-4 py-10">
        <div className="mx-auto max-w-xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black tracking-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
              WC26 Picks
            </h1>
            <p className="mt-1 text-sm text-white/60">
              One entry per person — picks are final on submit
            </p>
            <Link
              href="/picks"
              className="mt-3 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              View everyone's picks →
            </Link>
          </div>

          <div className="rounded-2xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
            <form action={action} className="flex flex-col gap-5">

              <Field label="Username" name="username">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="Choose a unique username"
                  value={picks.username}
                  onChange={(e) => set("username")(e.target.value)}
                  className={inputCls}
                />
              </Field>

              <div className="border-t border-zinc-100" />

              <Field label="Winner" name="winner">
                <TeamCombobox name="winner" teams={teams} value={picks.winner} onChange={set("winner")} />
              </Field>

              <Field label="Biggest surprise" name="biggest_surprise">
                <TeamCombobox name="biggest_surprise" teams={teams} value={picks.biggest_surprise} onChange={set("biggest_surprise")} />
              </Field>

              <Field label="Biggest disappointment" name="biggest_disappointment">
                <TeamCombobox name="biggest_disappointment" teams={teams} value={picks.biggest_disappointment} onChange={set("biggest_disappointment")} />
              </Field>

              <Field label="Golden Boot — top goalscorer" name="golden_boot">
                <PlayerCombobox name="golden_boot" players={allPlayers} value={picks.golden_boot} onChange={set("golden_boot")} />
              </Field>

              <Field label="Top assister" name="top_assister">
                <PlayerCombobox name="top_assister" players={allPlayers} value={picks.top_assister} onChange={set("top_assister")} />
              </Field>

              <Field label="Golden Glove — best goalkeeper" name="golden_glove">
                <PlayerCombobox name="golden_glove" players={goalkeepers} value={picks.golden_glove} onChange={set("golden_glove")} />
              </Field>

              <Field label="Golden Ball — best player" name="golden_ball">
                <PlayerCombobox name="golden_ball" players={allPlayers} value={picks.golden_ball} onChange={set("golden_ball")} />
              </Field>

              <Field label="Highest scoring team" name="highest_scoring_team">
                <TeamCombobox name="highest_scoring_team" teams={teams} value={picks.highest_scoring_team} onChange={set("highest_scoring_team")} />
              </Field>

              <Field label="Young player of the tournament (21 or under)" name="young_player">
                <PlayerCombobox name="young_player" players={youngPlayers} value={picks.young_player} onChange={set("young_player")} />
              </Field>

              {state.error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="mt-1 rounded-full bg-green-700 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              >
                {pending ? "Submitting…" : "Submit picks"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <GoalSvg flip />
    </div>
  );
}
