<script setup lang="ts">
import type { Device, Field } from "~/types";
import { Dialog, Notify } from "quasar";

definePageMeta({
  middleware: async (_to, _from) => {
    const { checkAuth } = useAuth();
    const isAuth = await checkAuth();
    if (!isAuth) {
      return navigateTo("/auth/login");
    }
  },
});

const route = useRoute();
const router = useRouter();
const { user, logout } = useAuth();

const fieldId = route.params.id as string;
const field = ref<Field | null>(null);
const devices = ref<Device[]>([]);
const loading = ref(true);
const editing = ref(false);

const editForm = ref({
  name: "",
  lat: undefined as number | undefined,
  lon: undefined as number | undefined,
  area_m2: undefined as number | undefined,
  soil_type: "",
  is_active: 1,
});

const soilTypes = [
  { value: "killi", label: "Killi" },
  { value: "kumlu", label: "Kumlu" },
  { value: "tınlı", label: "Tınlı" },
  { value: "killi-tınlı", label: "Killi Tınlı" },
  { value: "kumlu-tınlı", label: "Kumlu Tınlı" },
  { value: "humuslu", label: "Humuslu" },
  { value: "kireçli", label: "Kireçli" },
  { value: "diğer", label: "Diğer" },
];

async function loadField() {
  try {
    const response = await $fetch<{ success: boolean; field: Field }>(
      `/api/fields/${fieldId}`,
    );
    field.value = response.field;
    editForm.value = {
      name: response.field.name || "",
      lat: response.field.lat || undefined,
      lon: response.field.lon || undefined,
      area_m2: response.field.area_m2 || undefined,
      soil_type: response.field.soil_type || "",
      is_active: response.field.is_active,
    };
  } catch (error) {
    console.error("Tarla yüklenemedi:", error);
    router.push("/fields");
  }
}

async function loadDevices() {
  try {
    loading.value = true;
    const response = await $fetch<{ success: boolean; devices: Device[] }>(
      "/api/devices",
    );
    // Tarlaya bağlı cihazları filtrele
    devices.value = response.devices.filter(
      (d) => d.field_id === Number(fieldId),
    );
  } catch (error) {
    console.error("Cihazlar yüklenemedi:", error);
  } finally {
    loading.value = false;
  }
}

async function saveField() {
  try {
    await $fetch(`/api/fields/${fieldId}`, {
      method: "PUT",
      body: editForm.value,
    });
    editing.value = false;
    await loadField();
    Notify.create({
      type: "positive",
      message: "Tarla güncellendi",
    });
  } catch (error: any) {
    Notify.create({
      type: "negative",
      message: error.data?.message || "Tarla güncellenemedi",
    });
  }
}

async function deleteField() {
  Dialog.create({
    title: "Onay",
    message: "Bu tarlayı silmek istediğinizden emin misiniz?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await $fetch(`/api/fields/${fieldId}`, { method: "DELETE" });
      router.push("/fields");
      Notify.create({
        type: "positive",
        message: "Tarla silindi",
      });
    } catch (error: any) {
      Notify.create({
        type: "negative",
        message: error.data?.message || "Tarla silinemedi",
      });
    }
  });
}

async function handleLogout() {
  await logout();
  router.push("/");
}

onMounted(() => {
  loadField();
  loadDevices();
});
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <q-header elevated class="bg-green-8 text-white">
      <q-toolbar
        :class="$q.screen.lt.md ? 'q-py-sm' : 'q-py-md'"
        class="q-pl-lg"
      >
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          class="q-mr-sm"
          @click="router.push('/fields')"
        />

        <q-toolbar-title class="row items-center no-wrap">
          <img
            src="/agri-sense-white.png"
            alt="AgriSense Logo"
            :height="$q.screen.lt.md ? 26 : 32"
            class="q-mr-sm"
          />
          <span class="gt-sm">
            {{ field?.name || "Tarla Detayı" }}
          </span>
        </q-toolbar-title>

        <!-- DESKTOP MENU -->
        <div v-if="$q.screen.gt.sm" class="row items-center q-gutter-sm">
          <q-btn flat label="Dashboard" to="/dashboard" />
          <q-btn flat label="Tarlalar" to="/fields" />
          <q-btn flat label="Cihazlar" to="/devices" />

          <q-space />

          <div class="q-mx-md text-weight-medium">
            {{ user?.name }} {{ user?.surname }}
          </div>

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

              <q-item clickable to="/fields">
                <q-item-section>Tarlalar</q-item-section>
              </q-item>

              <q-item clickable to="/devices">
                <q-item-section>Cihazlar</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable @click="handleLogout">
                <q-item-section class="text-negative"> Çıkış </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- Tarla Bilgileri -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center">
              <div class="text-h6">Tarla Bilgileri</div>
              <q-space />
              <q-btn
                v-if="!editing"
                flat
                color="primary"
                icon="edit"
                label="Düzenle"
                @click="editing = true"
              />
              <q-btn
                flat
                color="negative"
                icon="delete"
                label="Sil"
                @click="deleteField"
              />
            </div>

            <!-- Görüntüleme Modu -->
            <div v-if="!editing">
              <div class="text-caption text-grey-7 q-mt-sm">
                Toprak Tipi: {{ field?.soil_type || "-" }} | Alan:
                {{ field?.area_m2 ? `${field.area_m2} m²` : "-" }}
              </div>
              <div
                v-if="field?.lat && field?.lon"
                class="text-caption text-grey-7"
              >
                Konum: {{ field.lat.toFixed(4) }}, {{ field.lon.toFixed(4) }}
              </div>
              <div class="q-mt-sm">
                <q-badge :color="field?.is_active === 1 ? 'positive' : 'grey'">
                  {{ field?.is_active === 1 ? "Aktif" : "Pasif" }}
                </q-badge>
              </div>
            </div>

            <!-- Düzenleme Modu -->
            <div v-else class="q-mt-md">
              <q-input
                v-model="editForm.name"
                outlined
                label="Tarla Adı"
                class="q-mb-md"
              />
              <q-select
                v-model="editForm.soil_type"
                outlined
                :options="soilTypes"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                label="Toprak Tipi"
                class="q-mb-md"
              />
              <q-input
                v-model.number="editForm.area_m2"
                outlined
                type="number"
                label="Alan (m²)"
                class="q-mb-md"
              />
              <q-input
                v-model.number="editForm.lat"
                outlined
                type="number"
                label="Enlem (Lat)"
                class="q-mb-md"
                step="0.0001"
              />
              <q-input
                v-model.number="editForm.lon"
                outlined
                type="number"
                label="Boylam (Lon)"
                class="q-mb-md"
                step="0.0001"
              />
              <q-toggle
                v-model="editForm.is_active"
                :true-value="1"
                :false-value="0"
                label="Aktif"
                class="q-mb-md"
              />
              <div class="row q-gutter-sm">
                <q-btn
                  unelevated
                  color="green-8"
                  label="Kaydet"
                  @click="saveField"
                />
                <q-btn flat label="İptal" @click="editing = false" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Tarlaya Bağlı Cihazlar -->
        <div class="row items-center q-mb-md">
          <div class="text-h6 text-weight-bold">Bağlı Cihazlar</div>
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
                      {{ device.name || "İsimsiz Cihaz" }}
                    </div>
                    <div class="text-caption text-grey-7">
                      {{ device.type || "Tip belirtilmemiş" }}
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
