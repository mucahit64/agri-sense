// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-quasar-ui'],

  quasar: {
    plugins: [
      'Dialog',
      'Notify',
    ],
  },

  // API base URL (frontend → railway backend)
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '',
    },
  },

  // Ortama göre build çıktısı
  nitro: {
    preset: process.env.NITRO_PRESET || 'static',
  },
})
