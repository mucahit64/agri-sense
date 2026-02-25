import type { Env } from '../env'
import { json } from '../lib/response'

export async function insertReadings(req: Request, env: Env) {
  const data = await req.json()

  const stmt = env.DB.prepare(`
    INSERT INTO readings (sensor_id, value, recorded_at)
    VALUES (?, ?, ?)
  `)

  const batch = data.map((r: any) =>
    stmt.bind(r.sensor_id, r.value, r.recorded_at),
  )

  await env.DB.batch(batch)

  return json({ success: true })
}
