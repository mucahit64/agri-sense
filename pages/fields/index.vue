<script setup lang="ts">
import type { Field } from '~/types'
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

const fields = ref<Field[]>([])
const loading = ref(true)
const showAddDialog = ref(false)
const newField = ref({
  name: '',
  lat: undefined as number | undefined,
  lon: undefined as number | undefined,
  area_m2: undefined as number | undefined,
  soil_type: '',
})

const soilTypes = [
  { value: 'killi', label: 'Killi' },
  { value: 'kumlu', label: 'Kumlu' },
  { value: 'tınlı', label: 'Tınlı' },
  { value: 'killi-tınlı', label: 'Killi Tınlı' },
  { value: 'kumlu-tınlı', label: 'Kumlu Tınlı' },
  { value: 'humuslu', label: 'Humuslu' },
  { value: 'kireçli', label: 'Kireçli' },
  { value: 'diğer', label: 'Diğer' },
]

async function loadFields() {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean, fields: Field[] }>(
      '/api/fields',
    )
    fields.value = response.fields
  }
  catch (error) {
    console.error('Tarlalar yüklenemedi:', error)
  }
  finally {
    loading.value = false
  }
}

async function addField() {
  try {
    await $fetch('/api/fields', {
      method: 'POST',
      body: newField.value,
    })
    showAddDialog.value = false
    newField.value = {
      name: '',
      lat: undefined,
      lon: undefined,
      area_m2: undefined,
      soil_type: '',
    }
    await loadFields()
    Notify.create({
      type: 'positive',
      message: 'Tarla başarıyla eklendi',
    })
  }
  catch (error: any) {
    Notify.create({
      type: 'negative',
      message: error.data?.message || 'Tarla eklenemedi',
    })
  }
}

async function deleteField(id: number) {
  Dialog.create({
    title: 'Onay',
    message: 'Bu tarlayı silmek istediğinizden emin misiniz?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await $fetch(`/api/fields/${id}`, { method: 'DELETE' })
      await loadFields()
      Notify.create({
        type: 'positive',
        message: 'Tarla başarıyla silindi',
      })
    }
    catch (error: any) {
      Notify.create({
        type: 'negative',
        message: error.data?.message || 'Tarla silinemedi',
      })
    }
  })
}

async function handleLogout() {
  await logout()
  router.push('/')
}

onMounted(() => {
  loadFields()
})
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <q-header elevated class="bg-green-8 text-white">
      <q-toolbar
        :class="$q.screen.lt.md ? 'q-py-sm' : 'q-py-md'"
        class="q-pl-lg"
      >
        <q-toolbar-title class="row items-center no-wrap">
          <img
            src="/agri-sense-white.png"
            alt="AgriSense Logo"
            :height="$q.screen.lt.md ? 28 : 32"
            class="q-mr-sm"
          >
          <span class="gt-sm"> AgriSense - Tarlalarım </span>
        </q-toolbar-title>

        <!-- DESKTOP MENU -->
        <div v-if="$q.screen.gt.sm" class="row items-center q-gutter-sm">
          <q-btn flat label="Dashboard" to="/dashboard" />
          <q-btn flat label="Tarlalar" />
          <q-btn flat label="Cihazlar" to="/devices" />
          <q-btn flat label="Sensörler" to="/sensors" />

          <q-space />

          <div class="q-mx-md text-weight-medium">
            {{ user?.name }} {{ user?.surname }}
          </div>

          <q-btn flat round dense icon="account_circle" />
          <q-btn flat label="Çıkış" @click="handleLogout" />
        </div>

        <!-- MOBILE MENU -->
        <q-btn v-else flat round dense icon="menu">
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 220px">
              <q-item>
                <q-item-section>
                  <div class="text-weight-bold">
                    {{ user?.name }} {{ user?.surname }}
                  </div>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable to="/dashboard">
                <q-item-section>Dashboard</q-item-section>
              </q-item>

              <q-item clickable>
                <q-item-section>Tarlalar</q-item-section>
              </q-item>

              <q-item clickable to="/devices">
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
            Tarlalarım
          </div>
          <q-space />
          <q-btn
            unelevated
            color="green-8"
            label="Yeni Tarla Ekle"
            icon="add"
            @click="showAddDialog = true"
          />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner size="50px" color="green-8" />
        </div>

        <!-- No Fields -->
        <div v-else-if="fields.length === 0" class="text-center q-pa-xl">
          <q-icon name="landscape" size="80px" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">
            Henüz tarla eklenmemiş
          </div>
          <q-btn
            flat
            color="green-8"
            label="İlk Tarlanızı Ekleyin"
            class="q-mt-md"
            @click="showAddDialog = true"
          />
        </div>

        <!-- Fields List -->
        <div v-else class="row q-col-gutter-md">
          <div v-for="field in fields" :key="field.id" class="col-12 col-md-4">
            <q-card>
              <q-card-section>
                <div class="row items-center">
                  <q-icon name="landscape" size="32px" color="green-8" />
                  <div class="q-ml-md">
                    <div class="text-h6">
                      {{ field.name || "İsimsiz Tarla" }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ field.soil_type || "Toprak tipi belirtilmemiş" }}
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="row items-center q-gutter-sm">
                  <q-badge :color="field.is_active === 1 ? 'positive' : 'grey'">
                    {{ field.is_active === 1 ? "Aktif" : "Pasif" }}
                  </q-badge>
                  <q-badge v-if="field.area_m2" color="blue">
                    {{ field.area_m2 }} m²
                  </q-badge>
                  <q-badge v-if="field.lat && field.lon" color="orange">
                    {{ field.lat?.toFixed(4) }}, {{ field.lon?.toFixed(4) }}
                  </q-badge>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions>
                <q-btn
                  flat
                  color="primary"
                  label="Detay"
                  :to="`/fields/${field.id}`"
                />
                <q-space />
                <q-btn
                  flat
                  color="negative"
                  icon="delete"
                  @click="deleteField(field.id)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <!-- Add Field Dialog -->
        <q-dialog v-model="showAddDialog">
          <q-card style="min-width: 400px">
            <q-card-section>
              <div class="text-h6">
                Yeni Tarla Ekle
              </div>
            </q-card-section>

            <q-card-section>
              <q-input
                v-model="newField.name"
                outlined
                label="Tarla Adı *"
                hint="Örn: Kuzey Tarla"
              />
              <q-select
                v-model="newField.soil_type"
                outlined
                :options="soilTypes"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                label="Toprak Tipi"
                class="q-mt-md"
              />
              <q-input
                v-model.number="newField.area_m2"
                outlined
                type="number"
                label="Alan (m²)"
                class="q-mt-md"
                hint="Tarlanın alanı"
              />
              <q-input
                v-model.number="newField.lat"
                outlined
                type="number"
                label="Enlem (Lat)"
                class="q-mt-md"
                hint="Örn: 39.9334"
                step="0.0001"
              />
              <q-input
                v-model.number="newField.lon"
                outlined
                type="number"
                label="Boylam (Lon)"
                class="q-mt-md"
                hint="Örn: 32.8597"
                step="0.0001"
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn v-close-popup flat label="İptal" />
              <q-btn
                unelevated
                color="green-8"
                label="Ekle"
                :disable="!newField.name"
                @click="addField"
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
