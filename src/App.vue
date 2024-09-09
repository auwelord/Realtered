<template>
   <BToastOrchestrator />

  <Menu :user="user" @deconnect="onDeconnexion" />
  
  <RouterView :user="user"/>
</template>

<script>
export default 
{
  name: 'App',
  data() {
    return {
      user: null
    }
  },
  mounted() 
  {
    this.g_retrieveuser(puser => this.user = puser);
  },
  methods: 
  {
    onDeconnexion()
    {
      this.g_deconnectUser(() => this.user = null);
    }
  }
};
</script>