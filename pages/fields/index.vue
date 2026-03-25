<script setup lang="ts">
import type { Field, SoilType } from '~/types'
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

const fields = ref<Field[]>([])
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
  $q.dialog({
    component: AddDialog,
    componentProps: {
      type: 'field',
      item: null,
      soilTypes: soilTypes.value,
    },
  }).onOk(() => {
    loadFields()
    loadSoilTypes()
  })
}

async function deleteField(id: number) {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: 'Tarlayı Sil',
      message: 'Bu tarlayı silmek istediğinizden emin misiniz?',
    },
  }).onOk(async () => {
    try {
      await $fetch(`/api/fields/${id}`, { method: 'DELETE' })
      await loadFields()
      notifySuccess('Tarla başarıyla silindi')
    }
    catch (error: any) {
      notifyError(error.data?.message || 'Tarla silinemedi')
    }
  })
}

function openEditDialog(field: Field) {
  $q.dialog({
    component: EditDialog,
    componentProps: {
      type: 'field',
      item: field,
      soilTypes: soilTypes.value,
    },
  }).onOk(() => {
    loadFields()
    loadSoilTypes()
  })
}

onMounted(() => {
  loadFields()
  loadSoilTypes()
})
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <AppTopbar />

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
            @click="addField()"
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
            @click="addField()"
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
                  color="warning"
                  icon="edit"
                  @click="openEditDialog(field)"
                />
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
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.select-none {
  user-select: none !important;
}
</style>
