<template>
   <BToastOrchestrator />

  <Menu :user="user" @deconnect="onDeconnexion" />
  
  <RouterView :admin="admin" :user="user"/>
</template>

<script>
export default 
{
  name: 'App',
  data() {
    return {
      user: null,
      admin: false,
    }
  },
  mounted() 
  {
    this.g_retrieveuser(puser =>
    {
      this.user = puser
      this.admin = this.g_isAdmin(puser);
    });
  },
  methods: 
  {
    onDeconnexion()
    {
      this.g_deconnecter(() => {
        this.user = null
        this.admin = false        
      });
    }
  }
};
</script>