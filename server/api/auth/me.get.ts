export default defineEventHandler(async (event) => {
  const session = await useAuthSession(event)

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
