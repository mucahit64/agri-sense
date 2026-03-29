<script setup lang="ts">
import BackgroundImage from '~/assets/background2.jpg'
import LandingTopbar from '~/components/LandingTopbar.vue'
import Stat from '~/components/Stat.vue'

const features = [
  {
    icon: 'psychology',
    title: 'AI Destekli Sulama Önerisi',
    description: 'GPT-4o tabanlı yapay zeka, toprak nemi, sıcaklık ve yağış verilerini analiz ederek günlük sulama tavsiyeleri sunar.',
  },
  {
    icon: 'wb_sunny',
    title: 'Anlık Hava Durumu',
    description: '17 şehir ve özel koordinat desteğiyle 5 günlük saat bazlı hava tahmini; rüzgar, basınç ve yağış olasılığı.',
  },
  {
    icon: 'sensors',
    title: 'Gerçek Zamanlı Sensör İzleme',
    description: '15+ sensör tipi desteğiyle toprak nemi, sıcaklık, nem, basınç ve ışık seviyesini anlık takip edin.',
  },
  {
    icon: 'analytics',
    title: 'Geçmiş Veri Analizi',
    description: 'Tüm okuma geçmişi korunur. Min, max, ortalama hesaplamalarıyla zaman serisi analizi yapın.',
  },
  {
    icon: 'water_drop',
    title: 'Toprak Nemi Kalibrasyonu',
    description: 'Sensör ham değerlerini otomatik yüzdeye çevirir. Min/max kalibrasyon ile doğru nem ölçümü.',
  },
  {
    icon: 'integration_instructions',
    title: 'REST API Entegrasyonu',
    description: 'Arduino ve ESP32 cihazlarınızı 22 RESTful endpoint ile kolayca bağlayın, sensörler otomatik oluşturulsun.',
  },
]

const highlights = [
  {
    icon: 'smart_toy',
    title: 'Yapay Zeka Tahminleri',
    description: 'Bugün sulama yapmalı mıyım? AI, sensör verilerinizi ve hava durumunu analiz ederek güven skorlu öneriler sunar.',
    color: 'green-8',
  },
  {
    icon: 'thermostat',
    title: 'Çok Sensörlü İzleme',
    description: 'Toprak nemi, sıcaklık, nem, atmosfer basıncı, rüzgar hızı, ışık seviyesi — hepsini tek panelden izleyin.',
    color: 'blue-8',
  },
  {
    icon: 'timeline',
    title: 'Tarihsel Raporlama',
    description: 'Son 20, 50, 100 veya 200 okumayı listeleyin. Geçmiş trendleri görün, mevsimsel kararlar alın.',
    color: 'orange-8',
  },
]

const techStack = [
  { icon: 'cloud', label: 'Cloudflare Edge' },
  { icon: 'smart_toy', label: 'GPT-4o AI' },
  { icon: 'api', label: '22 REST API' },
  { icon: 'wifi', label: 'IoT Ready' },
  { icon: 'language', label: '7 Dil Desteği' },
  { icon: 'security', label: 'Güvenli Oturum' },
]

const stats = [
  { icon: 'group', value: 10000, suffix: '+', label: 'Aktif Kullanıcı' },
  { icon: 'sensors', value: 50000, suffix: '+', label: 'Bağlı Sensör' },
  { icon: 'landscape', value: 25000, suffix: '+', label: 'Hektar Arazi' },
  { icon: 'trending_up', value: 40, suffix: '%', label: 'Verimlilik Artışı' },
]

const statsSection = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!statsSection.value)
    return

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        statsSection.value!.classList.add('animate')
        observer.disconnect()
      }
    },
    { threshold: 0.3 },
  )

  observer.observe(statsSection.value)
})

const steps = [
  { icon: 'app_registration', title: 'Hesap Oluşturun', description: 'Hızlı kayıt ile anında başlayın. 7 dil ve 12+ ülke desteği.' },
  { icon: 'settings_input_antenna', title: 'Cihaz & Sensör Ekleyin', description: 'ESP32/Arduino cihazlarınızı API ile bağlayın, sensörler otomatik tanınsın.' },
  { icon: 'grass', title: 'Tarlalarınızı Tanımlayın', description: 'Koordinat, alan ve toprak tipiyle tarlalarınızı sisteme ekleyin.' },
  { icon: 'insights', title: 'Analiz & AI Önerisi Alın', description: 'Sensör verileriniz + hava durumu = AI destekli sulama ve verimlilik tavsiyeleri.' },
]

const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  message: '',
})

