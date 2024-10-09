<template>
  <section id="home" class="hero-section">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-6">
          <div class="hero-content">
            <h1 class="wow fadeInUp fs-1 color-white" data-wow-delay=".2s">
              <span v-if="user">{{ $t('ui.paccueil.welcome', {name: user.user_metadata.custom_claims.global_name})}}</span>
              <span v-else>Explorer l'inattendu</span>
            </h1>
            <p class="wow fadeInUp color-white" data-wow-delay=".4s">
              {{ $t('ui.paccueil.welcomebas') }}
            </p>
            <div class="hero-btns text-center">
              <router-link to="/cartes" class="main-btn btn-hover wow fadeInUp" href="#" data-wow-delay=".6s">
                {{ $t('ui.menu.cartes')}}
              </router-link>
              <router-link to="/decklists" class="main-btn btn-hover wow fadeInUp" href="#" data-wow-delay=".6s">
                Decks
              </router-link>
              <router-link to="/deckbuilder" class="main-btn border-btn btn-hover btn-uniqued2 wow fadeInUp" href="#" data-wow-delay=".6s">
                Deckbuilder
              </router-link>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="hero-img wow fadeInUp text-center" data-wow-delay=".5s">
            <img src="@/assets/img/altered_kojo.png" alt="" class="img-fluid hero-img">
          </div>
        </div>
      </div>
    </div>
    <div class="hero-shape">
      <img src="@/assets/img/bgshape.png" alt="" class="shape shape-1">
    </div>
  </section>

  <section id="portfolio" class="portfolio">
    <div class="portfolio-details">
      <div class="section-heading text-center">
        <h2>{{ $t('ui.paccueil.officialwebsite') }}</h2>
      </div>
      <div class="container">
        <div class="portfolio-content">
          <div class="isotope">
            <div class="row">

              <div class="col-sm-3"></div>
              <div class="col-sm-6">
                <div class="item">
                  <img src="@/assets/img/altered/tools/altered.jpg" alt="Altered TCG">
                  <div class="d-flex justify-content-center fs-5">Altered TCG</div>
                  <div class="isotope-overlay">
                    <a href="https://www.altered.gg/">
                      Altered TCG
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
              </div>
              <div class="col-sm-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="portfolio" class="portfolio">
    <div class="portfolio-details">
      <div class="section-heading text-center">
        <h2>{{ $t('ui.paccueil.outils') }}</h2>
      </div>
      <div class="container">
        <div class="portfolio-content">
          <div class="isotope">
            <div class="row">

              <div class="col-sm-4">
                <div class="item">
                  <img src="@/assets/img/altered/tools/bga.webp" alt="Board Game Arena">
                  <div class="d-flex justify-content-center fs-5">Board Game Arena</div>
                  <div class="isotope-overlay">
                    <a href="https://boardgamearena.com/gamepanel?game=altered">
                      Board Game Arena
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
                <div class="item">
                  <img src="@/assets/img/altered/tools/exaltered.webp" alt="ExAltered">
                  <div class="d-flex justify-content-center fs-5">ExAltered</div>
                  <div class="isotope-overlay">
                    <a href="https://wrong-timeline.itch.io/exaltered">
                      ExAltered
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
                <div class="item">
                  <img src="@/assets/img/altered/tools/uniquesranking.webp" alt="Uniques Ranking">
                  <div class="d-flex justify-content-center fs-5">Uniques Ranking</div>
                  <div class="isotope-overlay">
                    <a href="https://uniquesranking.com/">
                      Uniques Ranking
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
                <div class="item">
                  <img src="@/assets/img/altered/tools/alteredeck.webp" alt="Altered Deck">
                  <div class="d-flex justify-content-center fs-5">Altered Deck</div>
                  <div class="isotope-overlay">
                    <a href="https://alteredeck.fr/">
                      Altered Deck
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
                <div class="item">
                  <img src="@/assets/img/altered/tools/counter.webp" alt="Altered Counter">
                  <div class="d-flex justify-content-center fs-5">Altered Counter</div>
                  <div class="isotope-overlay">
                    <a href="https://apps.mrdo.fr/altered/">
                      Altered Counter
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
                
              </div><!-- /.col -->

              <div class="col-sm-4">
                <div class="item">
                  <img src="@/assets/img/altered/tools/exaltstable.webp" alt="Exalts Table">
                  <div class="d-flex justify-content-center fs-5">Exalts Table</div>
                  <div class="isotope-overlay">
                    <a href="https://exalts-table.com/">
                      Exalts Table
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
                <div class="item">
                  <img src="@/assets/img/altered/tools/alteredcard.webp" alt="Altered Card">
                  <div class="d-flex justify-content-center fs-5">Altered Card</div>
                  <div class="isotope-overlay">
                    <a href="https://www.altered-card.com/">
                      Altered Card
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
                <div class="item">
                  <img src="@/assets/img/altered/tools/gridview.webp" alt="Card Grid View">
                  <div class="d-flex justify-content-center fs-5">Card Grid View</div>
                  <div class="isotope-overlay">
                    <a href="https://altered-db.com/gridview/">
                      Card Grid View
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
                <div class="item">
                  <img src="@/assets/img/altered/tools/cardbuilder.webp" alt="Custom Card Builder">
                  <div class="d-flex justify-content-center fs-5">Custom Card Builder</div>
                  <div class="isotope-overlay">
                    <a href="https://kelonburst.com/card-builder">
                      Custom Card Builder
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
                <div class="item">
                  <img src="@/assets/img/altered/tools/altermate.webp" alt="Altermate">
                  <div class="d-flex justify-content-center fs-5">Altermate</div>
                  <div class="isotope-overlay">
                    <a href="https://unique.cards/altermate/">
                      Altermate
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
              </div><!-- /.col -->

              <div class="col-sm-4">
                <div class="item">
                  <img src="@/assets/img/altered/tools/ajordat.webp" alt="Altered TCG Builder">
                  <div class="d-flex justify-content-center fs-5">Altered TCG Builder</div>
                  <div class="isotope-overlay">
                    <a href="https://altered.ajordat.com/">
                      Altered TCG Builder
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
                <div class="item">
                  <img src="@/assets/img/altered/tools/firsthand.webp" alt="Simulateur de première main">
                  <div class="d-flex justify-content-center fs-5">Simulateur de première main</div>
                  <div class="isotope-overlay">
                    <a href="https://altered-db.com/fhand/">
                      Simulateur de première main
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
                <div class="item">
                  <img src="@/assets/img/altered/tools/proxygen.webp" alt="Print&Play Generator">
                  <div class="d-flex justify-content-center fs-5">Print&Play Generator</div>
                  <div class="isotope-overlay">
                    <a href="https://altered-proxy-print.vercel.app/">
                      Print&Play Generator
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
                <div class="item">
                  <img src="@/assets/img/altered/tools/AlteRate.png" alt="AlteRate">
                  <div class="d-flex justify-content-center fs-5">AlteRate</div>
                  <div class="isotope-overlay">
                    <a href="https://github.com/Ticoche-Tougan/AlteRate/releases">
                      AlteRate
                    </a>
                  </div><!-- /.isotope-overlay -->
                </div><!-- /.item -->
              </div><!-- /.col -->
            </div><!-- /.row -->
          </div><!--/.isotope-->
        </div><!--/.gallery-content-->
      </div><!--/.container-->
    </div><!--/.portfolio-details-->

  </section>

  <footer id="footer" class="footer">
    <div class="footer-shape">
      <img src="@/assets/img/footer/footershape.png" alt="" class="shape shape-1">
    </div>
    <div class="container">
      <div class="widget-wrapper">
        <div class="row">
          <div class="col-xl-4 col-lg-4 col-md-6 col-sm-6 mt-5">
            <div class="footer-widget">
              <div class="logo">
                <a href="index.html">
                  <LogoAltered :width="200" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="copy-right-wrapper">
        <p>{{ $t('ui.paccueil.owner') }} <a href="mailto:auwelord@gmail.com" rel="nofollow" target="_blank">Auwelord</a>
        </p>
        <p class="fs-8">{{ $t('ui.paccueil.disclaimer1') }}<br>{{ $t('ui.paccueil.disclaimer2') }}<br>{{ $t('ui.paccueil.disclaimer3') }}
        </p>
      </div> 
    </div>


  </footer>
