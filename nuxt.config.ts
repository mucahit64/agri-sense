import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-quasar-ui'],

  app: {
    head: {
      title: 'AgriSense',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
        { name: 'description', content: 'Akıllı Tarım ve Sulama Yönetim Sistemi' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/agri-sense.png' },
      ],
    },
  },

  runtimeConfig: {
    sessionSecret: '',
    openWeatherApiKey: '',
    openaiApiKey: '',
  },

  quasar: {
    plugins: [
      'Dialog',
      'Notify',
    ],
  },

  nitro: {
    preset: 'cloudflare-pages',
  },
})