function submitContact() {
  // TODO: Implement contact form submission
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
    <LandingTopbar />

    <q-page-container>
      <q-page>
        <!-- HERO -->
        <section
          id="top"
          class="hero"
          :style="{ backgroundImage: `url(${BackgroundImage})` }"
        >
          <div class="content row items-center">
            <div class="col-12 col-md-6 hero-text">
              <div class="text-overline text-green-7">
                AI DESTEKLİ AKILLI TARIM PLATFORMU
              </div>
              <h1 class="hero-title text-weight-bold q-mt-sm">
                Tarımınızı <span class="text-green-8">Yapay Zeka</span> ile Yönetin
              </h1>
              <p class="text-body1 text-grey-7 q-mt-md">
                15+ sensör tipi, anlık hava durumu, AI sulama önerileri ve
                geçmiş veri analiziyle tarlanızın tam kontrolü elinizde.
              </p>

              <div class="q-gutter-md q-mt-lg row items-center">
                <q-btn
                  unelevated
                  color="green-8"
                  label="Ücretsiz Dene"
                  size="lg"
                  icon="arrow_forward"
                  @click="() => $router.push('/auth/register')"
                />
                <q-btn
                  outline
                  color="green-8"
                  label="Özellikleri Keşfet"
                  size="lg"
                  @click="scrollToSection('#features')"
                />
              </div>
            </div>

            <div class="col-12 col-md-6 q-mt-xl q-mt-md-none">
              <q-card class="hero-card">
                <q-card-section class="bg-green-8 text-white">
                  <div class="text-subtitle1 row items-center">
                    <q-icon name="smart_toy" class="q-mr-sm" />
                    AI Sulama Önerisi
                  </div>
                </q-card-section>
                <q-card-section class="q-pa-md">
                  <div class="row q-col-gutter-sm q-mb-md">
                    <Stat icon="opacity" label="Toprak Nemi" value="68%" />
                    <Stat icon="thermostat" label="Sıcaklık" value="24°C" />
                    <Stat icon="water_drop" label="Nem" value="89%" />
                    <Stat icon="wb_sunny" label="Işık" value="850 lx" />
                  </div>
                  <q-separator class="q-mb-md" />
                  <div class="row items-start q-gutter-sm">
                    <q-icon name="psychology" size="24px" color="green-8" class="q-mt-xs" />
                    <div class="col text-body2 text-grey-8">
                      <strong class="text-green-8">AI Önerisi:</strong> Toprak nemi yeterli seviyede ve yağış bekleniyor. Bugün sulama yapmanıza gerek yok.
                      <div class="text-caption text-grey-6 q-mt-xs">
                        Güven Skoru: %92 · Son güncelleme: 5 dk önce
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </section>

        <!-- FEATURES -->
        <section
          id="features"
          class="section bg-grey-2"
        >
          <h2 class="section-title">
            Neden AgriSense?
          </h2>
          <div class="row q-col-gutter-lg">
            <div
              v-for="f in features"
              :key="f.title"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card
                flat
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

        <!-- HIGHLIGHTS (AI, Sensör, Raporlama detayları) -->
        <section class="section">
          <h2 class="section-title">
            Öne Çıkan Yetenekler
          </h2>
          <div class="row q-col-gutter-lg">
            <div
              v-for="h in highlights"
              :key="h.title"
              class="col-12 col-md-4"
            >
              <q-card flat bordered class="highlight-card full-height">
                <q-card-section>
                  <q-icon :name="h.icon" size="48px" :color="h.color" />
                  <div class="text-h6 text-weight-bold q-mt-md">
                    {{ h.title }}
                  </div>
                  <p class="text-body2 text-grey-7 q-mt-sm">
                    {{ h.description }}
                  </p>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </section>

        <!-- TECH STACK -->
        <section class="section bg-grey-2">
          <h2 class="section-title">
            Kullanılan Teknolojiler
          </h2>
          <div class="row q-col-gutter-md justify-center">
            <div
              v-for="tech in techStack"
              :key="tech.label"
              class="col-6 col-sm-4 col-md-2"
            >
              <q-card flat class="tech-card text-center full-height">
                <q-card-section>
                  <q-icon :name="tech.icon" size="36px" color="green-8" />
                  <div class="text-caption text-weight-bold q-mt-sm">
                    {{ tech.label }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </section>

        <!-- STATS SECTION -->
        <section ref="statsSection" class="stats-section">
          <div class="row text-center">
            <div
              v-for="(stat, index) in stats"
              :key="index"
              class="col-6 col-md-3"
            >
              <div class="stat-item">
                <q-icon :name="stat.icon" :size="$q.screen.xs ? '40px' : '56px'" class="q-mb-sm q-mb-md-md" />

                <div class="stat-value text-weight-bold">
                  <span class="count-up" :style="`--start: ${stat.value - 10}; --target: ${stat.value}`" />{{ stat.suffix }}
                </div>

                <div class="stat-label text-green-2 q-mt-xs q-mt-sm-sm">
                  {{ stat.label }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- HOW IT WORKS -->
        <section
          id="how"
          class="section bg-grey-2"
        >
          <h2 class="section-title">
            Nasıl Çalışır?
          </h2>
          <div class="row q-col-gutter-xl q-col-gutter-sm-sm text-center">
            <div
              v-for="(step, i) in steps"
              :key="step.title"
              class="col-12 col-sm-6 col-md-3"
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
          <h2 class="cta-title text-weight-bold">
            Tarımı Dijitalleştirmenin Tam Zamanı
          </h2>
          <p class="text-body1 q-mt-sm" style="max-width: 600px; margin: 0 auto;">
            AI destekli sulama önerileri, 15+ sensör tipi, anlık hava durumu ve geçmiş veri analizi.
            Şimdi ücretsiz deneyin, tarlanızın verimliliğini artırın!
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
          class="section bg-grey-2"
        >
          <h2 class="section-title">
            Bizimle İletişime Geçin
          </h2>
          <div class="row q-col-gutter-lg q-col-gutter-sm-xl">
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
                          label="Ad Soyad"
                          outlined
                          hide-bottom-space
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
                          label="E-posta"
                          type="email"
                          outlined
                          hide-bottom-space
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
                          label="Telefon"
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
                          label="Mesaj"
                          type="textarea"
                          outlined
                          rows="5"
                          hide-bottom-space
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
  background-color: #1b5e20;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(241, 248, 233, 0.78), rgba(232, 245, 233, 0.72));
  z-index: 0;
}

.hero > * {
  position: relative;
  z-index: 1;
}

.hero-text {
  padding-right: 48px;
}

.hero-title {
  font-size: 2.125rem; /* text-h3 */
  line-height: 1.2;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: 0.3s;
}

.how-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.step-circle {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  border-radius: 50%;
  background: #e8f5e9;
  display: inline-flex;
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

.cta-title {
  font-size: 2rem; /* text-h4 */
  line-height: 1.2;
}

.stats-section {
  padding: 80px 64px;
  background: linear-gradient(135deg, #2e7d32, #1b5e20);
  color: white;
}

.stat-item {
  padding: 24px;
}

.stat-value {
  font-size: 2.125rem; /* text-h3 */
  line-height: 1.2;
}

.stat-label {
  font-size: 1.25rem; /* text-h6 */
}

.hero-card {
  border-radius: 20px;
}

.highlight-card {
  border-radius: 16px;
  transition: 0.3s;
}

.highlight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.tech-card {
  border-radius: 12px;
  background: white;
  transition: 0.3s;
}

.tech-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

/* Tablet (sm: 600-1023px) */
@media (max-width: 1023px) {
  .hero-text {
    padding-right: 0;
  }
}

/* Mobile (xs: <600px) */
@media (max-width: 599px) {
  .hero {
    min-height: unset;
    padding: 40px 20px;
  }

  .hero-title {
    font-size: 1.6rem;
  }

  .section {
    padding: 48px 20px;
  }

  .section-title {
    font-size: 22px;
    margin-bottom: 28px;
  }

  .feature {
    padding: 20px;
  }

  .how-card {
    padding: 20px;
  }

  .step-circle {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }

  .cta {
    padding: 48px 20px;
  }

  .cta-title {
    font-size: 1.5rem;
  }

  .stats-section {
    padding: 48px 20px;
  }

  .stat-item {
    padding: 12px;
  }

  .stat-value {
    font-size: 1.4rem;
  }

  .stat-label {
    font-size: 0.875rem;
  }

  .contact-info-item {
    margin-bottom: 20px;
  }

  .contact-form {
    padding: 4px;
  }
}

/* istatistik için css animasyon */
@property --num {
  syntax: '<integer>';
  initial-value: 0;
  inherits: false;
}

.count-up {
  counter-reset: num var(--num);
  --num: var(--start);
}

.count-up::after {
  content: counter(num);
}

.stats-section.animate .count-up {
  animation: count-up 5s ease-out forwards;
}

@keyframes count-up {
  from {
    --num: var(--start);
  }
  to {
    --num: var(--target);
  }
}
</style>
