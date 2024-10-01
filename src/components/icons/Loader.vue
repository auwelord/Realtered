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

  50% {
    opacity: 0.25;
    -webkit-transform: translateX(100%) rotate(80deg);
    -ms-transform: translateX(100%) rotate(80deg);
    transform: translateX(100%) rotate(80deg);
  }

  100% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }
}
@keyframes rollOutAlt2 {
  0% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }

  60% {
    opacity: 0.25;
    -webkit-transform: translateX(100%) rotate(80deg);
    -ms-transform: translateX(100%) rotate(80deg);
    transform: translateX(100%) rotate(80deg);
  }

  100% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }
}
@keyframes rollOutAlt3 {
  0% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }

  70% {
    opacity: 0.25;
    -webkit-transform: translateX(100%) rotate(80deg);
    -ms-transform: translateX(100%) rotate(80deg);
    transform: translateX(100%) rotate(80deg);
  }

  100% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }
}
@keyframes rollOutAlt4 {
  0% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }

  80% {
    opacity: 0.25;
    -webkit-transform: translateX(100%) rotate(80deg);
    -ms-transform: translateX(100%) rotate(80deg);
    transform: translateX(100%) rotate(80deg);
  }

  100% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }
}
@keyframes rollOutAlt5 {
  0% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }

  90% {
    opacity: 0.25;
    -webkit-transform: translateX(100%) rotate(80deg);
    -ms-transform: translateX(100%) rotate(80deg);
    transform: translateX(100%) rotate(80deg);
  }

  100% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }
}
@keyframes rollOutAlt6 {
  0% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
  }

  95% {
    opacity: 0.25;
    -webkit-transform: translateX(100%) rotate(80deg);
    -ms-transform: translateX(100%) rotate(80deg);
    transform: translateX(100%) rotate(80deg);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateX(0px) rotate(0deg);
    -ms-transform: translateX(0px) rotate(0deg);
    transform: translateX(0px) rotate(0deg);
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
  animation: rollOutAlt1 3s infinite;
}
.rollOutAlt2 {
  -webkit-transform-origin: top center;
  -ms-transform-origin: top center;
  transform-origin: top center;
  animation: rollOutAlt2 3s infinite;
}
.rollOutAlt3 {
  -webkit-transform-origin: top center;
  -ms-transform-origin: top center;
  transform-origin: top center;
  animation: rollOutAlt3 3s infinite;
}
.rollOutAlt4 {
  -webkit-transform-origin: top center;
  -ms-transform-origin: top center;
  transform-origin: top center;
  animation: rollOutAlt4 3s infinite;
}
.rollOutAlt5 {
  -webkit-transform-origin: top center;
  -ms-transform-origin: top center;
  transform-origin: top center;
  animation: rollOutAlt5 3s infinite;
}
.rollOutAlt6 {
  -webkit-transform-origin: top center;
  -ms-transform-origin: top center;
  transform-origin: top center;
  animation: rollOutAlt6 3s infinite;
}
</style>