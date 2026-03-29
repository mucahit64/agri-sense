<script setup lang="ts">
function scrollToSection(id: string) {
  const el = document.querySelector(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <!-- HEADER -->
  <q-header elevated class="bg-white text-grey-9">
    <q-toolbar :class="$q.screen.lt.md ? 'q-py-sm' : 'q-py-md'" class="q-pl-lg">
      <!-- LOGO / TITLE -->
      <q-toolbar-title
        class="row items-center text-weight-bold text-green-8 cursor-pointer no-wrap"
        @click="scrollToSection('#top')"
      >
        <img
          src="/agri-sense.png"
          alt="AgriSense Logo"
          :height="$q.screen.lt.md ? 28 : 32"
          class="q-mr-sm"
        >

        <!-- SADECE DESKTOP -->
        <span class="gt-sm">
          AgriSense
        </span>
      </q-toolbar-title>

      <!-- DESKTOP MENU -->
      <div v-if="$q.screen.gt.sm" class="row items-center q-gutter-sm">
        <q-btn flat label="Özellikler" @click="scrollToSection('#features')" />
        <q-btn flat label="Nasıl Çalışır" @click="scrollToSection('#how')" />
        <q-btn flat label="İletişim" @click="scrollToSection('#contact')" />

        <q-separator vertical inset class="q-mx-md" />

        <q-btn outline color="green-8" label="Giriş Yap" to="/auth/login" />
        <q-btn unelevated color="green-8" label="Üye Ol" to="/auth/register" />
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
          <q-list style="min-width: 200px">
            <q-item clickable @click="scrollToSection('#features')">
              <q-item-section>Özellikler</q-item-section>
            </q-item>

            <q-item clickable @click="scrollToSection('#how')">
              <q-item-section>Nasıl Çalışır</q-item-section>
            </q-item>

            <q-item clickable @click="scrollToSection('#contact')">
              <q-item-section>İletişim</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable to="/auth/login">
              <q-item-section>Giriş Yap</q-item-section>
            </q-item>

            <q-item clickable to="/auth/register">
              <q-item-section class="text-green-8 text-weight-bold">
                Üye Ol
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </q-header>
</template>
