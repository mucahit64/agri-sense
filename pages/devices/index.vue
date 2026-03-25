<script setup lang="ts">
import type { Device, Field } from '~/types'
import AddDialog from '~/components/AddDialog.vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'
import EditDialog from '~/components/EditDialog.vue'
import { useNotify } from '~/composables/useNotify'

definePageMeta({
  middleware: async (_to, _from) => {
    const { checkAuth } = useAuth()
    const isAuth = await checkAuth()
    if (!isAuth) {
      return navigateTo('/auth/login')
    }
  },
})

const $q = useQuasar()
const { notifySuccess, notifyError } = useNotify()

const devices = ref<Device[]>([])
const fields = ref<Field[]>([])
const loading = ref(true)

async function loadFields() {
  try {
    const response = await $fetch<{ success: boolean, fields: Field[] }>('/api/fields')
    fields.value = response.fields
  }
  catch (error) {
    console.error('Tarlalar yüklenemedi:', error)
  }
}

async function loadDevices() {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean, devices: Device[] }>('/api/devices')
    devices.value = response.devices
  }
  catch (error) {
    console.error('Cihazlar yüklenemedi:', error)
  }
  finally {
    loading.value = false
  }
}

async function deleteDevice(id: number) {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: 'Cihazı Sil',
      message: 'Bu cihazı silmek istediğinizden emin misiniz?',
    },
  }).onOk(async () => {
    try {
      await $fetch(`/api/devices/${id}`, { method: 'DELETE' })
      await loadDevices()
      notifySuccess('Cihaz başarıyla silindi')
    }
    catch (error: any) {
      notifyError(error.data?.message || 'Cihaz silinemedi')
    }
  })
}

function openAddDialog() {
  $q.dialog({
    component: AddDialog,
    componentProps: {
      type: 'device',
      fields: [{ label: 'Seçilmemiş', value: null }, ...fields.value.map(f => ({ label: f.name || `Tarla #${f.id}`, value: f.id }))],
    },
  }).onOk(() => {
    loadDevices()
    notifySuccess('Cihaz başarıyla eklendi')
  })
}

function openEditDialog(device: Device) {
  $q.dialog({
    component: EditDialog,
    componentProps: {
      type: 'device',
      item: device,
      fields: [{ label: 'Seçilmemiş', value: null }, ...fields.value.map(f => ({ label: f.name || `Tarla #${f.id}`, value: f.id }))],
    },
  }).onOk(() => {
    loadDevices()
  })
}

onMounted(() => {
  loadDevices()
  loadFields()
})
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <AppTopbar />

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
            @click="openAddDialog"
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
            @click="openAddDialog"
          />
        </div>

        <!-- Device List -->
        <div v-else class="row q-col-gutter-md">
          <div
            v-for="device in devices"
            :key="device.id"
            class="col-12 col-md-4"
          >
            <q-card>
              <q-card-section>
                <div class="row items-center">
                  <q-icon name="memory" size="32px" color="green-8" />
                  <div class="q-ml-md">
                    <div class="text-h6">
                      {{ device.name || "İsimsiz Cihaz" }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ device.type || "Tip belirtilmemiş" }}
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="row items-center q-gutter-sm">
                  <q-badge
                    :color="device.status === 1 ? 'positive' : 'grey'"
                  >
                    {{
                      device.status === 1
                        ? "Aktif"
                        : "Pasif"
                    }}
                  </q-badge>
                  <q-badge v-if="device.location" color="blue">
                    {{ device.location }}
                  </q-badge>
                  <q-badge v-if="device.field_name" color="green-8">
                    {{ device.field_name }}
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
                  color="warning"
                  icon="edit"
                  @click="openEditDialog(device)"
                />
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
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.select-none {
  user-select: none !important;
}
</style>
