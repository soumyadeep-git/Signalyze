import aiosqlite
import json
import os
from datetime import datetime, timedelta
from typing import Optional

DB_PATH = os.getenv("SQLITE_DB_PATH", "data/cache.db")


async def _ensure_db():
    os.makedirs(os.path.dirname(DB_PATH) or ".", exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS enrichment_cache (
                company_key TEXT PRIMARY KEY,
                result_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS analysis_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                input_json TEXT NOT NULL,
                result_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        await db.commit()


async def get_cached(company_key: str, max_age_hours: int = 24) -> Optional[dict]:
    await _ensure_db()
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT result_json, created_at FROM enrichment_cache WHERE company_key = ?",
            (company_key.lower().strip(),),
        )
        row = await cursor.fetchone()
        if row:
            created = datetime.fromisoformat(row[1])
            if datetime.utcnow() - created < timedelta(hours=max_age_hours):
                return json.loads(row[0])
    return None


async def set_cached(company_key: str, result: dict):
    await _ensure_db()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT OR REPLACE INTO enrichment_cache (company_key, result_json, created_at)
               VALUES (?, ?, ?)""",
            (company_key.lower().strip(), json.dumps(result), datetime.utcnow().isoformat()),
        )
        await db.commit()


async def save_analysis(input_data: dict, result: dict):
    await _ensure_db()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO analysis_history (input_json, result_json, created_at)
               VALUES (?, ?, ?)""",
            (json.dumps(input_data), json.dumps(result), datetime.utcnow().isoformat()),
        )
        await db.commit()


async def get_history(limit: int = 50) -> list[dict]:
    await _ensure_db()
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT id, input_json, result_json, created_at FROM analysis_history ORDER BY id DESC LIMIT ?",
            (limit,),
        )
        rows = await cursor.fetchall()
        return [
            {
                "id": r[0],
                "input": json.loads(r[1]),
                "result": json.loads(r[2]),
                "created_at": r[3],
            }
            for r in rows
        ]
