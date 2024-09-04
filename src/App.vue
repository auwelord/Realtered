<template>
   <BToastOrchestrator />

  <!-- ========================= preloader start ========================= -->
  <div class="preloader">
    <div class="loader">
      <div class="ytp-spinner">
        <div class="ytp-spinner-container">
          <div class="ytp-spinner-rotator">
            <div class="ytp-spinner-left">
              <div class="ytp-spinner-circle"></div>
            </div>
            <div class="ytp-spinner-right">
              <div class="ytp-spinner-circle"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <router-view />
</template>

<script>
export default {
  name: 'App',
  mounted() {
    window.onload = function () {
      window.setTimeout(function () {
        document.querySelector('.preloader').style.opacity = '0';
        document.querySelector('.preloader').style.display = 'none';
      }, 500);
    }

    window.onscroll = function () {
      // show or hide the back-top-top button
      var backToTo = document.querySelector(".scroll-top");
      if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        backToTo.style.display = "flex";
      } else {
        backToTo.style.display = "none";
      }
    };
  }
};
</script>