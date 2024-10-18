<template>
    <header class="header">
        <div class="navbar-area">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-lg-12">
                        <nav class="navbar navbar-expand-lg fixed-top">
                            <router-link to="/" class="navbar-brand">
                                <img src="@/assets/img/altered/Realtereddark_tp.png" width="150" v-if="globalStore && globalStore.modesombre">
                                <img src="@/assets/img/altered/Realtered_tp.png" width="150" v-else>
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
                                        <router-link to="/" class="page-scroll" href="#">{{ $t('ui.menu.accueil')}}</router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link to="/cartes" class="page-scroll" href="#">{{ $t('ui.menu.cartes')}}</router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link to="/uniques" class="page-scroll" href="#">Uniques</router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link to="/tournois" class="page-scroll" href="#">{{ $t('ui.menu.tournois')}}</router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link to="/decklists" class="page-scroll" href="#">Decks</router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link to="/decktest" class="page-scroll" href="#">Test</router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link to="/deckbuilder" class="page-scroll" href="#">Deckbuilder</router-link>
                                    </li>
                                    <li class="nav-item d-flex align-items-center" v-if="globalStore">
                                        <BDropdown size="sm" split variant="primary" class="me-2">
                                            <template #button-content>
                                                <font-awesome-icon :icon="['fas', 'language']" class="me-2"/>{{ getLanguage() }}
                                            </template>
                                            <BDropdownItem @click="e_setlanguage('fr')">
                                                Français
                                            </BDropdownItem>
                                            <BDropdownItem @click="e_setlanguage('en')">
                                                English
                                            </BDropdownItem>
                                        </BDropdown>
                                    </li>
                                    <li class="nav-item d-flex align-items-center" v-if="globalStore">
                                        <span class="me-2 pb-1">{{ $t('ui.modesombre')}}</span>
                                        <label class="switch me-2">
                                        <input type="checkbox" v-model="globalStore.modesombre">
                                        <span class="slider round"></span>
                                        </label>
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
import LogoAltered from '@/components/icons/LogoAltered.vue'
import { useGlobalStore } from '@/stores/global'

export default {
    props: {
        user: {
            type: Object,
            required: false
        }
    },
    data() {
        return {
            modalDisconnect: false,
            okdisc: "Se déconnecter",
            globalStore: null
        }
    },
    components: {
        LogoAltered
    },
    watch: {
        'globalStore.modesombre'(newval, oldval){
            this.onChangeModeSombre()
        },
        'globalStore.language'(newval, oldval){
            this.$i18n.locale = newval;
        }
    },
    methods: {
        e_setlanguage(plangue)
        {
            this.globalStore.language = plangue
        },
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
        },
        onChangeModeSombre()
        {
            var $body = $('body')
            
            if(this.globalStore.modesombre && !$body.hasClass('aw-darkmode')) $body.addClass('aw-darkmode')
            else if(!this.globalStore.modesombre) $body.removeClass('aw-darkmode')
        },
        getLanguage()
        {
            if(this.globalStore.language == 'fr') return 'Français'
            return 'English'
        }
    },
    mounted() 
    {
        this.globalStore = useGlobalStore();
        this.onChangeModeSombre()
        this.$i18n.locale = this.globalStore.language;

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
</style>

<style lang="scss">
  @import "/src/assets/scss/darkmode.scss";
</style>