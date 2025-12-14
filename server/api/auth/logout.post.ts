export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: process.env.SESSION_SECRET || 'REDACTED_SECRET',
  })

  await session.clear()

  return {
    success: true,
    message: 'Çıkış yapıldı',
  }
})
