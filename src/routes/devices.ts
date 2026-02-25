import type { Env } from '../env'
import { json } from '../lib/response'
import { requireAuth } from '../middleware/auth'

export async function getDevices(req: Request, env: Env) {
  const user = await requireAuth(req, env)
  if (!user)
    return json({ success: false }, 401)

  const { results } = await env.DB.prepare(`
    SELECT *
    FROM devices
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).bind(user.id).all()

  return json({ success: true, devices: results })
}
