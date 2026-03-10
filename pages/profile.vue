<script setup lang="ts">
import { Notify } from 'quasar'

definePageMeta({
  middleware: async (_to, _from) => {
    const { checkAuth } = useAuth()
    const isAuth = await checkAuth()
    if (!isAuth) {
      return navigateTo('/auth/login')
    }
  },
})

const { user, logout } = useAuth()
const router = useRouter()

const language = ref('')
const country = ref('')
const loading = ref(true)
const saving = ref(false)

async function loadProfile() {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean, profile: { language: string | null, country: string | null } }>('/api/auth/profile')
    language.value = response.profile.language || ''
    country.value = response.profile.country || ''
  }
  catch (error: any) {
    Notify.create({
      type: 'negative',
      message: error.data?.message || 'Profil bilgileri alinamadi',
    })
  }
  finally {
    loading.value = false
  }
}

async function saveProfile() {
  try {
    saving.value = true
    await $fetch('/api/auth/profile', {
      method: 'PUT',
      body: {
        language: language.value || undefined,
        country: country.value || undefined,
      },
    })

    Notify.create({
      type: 'positive',
      message: 'Profil bilgileri guncellendi',
    })
  }
  catch (error: any) {
    Notify.create({
      type: 'negative',
      message: error.data?.message || 'Profil guncellenemedi',
    })
  }
  finally {
    saving.value = false
  }
}

async function handleLogout() {
  await logout()
  router.push('/')
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <q-header elevated class="bg-green-8 text-white">
      <q-toolbar :class="$q.screen.lt.md ? 'q-py-sm' : 'q-py-md'" class="q-pl-lg">
        <q-toolbar-title class="row items-center no-wrap">
          <img
            src="/agri-sense-white.png"
            alt="AgriSense Logo"
            :height="$q.screen.lt.md ? 28 : 32"
            class="q-mr-sm"
          >
          <span class="gt-sm"> AgriSense - Profil </span>
        </q-toolbar-title>

        <div v-if="$q.screen.gt.sm" class="row items-center q-gutter-sm">
          <q-btn flat label="Dashboard" to="/dashboard" />
          <q-btn flat label="Profil" />

          <q-space />

          <div class="q-mx-md text-weight-medium">
            {{ user?.name }} {{ user?.surname }}
          </div>

          <q-btn flat round dense icon="account_circle" />
          <q-btn flat label="Cikis" @click="handleLogout" />
        </div>

        <q-btn v-else flat round dense icon="menu">
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 220px">
              <q-item>
                <q-item-section>
                  <div class="text-weight-bold">
                    {{ user?.name }} {{ user?.surname }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ user?.email }}
                  </div>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable to="/dashboard">
                <q-item-section>Dashboard</q-item-section>
              </q-item>

              <q-item clickable>
                <q-item-section>Profil</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable @click="handleLogout">
                <q-item-section class="text-negative">
                  Cikis
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md flex flex-center">
        <q-card style="width: 500px; max-width: 95vw">
          <q-card-section class="bg-green-1">
            <div class="text-h6 text-weight-bold">
              Profil Bilgileri
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              Dil ve ulke alanlari istege baglidir.
            </div>
          </q-card-section>

          <q-card-section v-if="loading" class="text-center q-pa-xl">
            <q-spinner size="42px" color="green-8" />
          </q-card-section>

          <q-card-section v-else>
            <q-input
              v-model="language"
              outlined
              label="Dil"
              class="q-mb-md"
              hint="Orn: tr, en"
            >
              <template #prepend>
                <q-icon name="language" />
              </template>
            </q-input>

            <q-input
              v-model="country"
              outlined
              label="Ulke"
              hint="Orn: Turkiye"
            >
              <template #prepend>
                <q-icon name="public" />
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Iptal" color="grey-8" to="/dashboard" />
            <q-btn
              unelevated
              color="green-8"
              label="Kaydet"
              :loading="saving"
              @click="saveProfile"
            />
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.select-none {
  user-select: none !important;
}
</style>
