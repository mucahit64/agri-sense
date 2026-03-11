<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
    backTo?: string
  }>(),
  {
    title: undefined,
    backTo: undefined,
  },
)

const { user, logout } = useAuth()
const router = useRouter()

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<template>
  <q-header elevated class="bg-green-8 text-white">
    <q-toolbar :class="$q.screen.lt.md ? 'q-py-sm' : 'q-py-md'" class="q-pl-lg">
      <!-- BACK BUTTON (optional) -->
      <q-btn
        v-if="backTo"
        flat
        round
        dense
        icon="arrow_back"
        class="q-mr-sm"
        @click="router.push(backTo)"
      />

      <!-- LOGO + TITLE -->
      <q-toolbar-title class="row items-center no-wrap">
        <div
          class="row items-center cursor-pointer"
          @click="router.push('/dashboard')"
        >
          <img
            src="/agri-sense-white.png"
            alt="AgriSense Logo"
            :height="$q.screen.lt.md ? 28 : 32"
            class="q-mr-sm"
          >
          <span class="gt-sm">{{ `AgriSense` }}</span>
        </div>
        <span v-if="title" class="gt-sm q-ml-sm">- {{ title }}</span>
      </q-toolbar-title>

      <!-- DESKTOP NAV -->
      <template v-if="$q.screen.gt.sm">
        <q-btn flat label="Dashboard" to="/dashboard" />
        <q-btn flat label="Tarlalar" to="/fields" />
        <q-btn flat label="Cihazlar" to="/devices" />

        <q-btn flat round dense icon="account_circle" class="q-ml-sm">
          <q-menu
            anchor="bottom right"
            self="top right"
            style="min-width: 260px"
          >
            <q-list>
              <q-item v-close-popup clickable to="/profile">
                <q-item-section avatar>
                  <q-icon name="person" color="green-8" />
                </q-item-section>
                <q-item-section>
                  <div class="text-weight-bold">
                    {{ user?.name }} {{ user?.surname }}
                  </div>
                  <div class="text-caption text-grey-7">
                    {{ user?.email }}
                  </div>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item v-close-popup clickable @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section class="text-negative">
                  Çıkış Yap
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </template>

      <!-- MOBILE MENU -->
      <q-btn v-else flat round dense icon="menu">
        <q-menu anchor="bottom right" self="top right">
          <q-list style="min-width: 220px">
            <q-item v-close-popup clickable to="/profile">
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

            <q-item v-close-popup clickable to="/dashboard">
              <q-item-section>Dashboard</q-item-section>
            </q-item>
            <q-item v-close-popup clickable to="/fields">
              <q-item-section>Tarlalar</q-item-section>
            </q-item>
            <q-item v-close-popup clickable to="/devices">
              <q-item-section>Cihazlar</q-item-section>
            </q-item>

            <q-separator />

            <q-item v-close-popup clickable @click="handleLogout">
              <q-item-section class="text-negative">
                Çıkış Yap
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </q-header>
</template>
