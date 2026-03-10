import type { EventHandlerRequest, H3Event } from 'h3'

export async function useAuthSession(event: H3Event<EventHandlerRequest>) {
  const config = useRuntimeConfig()
  const envSecret = (globalThis as any)?.process?.env?.NUXT_SESSION_SECRET || ''
  const sessionSecret = String(config.sessionSecret || envSecret || '')

  if (!sessionSecret) {
    throw createError({
      statusCode: 500,
      message: 'Session secret ayarlanmamis (NUXT_SESSION_SECRET)',
    })
  }

  return useSession(event, {
    password: sessionSecret,
    name: 'agrisense-session',
    cookie: {
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: 'lax',
    },
  })
}
