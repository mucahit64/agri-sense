import type { DeviceCreate } from '~/types'
import db from '~/server/db/knex'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = await useSession(event, {
    password: config.sessionSecret,
  })

  const userId = session.data.userId

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Oturum bulunamadı',
    })
  }

  const body = await readBody<DeviceCreate>(event)

  if (!body.device_uid) {
    throw createError({
      statusCode: 400,
      message: 'Cihaz UID gerekli',
    })
  }

  try {
    // Cihaz zaten kayıtlı mı kontrol et
    const existing = await db('devices')
      .where({ device_uid: body.device_uid })
      .first()

    if (existing) {
      throw createError({
        statusCode: 409,
        message: 'Bu cihaz UID zaten kayıtlı',
      })
    }

    const [deviceId] = await db('devices').insert({
      user_id: userId,
      device_uid: body.device_uid,
      device_name: body.device_name || null,
      is_active: true,
    })

    const device = await db('devices').where({ id: deviceId }).first()

    return {
      success: true,
      device,
    }
  }
  catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Create device error:', error)
    throw createError({
      statusCode: 500,
      message: 'Cihaz oluşturulurken hata oluştu',
    })
  }
})
