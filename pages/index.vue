<script setup lang="ts">
const features = [
  {
    icon: 'sensors',
    title: 'Gerçek Zamanlı İzleme',
    description: 'IoT sensörlerinizden gelen verileri anlık olarak izleyin ve analiz edin.',
  },
  {
    icon: 'cloud_done',
    title: 'Bulut Tabanlı Sistem',
    description: 'Verileriniz güvenli bulut altyapısında saklanır, her yerden erişim sağlayın.',
  },
  {
    icon: 'analytics',
    title: 'Gelişmiş Analitik',
    description: 'Makine öğrenimi destekli analizler ile geleceği tahmin edin.',
  },
  {
    icon: 'notifications_active',
    title: 'Akıllı Bildirimler',
    description: 'Kritik değerler için anında uyarı alın, zamanında müdahale edin.',
  },
  {
    icon: 'dashboard_customize',
    title: 'Özelleştirilebilir Dashboard',
    description: 'İhtiyacınıza göre panellerinizi düzenleyin, raporlar oluşturun.',
  },
  {
    icon: 'integration_instructions',
    title: 'Kolay Entegrasyon',
    description: 'Mevcut sistemlerinizle kolayca entegre edin, API desteği.',
  },
]

const stats = [
  { icon: 'group', value: '10K+', label: 'Aktif Kullanıcı' },
  { icon: 'sensors', value: '50K+', label: 'Bağlı Sensör' },
  { icon: 'landscape', value: '25K+', label: 'Hektar Arazi' },
  { icon: 'trending_up', value: '%40', label: 'Verimlilik Artışı' },
]

const steps = [
  { icon: 'app_registration', title: 'Hesap Oluşturun', description: 'Hızlı ve kolay kayıt ile hemen başlayın.' },
  { icon: 'settings_input_antenna', title: 'Sensörleri Bağlayın', description: 'IoT sensörlerinizi sisteme entegre edin.' },
  { icon: 'insights', title: 'İzleyin ve Optimize Edin', description: 'Verilerinizi analiz edin, kararlar alın.' },
]

const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  message: '',
})

function submitContact() {
  // TODO: Implement contact form submission
  // eslint-disable-next-line no-console
  console.log('Contact form submitted:', contactForm.value)
}

