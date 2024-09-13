<template>
    <header class="header">
        <div class="navbar-area">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-lg-12">
                        <nav class="navbar navbar-expand-lg fixed-top">
                            <router-link to="/" class="navbar-brand">
                                <img src="@/assets/img/altered/Realtered.png" width="150">
                            </router-link>
                            <button class="navbar-toggler" type="button" data-toggle="collapse"
                                data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                aria-expanded="false" aria-label="Toggle navigation">
                                <span class="toggler-icon"></span>
                                <span class="toggler-icon"></span>
                                <span class="toggler-icon"></span>
                            </button>

                            <div class="collapse navbar-collapse sub-menu-bar" id="navbarSupportedContent">
                                <ul id="nav" class="navbar-nav ml-auto">
                                    <li class="nav-item">
                                        <router-link to="/" class="page-scroll" href="#">Accueil</router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link to="/cartes" class="page-scroll" href="#">Cartes</router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link to="/decklists" class="page-scroll" href="#">Decks</router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link to="/deckbuilder" class="page-scroll" href="#">Deckbuilder</router-link>
                                    </li>
                                    <li class="nav-item">
                                        <a @click="discordConnection" class="btn aw-discord">
                                            <span v-if="user"><img :src="getAvatar()" /> {{ user.user_metadata.custom_claims.global_name }}</span>
                                            <span v-else><font-awesome-icon :icon="['fab', 'discord']" class="me-2" /> Se connecter</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <!-- navbar collapse -->
                        </nav>
                        <!-- navbar -->
                    </div>
                </div>
                <!-- row -->
            </div>
            <!-- container -->
        </div>
        <!-- navbar area -->
    </header>

    <!-- The modal -->
    <BModal v-model="modalDisconnect" @ok="discordDeconnection" centered cancel-title="Annuler" ok-title="Se déconnecter" ok-variant="danger" title="Se déconnecter">
        Etes-vous sûr de vouloir vous déconnecter ? 
    </BModal>
</template>

<script setup>
const emit = defineEmits(['deconnect']);

const discordDeconnection = () => {
  emit('deconnect');
}
</script>

<script>
import LogoAltered from '@/components/icons/Logo.vue'

export default {
    props: {
        user: {
            type: Object,
            required: false
        }
    },
    data() {
        //const user = userStore();
        return {
            modalDisconnect: false,
            okdisc: "Se déconnecter"
        };
    },
    components: {
        LogoAltered
    },
    methods: {
        getAvatar(){
            return this.user.user_metadata.avatar_url;
        },
        showModal() {
            this.modalDisconnect = !this.modalDisconnect;
        },
        discordConnection() 
        {
            if(!this.user) this.g_connectUser(this.$route.path)
            else this.modalDisconnect = true;
        }
    },
    mounted() {
        /*=====================================
        Sticky
        ======================================= */
        window.onscroll = function () {
            var header_navbar = document.querySelector(".navbar-area");
            var sticky = header_navbar.offsetTop;

            if (window.pageYOffset > sticky) {
                header_navbar.classList.add("sticky");
            } else {
                header_navbar.classList.remove("sticky");
            }

            //===== close navbar-collapse when a  clicked
            let navbarToggler = document.querySelector(".navbar-toggler");
            var navbarCollapse = document.querySelector(".navbar-collapse");

            document.querySelectorAll(".page-scroll").forEach(e =>
                e.addEventListener("click", () => {
                    navbarToggler.classList.remove("active");
                    navbarCollapse.classList.remove('show')
                })
            );
            navbarToggler.addEventListener('click', function () {
                navbarToggler.classList.toggle("active");
            })
        }
    }
}
</script>

<style>
.navbar-nav .nav-item a.aw-discord {
    background-color: #7289da;
    color: white;
    padding-right: 10px;
    padding-left: 10px;
}
.sticky .navbar .navbar-nav .nav-item a.aw-discord {
    color: white;
}

.navbar-nav .nav-item a.btn.aw-discord:hover {
    background-color: white;
    color: #DA7C1C;
}

.navbar-nav .nav-item a.btn.aw-discord img {
    height: 30px;
    padding-right: 10px;
}

/*.navbar-nav .nav-item a.btn.aw-discord:hover img*/
</style>