</template>

<script setup>
import { useHead } from '@vueuse/head';

defineProps({
  user: { type: Object }
});
useHead({
    title: 'Realtered',
    meta: [
        { property: 'og:title', content: 'Realtered' },
        { property: 'og:description', content: 'Realtered: deckbuilder by Auwelord' },
        { property: 'og:image', content: 'https://fyqptmokmnymednlerpj.supabase.co/storage/v1/object/public/Altered/assets/logos/Realtered.png' },
        { property: 'og:url', content: window.location.href },
        { property: 'og:type', content: 'article' }
    ]
})
</script>

<script>
import LogoAltered from '@/components/icons/Logo.vue'
import '@/assets/css/tiers/style.css';

export default {
  name: 'Accueil',
  components: {
    LogoAltered
  },
};
</script>

<style scoped>
.portfolio .item {
  box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
}

.hero-section {
  position: relative;
  z-index: 1;
  padding: 150px 0 50px;
  background-image: url("../assets/img/bg.webp");
  /*background-repeat: no-repeat;*/
  background-position: left;
}

@media only screen and (min-width: 768px) and (max-width: 991px) {
  .hero-section .hero-content {
    margin-bottom: 50px;
  }
}

@media (max-width: 767px) {
  .hero-section .hero-content {
    margin-bottom: 50px;
  }
}

