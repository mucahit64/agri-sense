<script setup lang="ts">
import type { Device, Field, SoilType } from '~/types'
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
const route = useRoute()
const router = useRouter()

const { notifySuccess, notifyError } = useNotify()

const fieldId = route.params.id as string
const field = ref<Field | null>(null)
const devices = ref<Device[]>([])
const soilTypes = ref<SoilType[]>([])
const loading = ref(true)

async function loadSoilTypes() {
  try {
    const response = await $fetch<{ success: boolean, soilTypes: SoilType[] }>('/api/soil-types')
    soilTypes.value = response.soilTypes
  }
  catch (error) {
    console.error('Toprak tipleri yüklenemedi:', error)
  }
}

async function loadField() {
  try {
    const response = await $fetch<{ success: boolean, field: Field }>(
      `/api/fields/${fieldId}`,
    )
    field.value = response.field
  }
  catch (error) {
    console.error('Tarla yüklenemedi:', error)
    router.push('/fields')
  }
}

async function loadDevices() {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean, devices: Device[] }>(
      '/api/devices',
    )
    devices.value = response.devices.filter(
      d => d.field_id === Number(fieldId),
    )
  }
  catch (error) {
    console.error('Cihazlar yüklenemedi:', error)
  }
  finally {
    loading.value = false
  }
}

async function deleteField() {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: 'Tarlayı Sil',
      message: 'Bu tarlayı silmek istediğinizden emin misiniz?',
    },
  }).onOk(async () => {
    try {
      await $fetch(`/api/fields/${fieldId}`, { method: 'DELETE' })
      router.push('/fields')
      notifySuccess('Tarla silindi')
    }
    catch (error: any) {
      notifyError(error.data?.message || 'Tarla silinemedi')
    }
  })
}

onMounted(() => {
  loadField()
  loadDevices()
  loadSoilTypes()
})

function openEditDialog() {
  $q.dialog({
    component: EditDialog,
    componentProps: {
      type: 'field',
      item: field.value,
      soilTypes: soilTypes.value,
    },
  }).onOk(() => {
    loadField()
    loadSoilTypes()
  })
}
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <AppTopbar :title="field?.name || 'Tarla Detayı'" back-to="/fields" />

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- Tarla Bilgileri -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center">
              <div class="text-h6">
                Tarla Bilgileri
              </div>
              <q-space />
              <q-btn
                flat
                color="primary"
                icon="edit"
                label="Düzenle"
                @click="openEditDialog()"
              />
              <q-btn
                flat
                color="negative"
                icon="delete"
                label="Sil"
                @click="deleteField"
              />
            </div>

            <div class="text-caption text-grey-7 q-mt-sm">
              Toprak Tipi: {{ field?.soil_type || '-' }} | Alan:
              {{ field?.area_m2 ? `${field.area_m2} m²` : '-' }}
            </div>
            <div
              v-if="field?.lat && field?.lon"
              class="text-caption text-grey-7"
            >
              Konum: {{ field.lat.toFixed(4) }}, {{ field.lon.toFixed(4) }}
            </div>
            <div class="q-mt-sm">
              <q-badge :color="field?.is_active === 1 ? 'positive' : 'grey'">
                {{ field?.is_active === 1 ? 'Aktif' : 'Pasif' }}
              </q-badge>
            </div>
          </q-card-section>
        </q-card>

        <!-- Tarlaya Bağlı Cihazlar -->
        <div class="row items-center q-mb-md">
          <div class="text-h6 text-weight-bold">
            Bağlı Cihazlar
          </div>
        </div>

        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner size="50px" color="green-8" />
        </div>

        <div v-else-if="devices.length === 0" class="text-center q-pa-xl">
          <q-icon name="memory" size="80px" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">
            Bu tarlaya bağlı cihaz yok
          </div>
          <q-btn
            flat
            color="green-8"
            label="Cihazlara Git"
            class="q-mt-md"
            to="/devices"
          />
        </div>

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
                      {{ device.name || 'İsimsiz Cihaz' }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ device.type || 'Tip belirtilmemiş' }}
                    </div>
                  </div>
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
