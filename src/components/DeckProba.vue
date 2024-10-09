<template>

<div class="fs-7">
  <div class="d-flex justify-content-center fs-6 mb-2 font-weight-bold">
    {{ $t('ui.lib.starthandproba') }}
  </div>
  <div class="row">
    <div class="col-4 ">
      <div class="font-weight-bold">{{ $t('ui.lib.personnages') }}</div>
      <br>
      <div>>= 1 : {{ g_getProbaPersos(1, deck)[2] }}</div>
      <div>>= 2 : {{ g_getProbaPersos(2, deck)[2] }}</div>
      <div>>= 3 : {{ g_getProbaPersos(3, deck)[2] }}</div>
    </div>
    <div class="col-4 ">
      <div class="font-weight-bold">{{ $t('ui.lib.sorts') }}</div>
      <br>
      <div>>= 1 : {{ g_getProbaSorts(1, deck)[2] }}</div>
      <div>>= 2 : {{ g_getProbaSorts(2, deck)[2] }}</div>
      <div>>= 3 : {{ g_getProbaSorts(3, deck)[2] }}</div>
    </div>
    <div class="col-4 ">
      <div class="font-weight-bold">{{ $t('ui.lib.permanents') }}</div>
      <br>
      <div>>= 1 : {{ g_getProbaPermas(1, deck)[2] }}</div>
      <div>>= 2 : {{ g_getProbaPermas(2, deck)[2] }}</div>
      <div>>= 3 : {{ g_getProbaPermas(3, deck)[2] }}</div>
    </div>
  </div>
  <hr>
  <div class="row">
    <div class="col-4 ">
      <div class="font-weight-bold">{{ $t('ui.lib.cartex3') }}</div>
      <br>
      <div>0 : {{ g_getProbaMainDeDepart(1, 3, deck)[3] }}</div>
      <hr>
      <div>>= 1 : {{ g_getProbaMainDeDepart(1, 3, deck)[2] }}</div>
      <div>= 1 : {{ g_getProbaMainDeDepart(1, 3, deck)[1] }}</div>
      <div><= 1 : {{ g_getProbaMainDeDepart(1, 3, deck)[0] }}</div>                                
      <hr>
      <div>>= 2 : {{ g_getProbaMainDeDepart(2, 3, deck)[2] }}</div>
      <div>= 2 : {{ g_getProbaMainDeDepart(2, 3, deck)[1] }}</div>
      <div><= 2 : {{ g_getProbaMainDeDepart(2, 3, deck)[0] }}</div>                                
      <hr>
      <div>= 3 : {{ g_getProbaMainDeDepart(3, 3, deck)[1] }}</div>
    </div>
    <div class="col-4">
      <div class="font-weight-bold">{{ $t('ui.lib.cartex2') }}</div>
      <br>
      <div>0 : {{ g_getProbaMainDeDepart(1, 2, deck)[3] }}</div>
      <hr>
      <div>>= 1 : {{ g_getProbaMainDeDepart(1, 2, deck)[2] }}</div>
      <div>= 1 : {{ g_getProbaMainDeDepart(1, 2, deck)[1] }}</div>
      <div><= 1 : {{ g_getProbaMainDeDepart(1, 2, deck)[0] }}</div>                                
      <hr>
      <div>>= 2 : {{ g_getProbaMainDeDepart(2, 2, deck)[2] }}</div>
      <div>= 2 : {{ g_getProbaMainDeDepart(2, 2, deck)[1] }}</div>                                
    </div>
    <div class="col-4">
      <div class="font-weight-bold">{{ $t('ui.lib.cartex1') }}</div>
      <br>
      <div>0 : {{ g_getProbaMainDeDepart(1, 1, deck)[3] }}</div>
      <hr>
      <div>>= 1 : {{ g_getProbaMainDeDepart(1, 1, deck)[2] }}</div>
      <div>= 1 : {{ g_getProbaMainDeDepart(1, 1, deck)[1] }}</div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  props: {
    deck: {
      type: Object,
      required: true
    }
  },
  methods: {
  }
};
</script>