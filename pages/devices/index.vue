<script setup lang="ts">
import type { Device } from '~/types'

definePageMeta({
  middleware: async (to, from) => {
    const { checkAuth } = useAuth()
    const isAuth = await checkAuth()
    if (!isAuth) {
      return navigateTo('/auth/login')
    }
  },
})

const { user, logout } = useAuth()
const router = useRouter()

const devices = ref<Device[]>([])
const loading = ref(true)
const showAddDialog = ref(false)
const newDevice = ref({
  device_uid: '',
  device_name: '',
})

async function loadDevices() {
  try {
    loading.value = true
    const response = await $fetch('/api/devices')
    devices.value = response.devices
  }
  catch (error) {
    console.error('Cihazlar yüklenemedi:', error)
  }
  finally {
    loading.value = false
  }
}

async function addDevice() {
  try {
    await $fetch('/api/devices', {
      method: 'POST',
      body: newDevice.value,
    })
    showAddDialog.value = false
    newDevice.value = { device_uid: '', device_name: '' }
    await loadDevices()
  }
  catch (error: any) {
    alert(error.data?.message || 'Cihaz eklenemedi')
  }
}

async function deleteDevice(id: number) {
  if (!confirm('Bu cihazı silmek istediğinizden emin misiniz?'))
    return

  try {
    await $fetch(`/api/devices/${id}`, { method: 'DELETE' })
    await loadDevices()
  }
  catch (error: any) {
    alert(error.data?.message || 'Cihaz silinemedi')
  }
}

async function handleLogout() {
  await logout()
  router.push('/')
}

onMounted(() => {
  loadDevices()
})
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-green-8">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="eco" size="28px" class="q-mr-sm" />
          AgriSense - Cihazlarım
        </q-toolbar-title>

        <q-btn flat label="Dashboard" to="/dashboard" />
        <q-btn flat label="Cihazlar" />
        <q-btn flat label="Sensörler" to="/sensors" />

        <q-space />

        <div class="q-mr-md">
          {{ user?.name }} {{ user?.surname }}
        </div>
        <q-btn flat round dense icon="account_circle" />
        <q-btn flat label="Çıkış" @click="handleLogout" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row items-center q-mb-md">
          <div class="text-h5 text-weight-bold">
            Cihazlarım
          </div>
          <q-space />
          <q-btn
            unelevated
            color="green-8"
            label="Yeni Cihaz Ekle"
            icon="add"
            @click="showAddDialog = true"
          />
        </div>

        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner size="50px" color="green-8" />
        </div>

        <div v-else-if="devices.length === 0" class="text-center q-pa-xl">
          <q-icon name="devices" size="80px" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">
            Henüz cihaz eklenmemiş
          </div>
          <q-btn
            flat
            color="green-8"
            label="İlk Cihazınızı Ekleyin"
            class="q-mt-md"
            @click="showAddDialog = true"
          />
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="device in devices" :key="device.id" class="col-12 col-md-4">
            <q-card>
              <q-card-section>
                <div class="row items-center">
                  <q-icon name="memory" size="32px" color="green-8" />
                  <div class="q-ml-md">
                    <div class="text-h6">
                      {{ device.device_name || 'İsimsiz Cihaz' }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ device.device_uid }}
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="row items-center q-gutter-sm">
                  <q-badge :color="device.is_active ? 'positive' : 'grey'">
                    {{ device.is_active ? 'Aktif' : 'Pasif' }}
                  </q-badge>
                  <q-badge v-if="device.last_seen_at" color="blue">
                    Son: {{ new Date(device.last_seen_at).toLocaleString('tr-TR') }}
                  </q-badge>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions>
                <q-btn
                  flat
                  color="primary"
                  label="Detay"
                  :to="`/devices/${device.id}`"
                />
                <q-space />
                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  @click="deleteDevice(device.id)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <!-- Add Device Dialog -->
        <q-dialog v-model="showAddDialog">
          <q-card style="min-width: 400px">
            <q-card-section>
              <div class="text-h6">
                Yeni Cihaz Ekle
              </div>
            </q-card-section>

            <q-card-section>
              <q-input
                v-model="newDevice.device_uid"
                outlined
                label="Cihaz UID *"
                hint="Örn: ESP32_ABC123"
              />
              <q-input
                v-model="newDevice.device_name"
                outlined
                label="Cihaz Adı"
                class="q-mt-md"
                hint="Örn: Bahçe Sensörü"
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn v-close-popup flat label="İptal" />
              <q-btn
                unelevated
                color="green-8"
                label="Ekle"
                :disable="!newDevice.device_uid"
                @click="addDevice"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
