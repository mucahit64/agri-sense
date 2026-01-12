// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-quasar-ui'],

  runtimeConfig: {
    dbHost: 'localhost',
    dbUser: 'admin',
    dbPort: 3306,
    dbPassword: 'admin123',
    dbName: 'agrisense',
  },

  quasar: {
    plugins: [
      'Dialog',
      'Notify',
    ],
  },
})
