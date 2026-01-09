<script setup lang="ts">
const { login } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  const result = await login(email.value, password.value)

  loading.value = false

  if (result.success) {
    router.push('/dashboard')
  }
  else {
    error.value = result.error || 'Giriş başarısız'
  }
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-1">
        <q-card style="width: 400px; max-width: 90vw">
          <q-card-section class="bg-green-8 text-white text-center">
            <div class="text-h5 text-weight-bold">
              <q-icon name="eco" size="32px" class="q-mr-sm" />
              AgriSense
            </div>
            <div class="text-subtitle2 q-mt-sm">
              Hesabınıza Giriş Yapın
            </div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleLogin">
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
                :rules="[(val: string) => !!val || 'Şifre gerekli']"
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
                label="Giriş Yap"
                class="full-width q-mt-md"
                unelevated
                :loading="loading"
              />

              <div class="text-center q-mt-md column items-center">
                <nuxt-link to="/auth/register" class="text-green-8 q-mb-sm">
                  Hesabınız yok mu? Kayıt olun
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
