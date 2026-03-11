<script setup lang="ts">
import type { Sensor } from '~/types'

definePageMeta({
  middleware: async (_to, _from) => {
    const { checkAuth } = useAuth()
    const isAuth = await checkAuth()
    if (!isAuth) {
      return navigateTo('/auth/login')
    }
  },
})

const sensors = ref<Sensor[]>([])
const loading = ref(true)

async function loadSensors() {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean, sensors: Sensor[] }>('/api/sensors', {
      method: 'GET',
    })
    sensors.value = response.sensors
  }
  catch (error) {
    console.error('Sensörler yüklenemedi:', error)
  }
  finally {
    loading.value = false
  }
}

function getSensorIcon(sensor: Sensor) {
  return sensor.type_icon || 'sensors'
}

function getSensorLabel(sensor: Sensor) {
  return sensor.type_label || sensor.type_name || ''
}

onMounted(() => {
  loadSensors()
})
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <AppTopbar title="AgriSense - Tüm Sensörler" />

    <q-page-container>
      <q-page class="q-pa-md">
        <div class="text-h5 text-weight-bold q-mb-md">
          Tüm Sensörler
        </div>

        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner size="50px" color="green-8" />
        </div>

        <div v-else-if="sensors.length === 0" class="text-center q-pa-xl">
          <q-icon name="sensors" size="80px" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">
            Henüz sensör yok
          </div>
          <q-btn
            flat
            color="green-8"
            label="Cihaz Ekle"
            class="q-mt-md"
            to="/devices"
          />
        </div>

        <div v-else class="row q-col-gutter-md">
          <div
            v-for="sensor in sensors"
            :key="sensor.id"
            class="col-12 col-md-4"
          >
            <q-card>
              <q-card-section>
                <div class="row items-center">
                  <q-icon
                    :name="getSensorIcon(sensor)"
                    size="32px"
                    color="green-8"
                  />
                  <div class="q-ml-md">
                    <div class="text-subtitle1 text-weight-bold">
                      {{ sensor.name || getSensorLabel(sensor) }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ getSensorLabel(sensor) }}
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div v-if="sensor.device_name" class="text-caption text-grey-7">
                  Cihaz: {{ sensor.device_name }}
                </div>
                <div class="text-caption text-grey-7">
                  Birim: {{ sensor.unit_symbol || "-" }}
                </div>
                <div class="text-caption text-grey-7">
                  Min:
                  {{
                    sensor.min_value !== null && sensor.min_value !== undefined
                      ? sensor.min_value
                      : "-"
                  }}
                </div>
                <div class="text-caption text-grey-7">
                  Max:
                  {{
                    sensor.max_value !== null && sensor.max_value !== undefined
                      ? sensor.max_value
                      : "-"
                  }}
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions>
                <q-btn
                  flat
                  color="primary"
                  label="Veriler"
                  :to="`/sensors/${sensor.id}`"
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
