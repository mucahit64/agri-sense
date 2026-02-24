import type { EventHandlerRequest, H3Event } from 'h3'

export function useDB(event: H3Event<EventHandlerRequest>) {
  return event.context.cloudflare.env.DB
}
