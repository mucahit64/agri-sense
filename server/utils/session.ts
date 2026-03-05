import type { EventHandlerRequest, H3Event } from 'h3'

export async function useAuthSession(event: H3Event<EventHandlerRequest>) {
  const config = useRuntimeConfig()
  return useSession(event, {
    password: config.sessionSecret,
    name: 'agrisense-session',
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    },
  })
}