.hero-section .hero-content h1 {
  font-size: 60px;
  margin-bottom: 35px;
}

@media only screen and (min-width: 1200px) and (max-width: 1399px) {
  .hero-section .hero-content h1 {
    font-size: 55px;
  }
}

@media only screen and (min-width: 992px) and (max-width: 1199px) {
  .hero-section .hero-content h1 {
    font-size: 48px;
  }
}

@media (max-width: 767px) {
  .hero-section .hero-content h1 {
    font-size: 36px;
  }
}

@media only screen and (min-width: 480px) and (max-width: 767px) {
  .hero-section .hero-content h1 {
    font-size: 45px;
  }
}

.hero-section .hero-content p {
  margin-bottom: 40px;
}

@media only screen and (min-width: 1400px) {
  .hero-section .hero-content p {
    padding-right: 100px;
  }
}

.hero-section .hero-content .hero-btns .main-btn {
  padding: 14px 32px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 20px;
  font-family: "Hind Siliguri", sans-serif;
  margin-right: 30px;
  margin-bottom: 30px;
  border: 2px solid transparent;
}

.hero-section .hero-content .hero-btns .main-btn:hover {
  box-shadow: 0px 3px 26px rgba(78, 110, 241, 0.39);
}

.hero-section .hero-content .hero-btns .main-btn.border-btn {
  margin-right: 0;
  color: #e7720a;
  border-color: #DA7C1C;
}

@media (max-width: 767px) {
  .hero-section .hero-img img {
    width: 100%;
  }
}

.hero-section .hero-shape .shape {
  position: absolute;
  z-index: -1;
}

.hero-section .hero-shape .shape.shape-1 {
  top: 90px;
  right: 0;
}

@media only screen and (min-width: 1200px) and (max-width: 1399px) {
  .hero-section .hero-shape .shape.shape-1 {
    top: -420px;
    right: -550px;
  }
}

@media only screen and (min-width: 992px) and (max-width: 1199px) {
  .hero-section .hero-shape .shape.shape-1 {
    top: -400px;
    right: -550px;
  }
}

@media only screen and (min-width: 768px) and (max-width: 991px) {
  .hero-section .hero-shape .shape.shape-1 {
    display: none;
  }
}

