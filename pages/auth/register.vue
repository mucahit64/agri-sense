<script setup lang="ts">
const { register } = useAuth()
const router = useRouter()

const name = ref('')
const surname = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  loading.value = true
  error.value = ''

  const result = await register(name.value, surname.value, email.value, password.value)

  loading.value = false

  if (result.success) {
    router.push('/dashboard')
  }
  else {
    error.value = result.error || 'Kayıt başarısız'
  }
}
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-1">
        <q-card style="width: 400px; max-width: 90vw">
          <q-card-section class="bg-green-8 text-white text-center">
            <div class="flex row items-center justify-center text-h5 text-weight-bold">
              <img
                src="/agri-sense-white.png"
                alt="AgriSense Logo"
                height="32px"
                class="q-mr-sm"
              >
              AgriSense
            </div>
            <div class="text-subtitle2 q-mt-sm">
              Yeni Hesap Oluşturun
            </div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleRegister">
              <q-input
                v-model="name"
                outlined
                label="Ad"
                class="q-mb-md"
                :rules="[(val: string) => !!val || 'Ad gerekli']"
              >
                <template #prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <q-input
                v-model="surname"
                outlined
                label="Soyad"
                class="q-mb-md"
                :rules="[(val: string) => !!val || 'Soyad gerekli']"
              >
                <template #prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <q-input
                v-model="email"
                outlined
                type="email"
                label="E-posta"
                class="q-mb-md"
                :rules="[(val: string) => !!val || 'E-posta gerekli']"
              >
                <template #prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <q-input
                v-model="password"
                outlined
                type="password"
                label="Şifre"
                :rules="[(val: string) => val.length >= 6 || 'Şifre en az 6 karakter olmalı']"
              >
                <template #prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>

              <q-banner v-if="error" class="bg-negative text-white q-mt-md" rounded>
                {{ error }}
              </q-banner>

              <q-btn
                type="submit"
                color="green-8"
                label="Kayıt Ol"
                class="full-width q-mt-md"
                unelevated
                :loading="loading"
              />

              <div class="text-center q-mt-md column items-center">
                <nuxt-link to="/auth/login" class="text-green-8 q-mb-sm">
                  Zaten hesabınız var mı? Giriş yapın
                </nuxt-link>

                <nuxt-link to="/" class="text-green-8">
                  Ana sayfaya dön
                </nuxt-link>
              </div>
            </q-form>
          </q-card-section>
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
