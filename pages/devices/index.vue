<script setup lang="ts">
import type { Device } from '~/types'
import { Dialog, Notify } from 'quasar'

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
    Notify.create({
      type: 'positive',
      message: 'Cihaz başarıyla eklendi',
    })
  }
  catch (error: any) {
    Notify.create({
      type: 'negative',
      message: error.data?.message || 'Cihaz eklenemedi',
    })
  }
}

async function deleteDevice(id: number) {
  Dialog.create({
    title: 'Onay',
    message: 'Bu cihazı silmek istediğinizden emin misiniz?',
    cancel: true,
    persistent: true,
  })
    .onOk(async () => {
      try {
        await $fetch(`/api/devices/${id}`, { method: 'DELETE' })
        await loadDevices()
        Notify.create({
          type: 'positive',
          message: 'Cihaz başarıyla silindi',
        })
      }
      catch (error: any) {
        Notify.create({
          type: 'negative',
          message: error.data?.message || 'Cihaz silinemedi',
        })
      }
    })
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
  <q-layout view="hHh lpR fFf" class="select-none">
    <q-header elevated class="bg-green-8 text-white">
      <q-toolbar :class="$q.screen.lt.md ? 'q-py-sm' : 'q-py-md'" class="q-pl-lg">
        <!-- LOGO + TITLE -->
        <q-toolbar-title class="row items-center no-wrap">
          <img
            src="/agri-sense-white.png"
            alt="AgriSense Logo"
            :height="$q.screen.lt.md ? 28 : 32"
            class="q-mr-sm"
          >

          <!-- SADECE DESKTOP -->
          <span class="gt-sm">
            AgriSense - Cihazlarım
          </span>
        </q-toolbar-title>

        <!-- DESKTOP MENU -->
        <div v-if="$q.screen.gt.sm" class="row items-center q-gutter-sm">
          <q-btn flat label="Dashboard" to="/dashboard" />
          <q-btn flat label="Cihazlar" />
          <q-btn flat label="Sensörler" to="/sensors" />

          <q-space />

          <div class="q-mx-md text-weight-medium">
            {{ user?.name }} {{ user?.surname }}
          </div>

          <q-btn flat round dense icon="account_circle" />
          <q-btn flat label="Çıkış" @click="handleLogout" />
        </div>

        <!-- MOBILE MENU -->
        <q-btn
          v-else
          flat
          round
          dense
          icon="menu"
        >
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 220px">
              <!-- USER INFO -->
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
                <q-item-section>Cihazlar</q-item-section>
              </q-item>

              <q-item clickable to="/sensors">
                <q-item-section>Sensörler</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable @click="handleLogout">
                <q-item-section class="text-negative">
                  Çıkış
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
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

        <!-- Loading State / No Devices / Device List -->
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner size="50px" color="green-8" />
        </div>

        <!-- No Devices State -->
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

        <!-- Device List -->
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

<style scoped>
  .select-none {
  user-select: none !important;
}
</style>
