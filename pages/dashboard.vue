<script setup lang="ts">
const { user, logout, checkAuth } = useAuth()
const router = useRouter()

onMounted(async () => {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    router.push('/auth/login')
  }
})

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-green-8">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="eco" size="28px" class="q-mr-sm" />
          AgriSense Dashboard
        </q-toolbar-title>

        <div class="q-mr-md">
          {{ user?.name }} {{ user?.surname }}
        </div>
        <q-btn flat round dense icon="account_circle" />
        <q-btn flat label="Çıkış" @click="handleLogout" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <div class="q-mb-md">
          <q-card>
            <q-card-section>
              <div class="text-h6">
                Hoş geldiniz, {{ user?.name }} {{ user?.surname }}!
              </div>
              <div class="text-caption text-grey-7">
                {{ user?.email }}
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-card>
              <q-card-section class="text-center">
                <q-icon name="sensors" size="48px" color="green-8" />
                <div class="text-h6 q-mt-md">
                  12
                </div>
                <div class="text-caption text-grey-7">
                  Aktif Sensör
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card>
              <q-card-section class="text-center">
                <q-icon name="landscape" size="48px" color="blue" />
                <div class="text-h6 q-mt-md">
                  45 Ha
                </div>
                <div class="text-caption text-grey-7">
                  Toplam Alan
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card>
              <q-card-section class="text-center">
                <q-icon name="opacity" size="48px" color="cyan" />
                <div class="text-h6 q-mt-md">
                  68%
                </div>
                <div class="text-caption text-grey-7">
                  Ortalama Nem
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card>
              <q-card-section class="text-center">
                <q-icon name="thermostat" size="48px" color="orange" />
                <div class="text-h6 q-mt-md">
                  24°C
                </div>
                <div class="text-caption text-grey-7">
                  Sıcaklık
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="q-mt-md">
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                Son Sensör Verileri
              </div>
              <q-markup-table>
                <thead>
                  <tr>
                    <th class="text-left">
                      Sensör
                    </th>
                    <th class="text-right">
                      Değer
                    </th>
                    <th class="text-right">
                      Zaman
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-left">
                      Toprak Nemi
                    </td>
                    <td class="text-right">
                      68%
                    </td>
                    <td class="text-right">
                      5 dakika önce
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left">
                      Sıcaklık
                    </td>
                    <td class="text-right">
                      24°C
                    </td>
                    <td class="text-right">
                      5 dakika önce
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left">
                      Hava Nemi
                    </td>
                    <td class="text-right">
                      45%
                    </td>
                    <td class="text-right">
                      10 dakika önce
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
