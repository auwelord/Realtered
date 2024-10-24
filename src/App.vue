<template>
   <BToastOrchestrator />

  <Menu :user="user" @deconnect="onDeconnexion" @connect="onConnect" />

  <RouterView :user="user"/>
  
  <BModal v-model="waitingScreen" size="fullscreen" show hide-footer hide-header class="aw-waitingscreen">
    <!--@hidden="onHideModalDetail"-->
    <div class="d-flex flex-column align-items-center">
      <Loader />
      <div>Chargement en cours</div>
    </div>
  </BModal>
</template>

<script>
import { useGlobalStore } from '@/stores/global'

export default 
{
  name: 'App',
  data() {
    return {
      globalStore: useGlobalStore(),
      user: null,
      waitingScreen: false,
      timeoutWaitingScreen: null,
      width: window.innerWidth,
      height: window.innerHeight
    }
  },
  mounted() 
  {
    this.g_retrieveuser(puser => this.user = puser)
    window.addEventListener('resize', this.updateWindowSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowSize);
  },
  provide() {
    return {
      callShowWaitingScreen: this.showWaitingScreen,
      callHideWaitingScreen: this.hideWaitingScreen,
      getViewportWidth: this.getViewportWidth
    }
  },
  methods: 
  {
    getViewportWidth() {
      return this.width
    },
    updateWindowSize() {
      this.width = window.innerWidth
      this.height = window.innerHeight

      if(this.width >= 1200) this.globalStore.cardfilter.ui.showfilters = true
    },
    onConnect()
    {
      this.g_retrieveuser(puser => this.user = puser);
    },
    onDeconnexion()
    {
      this.g_deconnectUser(() => this.user = null);
    },
    showWaitingScreen(pdelay)
    {
      if($('.aw-waitingscreen').hasClass('show')) return

      if(!pdelay) this.waitingScreen = true
      else
      {
        this.timeoutWaitingScreen = setTimeout(() => this.waitingScreen = true, pdelay)
      }
    },
    hideWaitingScreen()
    {
      this.waitingScreen = false
      
      if(this.timeoutWaitingScreen) clearTimeout(this.timeoutWaitingScreen)
    }
  }
};
</script>