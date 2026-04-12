/**
 * Persists a top-10 leaderboard to localStorage with an in-memory fallback.
 *
 * @spec hud – Requirement: LeaderboardStore persistence
 */
import {
  HUD_LEADERBOARD_MAX_ENTRIES,
  HUD_LEADERBOARD_NAME_MAX_LENGTH,
  HUD_LEADERBOARD_STORAGE_KEY,
} from './HudConfig';

export interface LeaderboardEntry {
  name:  string;
  score: number;
}

export class LeaderboardStore {
  private _entries: LeaderboardEntry[] = [];

  constructor() {
    this._load();
  }

  private _load(): void {
    try {
      const raw = localStorage.getItem(HUD_LEADERBOARD_STORAGE_KEY);
      if (raw) this._entries = JSON.parse(raw) as LeaderboardEntry[];
    } catch {
      this._entries = [];
    }
    this._sort();
  }

  private _save(): void {
    try {
      localStorage.setItem(HUD_LEADERBOARD_STORAGE_KEY, JSON.stringify(this._entries));
    } catch { /* ignore storage errors */ }
  }

  private _sort(): void {
    this._entries.sort((a, b) => b.score - a.score);
    this._entries = this._entries.slice(0, HUD_LEADERBOARD_MAX_ENTRIES);
  }

  /** @spec hud True when score would make the top-10 list. */
  qualifiesForTop10(score: number): boolean {
    if (this._entries.length < HUD_LEADERBOARD_MAX_ENTRIES) return score > 0;
    return score > (this._entries[this._entries.length - 1]?.score ?? 0);
  }

  /** @spec hud Add a new entry; name is capped at HUD_LEADERBOARD_NAME_MAX_LENGTH. */
  addEntry(name: string, score: number): void {
    this._entries.push({ name: name.slice(0, HUD_LEADERBOARD_NAME_MAX_LENGTH), score });
    this._sort();
    this._save();
  }

  /** @spec hud Read-only snapshot of current leaderboard. */
  getEntries(): ReadonlyArray<LeaderboardEntry> {
    return this._entries;
  }
}
