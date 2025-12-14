export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: process.env.SESSION_SECRET || 'REDACTED_SECRET',
  })

  const userData = session.data

  if (!userData || !userData.userId) {
    throw createError({
      statusCode: 401,
      message: 'Oturum bulunamadı',
    })
  }

  return {
    user: {
      id: userData.userId,
      email: userData.email,
      name: userData.name,
      surname: userData.surname,
    },
  }
})