function scrollToSection(id: string) {
  const el = document.querySelector(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <q-layout view="hHh lpR fFf" class="select-none">
    <!-- HEADER -->
    <q-header
      elevated
      class="bg-white text-grey-9"
    >
      <q-toolbar class="q-px-xl q-py-sm">
        <q-toolbar-title
          class="row items-center text-weight-bold text-green-8"
          @click="() => scrollToSection('#top')"
        >
          <img
            src="/agri-sense.png"
            alt="AgriSense Logo"
            height="32px"
            class="q-mr-sm"
          >
          AgriSense
        </q-toolbar-title>

        <q-space />

        <q-btn
          flat
          label="Özellikler"
          @click="() => scrollToSection('#features')"
        />
        <q-btn
          flat
          label="Nasıl Çalışır"
          @click="() => scrollToSection('#how')"
        />
        <q-btn
          flat
          label="İletişim"
          @click="() => scrollToSection('#contact')"
        />

        <q-separator
          vertical
          inset
          class="q-mx-md"
        />

        <q-btn
          outline
          color="green-8"
          label="Giriş Yap"
          to="/auth/login"
        />
        <q-btn
          unelevated
          color="green-8"
          label="Üye Ol"
          to="/auth/register"
          class="q-ml-sm"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page>
        <!-- HERO -->
        <section
          id="top"
          class="hero"
        >
          <div class="content row items-center">
            <div class="col-12 col-md-6 q-pr-xl">
              <div class="text-overline text-green-7">
                AKILLI TARIM PLATFORMU
              </div>
              <h1 class="text-h3 text-weight-bold q-mt-sm">
                Tarımınızı <span class="text-green-8">Veriyle</span> Yönetin
              </h1>
              <p class="text-body1 text-grey-7 q-mt-md">
                IoT sensörleriyle toprak, hava ve çevresel verileri
                gerçek zamanlı takip edin. Daha az su, daha fazla verim.
              </p>

              <div class="q-gutter-md q-mt-lg">
                <q-btn
                  unelevated
                  color="green-8"
                  label="Ücretsiz Dene"
                  size="lg"
                  @click="() => $router.push('/auth/register')"
                />
                <q-btn
                  outline
                  color="green-8"
                  label="Demo İzle"
                  size="lg"
                />
              </div>
            </div>

            <div class="col-12 col-md-6 q-mt-xl q-mt-md-none">
              <q-card class="hero-card">
                <q-card-section class="bg-green-8 text-white">
                  <div class="text-subtitle1">
                    Canlı Sensör Verileri
                  </div>
                </q-card-section>
                <q-card-section class="row q-col-gutter-md">
                  <Stat
                    icon="opacity"
                    label="Toprak Nemi"
                    value="68%"
                  />
                  <Stat
                    icon="thermostat"
                    label="Sıcaklık"
                    value="24°C"
                  />
                  <Stat
                    icon="water_drop"
                    label="Nem"
                    value="89%"
                  />
                  <Stat
                    icon="wb_sunny"
                    label="Işık"
                    value="850 lx"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </section>

        <!-- FEATURES -->
        <section
          id="features"
          class="section"
        >
          <h2 class="section-title">
            Neden AgriSense?
          </h2>
          <div class="row q-col-gutter-lg">
            <div
              v-for="f in features"
              :key="f.title"
              class="col-12 col-md-4"
            >
              <q-card
                flat
                bordered
                class="feature"
              >
                <q-icon
                  :name="f.icon"
                  size="40px"
                  color="green-8"
                />
                <div class="text-subtitle1 text-weight-bold q-mt-md">
                  {{ f.title }}
                </div>
                <p class="text-body2 text-grey-7">
                  {{ f.description }}
                </p>
              </q-card>
            </div>
          </div>
        </section>

        <!-- STATS SECTION -->
        <section class="stats-section">
          <div class="row text-center">
            <div
              v-for="(stat, index) in stats"
              :key="index"
              class="col-12 col-md-3"
            >
              <div class="stat-item">
                <q-icon
                  :name="stat.icon"
                  size="56px"
                  class="q-mb-md"
                />
                <div class="text-h3 text-weight-bold">
                  {{ stat.value }}
                </div>
                <div class="text-h6 text-green-2 q-mt-sm">
                  {{ stat.label }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- HOW IT WORKS -->
        <section
          id="how"
          class="section bg-grey-1"
        >
          <h2 class="section-title">
            Nasıl Çalışır?
          </h2>
          <div class="row q-col-gutter-xl text-center">
            <div
              v-for="(step, i) in steps"
              :key="step.title"
              class="col-12 col-md-4"
            >
              <q-card
                flat
                class="how-card"
              >
                <div class="q-mb-md">
                  <span class="step-circle">{{ i + 1 }}</span>
                </div>
                <q-icon
                  :name="step.icon"
                  size="48px"
                  color="green-8"
                  class="q-mb-md"
                />
                <div class="text-subtitle1 text-weight-bold">
                  {{ step.title }}
                </div>
                <p class="text-body2 text-grey-7 q-mt-sm">
                  {{ step.description }}
                </p>
              </q-card>
            </div>
          </div>
        </section>

        <!-- CTA -->
        <section class="cta">
          <h2 class="text-h4 text-weight-bold">
            Tarımı Dijitalleştirmenin Tam Zamanı
          </h2>
          <p class="text-body1 q-mt-sm">
            14 gün ücretsiz dene, kredi kartı gerekmez.
          </p>
          <q-btn
            unelevated
            color="white"
            text-color="green-8"
            size="lg"
            label="Hemen Başla"
            class="q-mt-lg"
            @click="() => $router.push('/auth/register')"
          />
        </section>

        <!-- CONTACT -->
        <section
          id="contact"
          class="section"
        >
          <h2 class="section-title">
            Bizimle İletişime Geçin
          </h2>
          <div class="row q-col-gutter-xl">
            <!-- Contact Info -->
            <div class="col-12 col-md-5">
              <div class="text-h5 text-weight-bold q-mb-lg">
                İletişim Bilgileri
              </div>

              <div class="contact-info-item">
                <q-icon
                  name="email"
                  size="24px"
                  color="green-8"
                />
                <div>
                  <div class="text-subtitle2 text-weight-bold">
                    E-posta
                  </div>
                  <div class="text-body2 text-grey-7">
                    info@agrisense.com
                  </div>
                </div>
              </div>

              <div class="contact-info-item">
                <q-icon
                  name="phone"
                  size="24px"
                  color="green-8"
                />
                <div>
                  <div class="text-subtitle2 text-weight-bold">
                    Telefon
                  </div>
                  <div class="text-body2 text-grey-7">
                    +90 (212) 123 45 67
                  </div>
                </div>
              </div>

              <div class="contact-info-item">
                <q-icon
                  name="location_on"
                  size="24px"
                  color="green-8"
                />
                <div>
                  <div class="text-subtitle2 text-weight-bold">
                    Adres
                  </div>
                  <div class="text-body2 text-grey-7">
                    Teknoloji Merkezi, İstanbul, Türkiye
                  </div>
                </div>
              </div>

              <div class="contact-info-item">
                <q-icon
                  name="schedule"
                  size="24px"
                  color="green-8"
                />
                <div>
                  <div class="text-subtitle2 text-weight-bold">
                    Çalışma Saatleri
                  </div>
                  <div class="text-body2 text-grey-7">
                    Pazartesi - Cuma: 09:00 - 18:00
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Form -->
            <div class="col-12 col-md-7">
              <q-card
                flat
                bordered
                class="contact-form"
              >
                <q-card-section>
                  <div class="text-h6 text-weight-bold q-mb-md">
                    Mesaj Gönderin
                  </div>

                  <q-form @submit="submitContact">
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-sm-6">
                        <q-input
                          v-model="contactForm.name"
                          label="Adınız Soyadınız *"
                          outlined
                          :rules="[val => !!val || 'Bu alan zorunludur']"
                        >
                          <template #prepend>
                            <q-icon name="person" />
                          </template>
                        </q-input>
                      </div>

                      <div class="col-12 col-sm-6">
                        <q-input
                          v-model="contactForm.email"
                          label="E-posta Adresiniz *"
                          type="email"
                          outlined
                          :rules="[
                            val => !!val || 'Bu alan zorunludur',
                            val => /.+@.+\..+/.test(val) || 'Geçerli bir e-posta adresi giriniz',
                          ]"
                        >
                          <template #prepend>
                            <q-icon name="email" />
                          </template>
                        </q-input>
                      </div>

                      <div class="col-12">
                        <q-input
                          v-model="contactForm.phone"
                          label="Telefon Numaranız"
                          outlined
                        >
                          <template #prepend>
                            <q-icon name="phone" />
                          </template>
                        </q-input>
                      </div>

                      <div class="col-12">
                        <q-input
                          v-model="contactForm.message"
                          label="Mesajınız *"
                          type="textarea"
                          outlined
                          rows="5"
                          :rules="[val => !!val || 'Bu alan zorunludur']"
                        >
                          <template #prepend>
                            <q-icon name="message" />
                          </template>
                        </q-input>
                      </div>

                      <div class="col-12">
                        <q-btn
                          type="submit"
                          unelevated
                          color="green-8"
                          label="Gönder"
                          icon-right="send"
                          size="lg"
                          class="full-width"
                        />
                      </div>
                    </div>
                  </q-form>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </section>
      </q-page>
    </q-page-container>

    <!-- FOOTER -->
    <q-footer class="bg-grey-9 text-grey-4">
      <div class="q-pa-lg text-center">
        © 2025 AgriSense • Akıllı Tarım Teknolojileri
      </div>
    </q-footer>
  </q-layout>
</template>

<style scoped>
.hero {
  min-height: 80vh;
  padding: 80px 64px;
  background: linear-gradient(135deg, #f1f8e9, #e8f5e9);
}

.section {
  padding: 80px 64px;
}

.section-title {
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 48px;
}

.feature {
  padding: 32px;
  border-radius: 16px;
  transition: 0.3s;
}

.feature:hover {
  transform: translateY(-6px);
}

.how-card {
  padding: 32px;
  border-radius: 20px;
}

.step-circle {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  border-radius: 50%;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #2e7d32;
}

.cta {
  padding: 80px 64px;
  background: linear-gradient(135deg, #2e7d32, #1b5e20);
  color: white;
  text-align: center;
}

.stats-section {
  padding: 80px 64px;
  background: linear-gradient(135deg, #2e7d32, #1b5e20);
  color: white;
}

.stat-item {
  padding: 24px;
}

.hero-card {
  border-radius: 20px;
}

.contact-info-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 32px;
}

.contact-form {
  border-radius: 16px;
  padding: 16px;
}

.select-none {
  user-select: none !important;
}

html {
  scroll-behavior: smooth;
}
</style>
