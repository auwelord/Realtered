<template>
    <div class="d-flex justify-content-center p-5">
    <img class="rollOutAlt1" src="@/assets/img/altered/factions/axiom.webp" />
    <img class="rollOutAlt2" src="@/assets/img/altered/factions/bravos.webp" />
    <img class="rollOutAlt3" src="@/assets/img/altered/factions/lyra.webp" />
    <img class="rollOutAlt4" src="@/assets/img/altered/factions/muna.webp" />
    <img class="rollOutAlt5" src="@/assets/img/altered/factions/ordis.webp" />
    <img class="rollOutAlt6" src="@/assets/img/altered/factions/yzmir.webp" />
    </div>
</template>

<script setup>
import '@/assets/css/animate.css';
</script>

<style scoped>
img {
    width: 30px;
}

@keyframes rollOutAlt1 {
  0% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }

  100% {
    opacity: 0;
    -webkit-transform: translateX(100%) rotate(120deg);
    -ms-transform: translateX(100%) rotate(120deg);
    transform: translateX(100%) rotate(120deg);
  }
}
@keyframes rollOutAlt2 {
  10% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }

  100% {
    opacity: 0;
    -webkit-transform: translateX(100%) rotate(120deg);
    -ms-transform: translateX(100%) rotate(120deg);
    transform: translateX(100%) rotate(120deg);
  }
}
@keyframes rollOutAlt3 {
  20% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }

  100% {
    opacity: 0;
    -webkit-transform: translateX(100%) rotate(120deg);
    -ms-transform: translateX(100%) rotate(120deg);
    transform: translateX(100%) rotate(120deg);
  }
}
@keyframes rollOutAlt4 {
  30% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }

  100% {
    opacity: 0;
    -webkit-transform: translateX(100%) rotate(120deg);
    -ms-transform: translateX(100%) rotate(120deg);
    transform: translateX(100%) rotate(120deg);
  }
}
@keyframes rollOutAlt5 {
  40% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }

  100% {
    opacity: 0;
    -webkit-transform: translateX(100%) rotate(120deg);
    -ms-transform: translateX(100%) rotate(120deg);
    transform: translateX(100%) rotate(120deg);
  }
}
@keyframes rollOutAlt6 {
  50% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }

  100% {
    opacity: 0;
    -webkit-transform: translateX(100%) rotate(120deg);
    -ms-transform: translateX(100%) rotate(120deg);
    transform: translateX(100%) rotate(120deg);
  }
}

.rollOutAlt1 {
  -webkit-animation-name: rollOutAlt1;
  animation-name: rollOutAlt1;
}
.rollOutAlt2 {
  -webkit-animation-name: rollOutAlt2;
  animation-name: rollOutAlt2;
}
.rollOutAlt3 {
  -webkit-animation-name: rollOutAlt3;
  animation-name: rollOutAlt3;
}
.rollOutAlt4 {
  -webkit-animation-name: rollOutAlt4;
  animation-name: rollOutAlt4;
}
.rollOutAlt5 {
  -webkit-animation-name: rollOutAlt5;
  animation-name: rollOutAlt5;
}
.rollOutAlt6 {
  -webkit-animation-name: rollOutAlt6;
  animation-name: rollOutAlt6;
}
.rollOutAlt1 {
  -webkit-transform-origin: top center;
  -ms-transform-origin: top center;
  transform-origin: top center;
  animation: rollOutAlt1 2s infinite;
}
.rollOutAlt2 {
  -webkit-transform-origin: top center;
  -ms-transform-origin: top center;
  transform-origin: top center;
  animation: rollOutAlt2 2s infinite;
}
.rollOutAlt3 {
  -webkit-transform-origin: top center;
  -ms-transform-origin: top center;
  transform-origin: top center;
  animation: rollOutAlt3 2s infinite;
}
.rollOutAlt4 {
  -webkit-transform-origin: top center;
  -ms-transform-origin: top center;
  transform-origin: top center;
  animation: rollOutAlt4 2s infinite;
}
.rollOutAlt5 {
  -webkit-transform-origin: top center;
  -ms-transform-origin: top center;
  transform-origin: top center;
  animation: rollOutAlt5 2s infinite;
}
.rollOutAlt6 {
  -webkit-transform-origin: top center;
  -ms-transform-origin: top center;
  transform-origin: top center;
  animation: rollOutAlt6 2s infinite;
}
</style>