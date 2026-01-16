import type { WeatherForecastResponse } from '~/types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const lat = query.lat || '39.9334' // Ankara default
  const lon = query.lon || '32.8597'
  const apiKey = config.openWeatherApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'OpenWeather API key not configured',
    })
  }

  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr&cnt=8`

    const response = await $fetch<WeatherForecastResponse>(weatherUrl)

    return {
      success: true,
      weather: response,
    }
  }
  catch (error: any) {
    console.error('Weather API error:', error)
    throw createError({
      statusCode: 500,
      message: 'Hava durumu bilgisi alınamadı',
    })
  }
})
