import type { Env } from '../env'
import { sign } from '../lib/jwt'
import { json } from '../lib/response'

export async function login(req: Request, env: Env) {
  const body = await req.json()

  const { mail, password } = body

  const user = await env.DB.prepare(
    `SELECT id, password FROM users WHERE mail = ?`,
  ).bind(mail).first()

  if (!user || user.password !== password)
    return json({ success: false }, 401)

  const token = await sign({ id: user.id }, env.JWT_SECRET)

  return json({ success: true, token })
}
