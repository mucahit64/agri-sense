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

const loading = ref(true)
const saving = ref(false)
const changingPassword = ref(false)

const form = ref({
  name: '',
  surname: '',
  username: '',
  mail: '',
  phone: '',
  language: '',
  country: '',
})

const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

async function loadProfile() {
  try {
    loading.value = true
    const response = await $fetch<{
      success: boolean
      profile: {
        name: string | null
        surname: string | null
        username: string | null
        mail: string | null
        phone: string | null
        language: string | null
        country: string | null
      }
    }>('/api/auth/profile')
    const p = response.profile
    form.value = {
      name: p.name || '',
      surname: p.surname || '',
      username: p.username || '',
      mail: p.mail || '',
      phone: p.phone || '',
      language: p.language || '',
      country: p.country || '',
    }
  }
  catch (error: any) {
    Notify.create({ type: 'negative', message: error.data?.message || 'Profil bilgileri alınamadı' })
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
        name: form.value.name || undefined,
        surname: form.value.surname || undefined,
        username: form.value.username || undefined,
        phone: form.value.phone || undefined,
        language: form.value.language || undefined,
        country: form.value.country || undefined,
      },
    })
    Notify.create({ type: 'positive', message: 'Profil güncellendi' })
  }
  catch (error: any) {
    Notify.create({ type: 'negative', message: error.data?.message || 'Profil güncellenemedi' })
  }
  finally {
    saving.value = false
  }
}

async function savePassword() {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    Notify.create({ type: 'negative', message: 'Yeni şifreler eşleşmiyor' })
    return
  }
  try {
    changingPassword.value = true
    await $fetch('/api/auth/profile', {
      method: 'PUT',
      body: {
        current_password: passwordForm.value.current_password,
        new_password: passwordForm.value.new_password,
      },
    })
    passwordForm.value = { current_password: '', new_password: '', confirm_password: '' }
    Notify.create({ type: 'positive', message: 'Şifre güncellendi' })
  }
  catch (error: any) {
    Notify.create({ type: 'negative', message: error.data?.message || 'Şifre güncellenemedi' })
  }
  finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <AppTopbar title="AgriSense - Profil" />

    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row justify-center q-col-gutter-md">
          <!-- Profil Bilgileri -->
          <div class="col-12 col-md-6">
            <q-card>
              <q-card-section class="bg-green-1">
                <div class="row items-center">
                  <q-icon name="person" size="24px" color="green-8" class="q-mr-sm" />
                  <div class="text-h6 text-weight-bold">
                    Profil Bilgileri
                  </div>
                </div>
              </q-card-section>

              <q-card-section v-if="loading" class="text-center q-pa-xl">
                <q-spinner size="42px" color="green-8" />
              </q-card-section>

              <q-card-section v-else class="q-gutter-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.name"
                      outlined
                      label="Ad"
                    >
                      <template #prepend>
                        <q-icon name="badge" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="form.surname"
                      outlined
                      label="Soyad"
                    >
                      <template #prepend>
                        <q-icon name="badge" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <q-input
                  v-model="form.username"
                  outlined
                  label="Kullanıcı Adı"
                >
                  <template #prepend>
                    <q-icon name="alternate_email" />
                  </template>
                </q-input>

                <q-input
                  v-model="form.mail"
                  outlined
                  label="E-posta Adresi"
                  readonly
                  hint="E-posta adresi değiştirilemez"
                >
                  <template #prepend>
                    <q-icon name="mail" />
                  </template>
                </q-input>

                <q-input
                  v-model="form.phone"
                  outlined
                  label="Telefon"
                  hint="Örn: +90 555 123 4567"
                >
                  <template #prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>

                <q-input
                  v-model="form.language"
                  outlined
                  label="Dil"
                  hint="Örn: tr, en"
                >
                  <template #prepend>
                    <q-icon name="language" />
                  </template>
                </q-input>

                <q-input
                  v-model="form.country"
                  outlined
                  label="Ülke"
                  hint="Örn: Türkiye"
                >
                  <template #prepend>
                    <q-icon name="public" />
                  </template>
                </q-input>
              </q-card-section>

              <q-card-actions align="right" class="q-pa-md">
                <q-btn flat label="İptal" color="grey-8" to="/dashboard" />
                <q-btn
                  unelevated
                  color="green-8"
                  label="Kaydet"
                  :loading="saving"
                  :disable="loading"
                  @click="saveProfile"
                />
              </q-card-actions>
            </q-card>
          </div>

          <!-- Şifre Değiştir -->
          <div class="col-12 col-md-6">
            <q-card>
              <q-card-section class="bg-orange-1">
                <div class="row items-center">
                  <q-icon name="lock" size="24px" color="orange-8" class="q-mr-sm" />
                  <div class="text-h6 text-weight-bold">
                    Şifre Değiştir
                  </div>
                </div>
              </q-card-section>

              <q-card-section class="q-gutter-md">
                <q-input
                  v-model="passwordForm.current_password"
                  outlined
                  label="Mevcut Şifre"
                  :type="showCurrentPassword ? 'text' : 'password'"
                >
                  <template #prepend>
                    <q-icon name="lock_open" />
                  </template>
                  <template #append>
                    <q-icon
                      :name="showCurrentPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showCurrentPassword = !showCurrentPassword"
                    />
                  </template>
                </q-input>

                <q-input
                  v-model="passwordForm.new_password"
                  outlined
                  label="Yeni Şifre"
                  :type="showNewPassword ? 'text' : 'password'"
                  hint="En az 6 karakter"
                >
                  <template #prepend>
                    <q-icon name="lock" />
                  </template>
                  <template #append>
                    <q-icon
                      :name="showNewPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showNewPassword = !showNewPassword"
                    />
                  </template>
                </q-input>

                <q-input
                  v-model="passwordForm.confirm_password"
                  outlined
                  label="Yeni Şifre (Tekrar)"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :error="passwordForm.confirm_password.length > 0 && passwordForm.new_password !== passwordForm.confirm_password"
                  error-message="Şifreler eşleşmiyor"
                >
                  <template #prepend>
                    <q-icon name="lock" />
                  </template>
                  <template #append>
                    <q-icon
                      :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showConfirmPassword = !showConfirmPassword"
                    />
                  </template>
                </q-input>
              </q-card-section>

              <q-card-actions align="right" class="q-pa-md">
                <q-btn
                  unelevated
                  color="orange-8"
                  label="Şifreyi Güncelle"
                  :loading="changingPassword"
                  :disable="!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password"
                  @click="savePassword"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.select-none {
  user-select: none !important;
}
</style>
