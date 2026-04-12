import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LeaderboardStore } from '../hud/LeaderboardStore';
import {
  HUD_LEADERBOARD_MAX_ENTRIES,
  HUD_LEADERBOARD_NAME_MAX_LENGTH,
  HUD_LEADERBOARD_STORAGE_KEY,
} from '../hud/HudConfig';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:    vi.fn((key: string) => store[key] ?? null),
    setItem:    vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear:      vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('LeaderboardStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('starts with empty entries', () => {
    const store = new LeaderboardStore();
    expect(store.getEntries()).toHaveLength(0);
  });

  it('addEntry stores an entry', () => {
    const store = new LeaderboardStore();
    store.addEntry('Alice', 1000);
    expect(store.getEntries()).toHaveLength(1);
    expect(store.getEntries()[0]).toEqual({ name: 'Alice', score: 1000 });
  });

  it('entries are sorted descending by score', () => {
    const store = new LeaderboardStore();
    store.addEntry('B', 500);
    store.addEntry('A', 1000);
    store.addEntry('C', 200);
    const entries = store.getEntries();
    expect(entries[0].score).toBe(1000);
    expect(entries[1].score).toBe(500);
    expect(entries[2].score).toBe(200);
  });

  it(`caps entries at ${HUD_LEADERBOARD_MAX_ENTRIES}`, () => {
    const store = new LeaderboardStore();
    for (let i = 0; i <= HUD_LEADERBOARD_MAX_ENTRIES + 2; i++) {
      store.addEntry(`P${i}`, i * 10);
    }
    expect(store.getEntries()).toHaveLength(HUD_LEADERBOARD_MAX_ENTRIES);
  });

  it(`truncates names to ${HUD_LEADERBOARD_NAME_MAX_LENGTH} characters`, () => {
    const store = new LeaderboardStore();
    store.addEntry('A'.repeat(HUD_LEADERBOARD_NAME_MAX_LENGTH + 5), 100);
    expect(store.getEntries()[0].name).toHaveLength(HUD_LEADERBOARD_NAME_MAX_LENGTH);
  });

  it('qualifiesForTop10 returns true when list is not full', () => {
    const store = new LeaderboardStore();
    expect(store.qualifiesForTop10(1)).toBe(true);
  });

  it('qualifiesForTop10 returns false for score 0 on empty list', () => {
    const store = new LeaderboardStore();
    expect(store.qualifiesForTop10(0)).toBe(false);
  });

  it('qualifiesForTop10 returns false when score is below lowest entry on full list', () => {
    const store = new LeaderboardStore();
    for (let i = 1; i <= HUD_LEADERBOARD_MAX_ENTRIES; i++) {
      store.addEntry(`P${i}`, i * 100);
    }
    // Lowest = 100; score 50 should NOT qualify
    expect(store.qualifiesForTop10(50)).toBe(false);
  });

  it('qualifiesForTop10 returns true when score beats lowest on full list', () => {
    const store = new LeaderboardStore();
    for (let i = 1; i <= HUD_LEADERBOARD_MAX_ENTRIES; i++) {
      store.addEntry(`P${i}`, i * 100);
    }
    // Lowest = 100; score 150 should qualify
    expect(store.qualifiesForTop10(150)).toBe(true);
  });

  it('persists to localStorage on addEntry', () => {
    const store = new LeaderboardStore();
    store.addEntry('X', 999);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      HUD_LEADERBOARD_STORAGE_KEY,
      expect.any(String),
    );
  });

  it('loads existing entries from localStorage on construction', () => {
    const existing = [{ name: 'Saved', score: 5000 }];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existing));
    const store = new LeaderboardStore();
    expect(store.getEntries()[0]).toEqual({ name: 'Saved', score: 5000 });
  });

  it('handles invalid localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce('NOT_JSON');
    const store = new LeaderboardStore();
    expect(store.getEntries()).toHaveLength(0);
  });
});
