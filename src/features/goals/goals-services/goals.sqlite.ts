import * as SQLite from "expo-sqlite";

import type { GoalRecord, GoalsSnapshot } from "./goals.service";

type GoalRow = {
  id: string;
  userUid: string;
  goal: string | null;
  goalTargetCurrency: string | null;
  goalTargetAmount: number | null;
  goalTargetDate: number | null;
  currentAmount: number | null;
  membersJson: string | null;
  sharedLogsJson: string | null;
  cachedAt: number;
};

const DATABASE_NAME = "monopay.db";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let saveQueue: Promise<void> = Promise.resolve();

function getDatabase() {
  databasePromise ??= SQLite.openDatabaseAsync(DATABASE_NAME);
  return databasePromise;
}

async function initGoalsCache() {
  initPromise ??= getDatabase().then(async (database) => {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS goals_cache (
        id TEXT NOT NULL,
        userUid TEXT NOT NULL,
        goal TEXT,
        goalTargetCurrency TEXT,
        goalTargetAmount REAL,
        goalTargetDate INTEGER,
        currentAmount REAL,
        membersJson TEXT,
        sharedLogsJson TEXT,
        cachedAt INTEGER NOT NULL,
        PRIMARY KEY (id, userUid)
      );
    `);

    return database;
  });

  return initPromise;
}

function safeParseRecord(value: string | null): Record<string, any> | undefined {
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function buildSnapshot(goals: GoalRecord[]): GoalsSnapshot {
  return {
    goals,
    totalSaved: goals.reduce((sum, goal) => sum + Number(goal.currentAmount || 0), 0),
    totalTarget: goals.reduce(
      (sum, goal) => sum + Number(goal.goalTargetAmount || 0),
      0,
    ),
  };
}

export async function getCachedGoalsSnapshot(
  userUid: string,
): Promise<GoalsSnapshot | null> {
  const database = await initGoalsCache();
  const rows = await database.getAllAsync<GoalRow>(
    "SELECT * FROM goals_cache WHERE userUid = ? ORDER BY cachedAt DESC",
    userUid,
  );

  if (rows.length === 0) return null;

  const goals = rows.map((row) => ({
    id: row.id,
    goal: row.goal ?? undefined,
    goalTargetCurrency: row.goalTargetCurrency ?? undefined,
    goalTargetAmount: row.goalTargetAmount ?? undefined,
    goalTargetDate: row.goalTargetDate ?? undefined,
    currentAmount: row.currentAmount ?? undefined,
    members: safeParseRecord(row.membersJson),
    sharedLogs: safeParseRecord(row.sharedLogsJson),
  }));

  return buildSnapshot(goals);
}

export async function saveGoalsSnapshotToCache(
  userUid: string,
  snapshot: GoalsSnapshot,
): Promise<void> {
  saveQueue = saveQueue
    .catch(() => {})
    .then(() => writeGoalsSnapshotToCache(userUid, snapshot));

  return saveQueue;
}

async function writeGoalsSnapshotToCache(
  userUid: string,
  snapshot: GoalsSnapshot,
): Promise<void> {
  const database = await initGoalsCache();
  const cachedAt = Date.now();

  await database.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync("DELETE FROM goals_cache WHERE userUid = ?", userUid);

    for (const goal of snapshot.goals) {
      await txn.runAsync(
        `INSERT INTO goals_cache (
          id,
          userUid,
          goal,
          goalTargetCurrency,
          goalTargetAmount,
          goalTargetDate,
          currentAmount,
          membersJson,
          sharedLogsJson,
          cachedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        goal.id,
        userUid,
        goal.goal ?? null,
        goal.goalTargetCurrency ?? null,
        goal.goalTargetAmount ?? null,
        goal.goalTargetDate ?? null,
        goal.currentAmount ?? null,
        JSON.stringify(goal.members ?? {}),
        JSON.stringify(goal.sharedLogs ?? {}),
        cachedAt,
      );
    }
  });
}