@media (max-width: 767px) {
  .hero-section .hero-shape .shape.shape-1 {
    display: none;
  }
}

.hero-img {
  max-height: 454px;
}


.footer {
  position: relative;
  z-index: 1;
}

.footer .footer-shape .shape {
  position: absolute;
  z-index: -1;
}

.footer .footer-shape .shape.shape-1 {
  bottom: 0px;
}

@media only screen and (min-width: 1400px) {
  .footer .footer-shape .shape.shape-1 {
    left: -30px;
  }
}

@media only screen and (min-width: 1200px) and (max-width: 1399px) {
  .footer .footer-shape .shape.shape-1 {
    left: -100px;
  }
}

@media only screen and (min-width: 992px) and (max-width: 1199px) {
  .footer .footer-shape .shape.shape-1 {
    display: none;
  }
}

@media only screen and (min-width: 768px) and (max-width: 991px) {
  .footer .footer-shape .shape.shape-1 {
    display: none;
  }
}

@media only screen and (min-width: 480px) and (max-width: 767px) {
  .footer .footer-shape .shape.shape-1 {
    display: none;
  }
}

.footer .widget-wrapper .footer-widget {
  margin-bottom: 40px;
}

.footer .widget-wrapper .footer-widget .logo {
  margin-bottom: 30px;
}

@media only screen and (min-width: 1400px) {
  .footer .widget-wrapper .footer-widget .logo .logo-1 {
    display: none;
  }
}

@media only screen and (min-width: 1200px) and (max-width: 1399px) {
  .footer .widget-wrapper .footer-widget .logo .logo-1 {
    display: none;
  }
}

.footer .widget-wrapper .footer-widget .logo .logo-2 {
  display: none;
}

@media only screen and (min-width: 1200px) and (max-width: 1399px) {
  .footer .widget-wrapper .footer-widget .logo .logo-2 {
    display: block;
  }
}

@media only screen and (min-width: 1400px) {
  .footer .widget-wrapper .footer-widget .logo .logo-2 {
    display: block;
  }
}

.footer .widget-wrapper .footer-widget p.desc {
  padding-right: 100px;
  margin-bottom: 35px;
}

.footer .widget-wrapper .footer-widget h3 {
  margin-top: 20px;
  margin-bottom: 30px;
}

.footer .widget-wrapper .footer-widget .socials {
  display: flex;
}

.footer .widget-wrapper .footer-widget .socials li {
  margin-right: 20px;
}

.footer .widget-wrapper .footer-widget .socials li:last-child {
  margin-right: 0;
}

.footer .widget-wrapper .footer-widget .socials li a {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.18);
  color: #000;
}

@media only screen and (min-width: 992px) and (max-width: 1199px) {
  .footer .widget-wrapper .footer-widget .socials li a {
    background: rgba(78, 110, 241, 0.1);
    color: #5E678C;
  }
}

@media only screen and (min-width: 768px) and (max-width: 991px) {
  .footer .widget-wrapper .footer-widget .socials li a {
    background: rgba(78, 110, 241, 0.1);
    color: #5E678C;
  }
}

@media (max-width: 767px) {
  .footer .widget-wrapper .footer-widget .socials li a {
    background: rgba(78, 110, 241, 0.1);
    color: #5E678C;
  }
}

.footer .widget-wrapper .footer-widget .socials li a:hover {
  background: #DA7C1C;
  color: #fff;
}

.footer .widget-wrapper .footer-widget .links li a {
  color: #5E678C;
  line-height: 33px;
}

.footer .widget-wrapper .footer-widget .links li a:hover {
  color: #DA7C1C
}

.footer .copy-right-wrapper {
  border-top: 1px solid rgba(29, 42, 93, 0.16);
  padding: 25px;
  text-align: center;
}

.footer .copy-right-wrapper p {
  font-size: 16px;
}

.footer .copy-right-wrapper p a {
  color: #5E678C;
}

.footer .copy-right-wrapper p a:hover {
  color: #DA7C1C
}
</style>
