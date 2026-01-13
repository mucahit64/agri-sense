export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = await useSession(event, {
    password: config.sessionSecret,
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
