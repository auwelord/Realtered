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
                                        <a @click="e_onClickConnect" class="btn aw-discord">
                                            <span v-if="user">
                                                <img :src="user.user_metadata.avatar_url" v-if="user.user_metadata.avatar_url" />
                                                <span v-else><font-awesome-icon :icon="['fas', 'user']" class="me-2"/></span>
                                                {{ getDisplayName() }}
                                            </span>
                                            <span v-else><font-awesome-icon :icon="['fas', 'right-to-bracket']" class="me-2" /> Se connecter</span>
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

    <BModal v-model="modalDisconnect" @ok="e_deconnecter" centered cancel-title="Annuler" ok-title="Se déconnecter" ok-variant="danger" title="Se déconnecter">
        Etes-vous sûr de vouloir vous déconnecter ? 
    </BModal>

    <BModal v-model="modalConnect" centered hide-footer title="Se connecter">
        <div v-if="!creatingCompte">
            <div class="d-flex justify-content-end align-items-center">
                <span class="me-3">Se connecter par discord </span>
                <BButton variant="primary" @click="e_connecterDiscord"><font-awesome-icon :icon="['fab', 'discord']" class="me-2" />Connecter</BButton>
            </div>

            <hr>
        </div>

        <BForm @submit.prevent="e_connecter">
            <BFormFloatingLabel label="E-mail">
                <BFormInput placeholder="E-mail" v-model="fUserMail" :required="true" id="awid-fUserMail" autocomplete="username"/>
            </BFormFloatingLabel>

            <BFormFloatingLabel label="Nom" class="mt-3" v-if="creatingCompte">
                <BFormInput placeholder="Nom" v-model="fUserName" :required="true" />
            </BFormFloatingLabel>

            <BFormFloatingLabel label="Mot de passe" class="mt-3" v-if="!creatingCompte">
                <BFormInput type="password" placeholder="Mot de passe" v-model="fUserPwd" :required="true" autocomplete="current-password" id="current-password"/>
            </BFormFloatingLabel>

            <BFormFloatingLabel label="Mot de passe" class="mt-3" v-if="creatingCompte">
                <BFormInput type="password" placeholder="Mot de passe" v-model="fUserNewPwd" :required="true" autocomplete="new-password" id="new-password"/>
            </BFormFloatingLabel>

            <BFormFloatingLabel label="Confirmation du mot de passe" class="mt-3" v-if="creatingCompte">
                <BFormInput type="password" placeholder="Confirmation du mot de passe" v-model="fUserNewPwdConfirm" :required="true" autocomplete="new-password" id="new-password-confirm"/>
            </BFormFloatingLabel>
            
            <div class="d-flex justify-content-between mt-3">
                <div><BButton variant="info" @click="e_showCreerCompte" v-if="!creatingCompte">Créer un compte</BButton></div>
                <div class="d-flex justify-content-end">
                <BButton variant="light" @click="e_annulerConnexion">{{$t('ui.action.annuler')}}</BButton>
                <BButton variant="primary" @click="e_connecter" class="ms-2">Connecter</BButton>
                </div>
            </div>
        </BForm>
    </BModal>

    <BModal v-model="modalConfirmInscription" centered hide-footer title="Compte créé">
        <div class="fs-4">Merci {{ nameConfirmation }} pour ton inscription !</div>
        <hr>
        <div class="fs-6 font-italic">Tu dois valider ton compte en cliquant sur lien présent dans le mail envoyé à l'adresse {{ mailConfirmation }}</div>
    </BModal>

</template>

<script setup>
const emit = defineEmits(['deconnect', 'connect']);

const e_deconnecter = () => {
  emit('deconnect');
}
</script>

<script>
import LogoAltered from '@/components/icons/LogoAltered.vue'
import { useGlobalStore } from '@/stores/global'
import { useToast, TYPE } from "vue-toastification"
import { anonCreateClient } from '@/assets/js/supabase'
const anonSupabase = anonCreateClient()
const toast = useToast();
export default {
    props: {
        user: {
            type: Object,
            required: false
        }
    },
    data() {
        return {
            fUserName: '',
            fUserPwd: '',
            fUserNewPwd: '',
            fUserNewPwdConfirm: '',
            fUserMail: '',
            modalConfirmInscription: false,
            mailConfirmation: '',
            nameConfirmation: '',
            modalDisconnect: false,
            modalConnect: false,
            creatingCompte: false,
            okdisc: "Se déconnecter",
            globalStore: null,
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
        e_annulerConnexion()
        {
            if(this.creatingCompte) this.creatingCompte = false
            else this.modalConnect = false
        },
        e_showCreerCompte()
        {
            this.fUserName = ''
            this.fUserNewPwd = ''
            this.fUserNewPwdConfirm = ''
            this.creatingCompte = true
            setTimeout(() => $("#awid-fUserMail").trigger('select'), 200)
        },
        e_onClickConnect()
        {
            if(!this.user)
            {
                this.fUserMail = ''
                this.fUserPwd = ''
                this.creatingCompte = false
                this.modalConnect = true
                setTimeout(() => $("#awid-fUserMail").trigger('select'), 200)
                return
            }

            this.modalDisconnect = true
        },
        getDisplayName()
        {
            if(!this.user) return ''

            if(this.user.app_metadata.provider == 'discord') return this.user.user_metadata.custom_claims.global_name
            return this.user.user_metadata.display_name
        },
        e_setlanguage(plangue)
        {
            this.globalStore.language = plangue
        },
        async signUpNewUser() 
        {
            try{
                const { data, error } = await anonSupabase.auth.signUp({
                    email: this.fUserMail,
                    password: this.fUserNewPwd,
                    options: {
                        emailRedirectTo: import.meta.env.VITE_APP_BASE_URL + this.$route.path,
                        data: {
                            display_name: this.fUserName,
                        },
                    },
                })
                if(!error)
                {
                    this.modalConnect = false

                    if(data.user != null && data.session == null)
                    {
                        this.mailConfirmation = this.fUserMail
                        this.nameConfirmation = this.fUserName
                        this.modalConfirmInscription = true
                    }
                    this.$emit('connect')
                    return
                }
                
                if(error.name == 'AuthWeakPasswordError' || (error.name == 'AuthApiError' && error.status == 400))
                {
                    toast(error.message, { type: TYPE.ERROR })
                    return
                }
            }
            catch(error)
            {
                //RAS
            }

            toast("Une erreur s'est produite lors de la création du compte", { type: TYPE.ERROR })
        },
        async signInUser() 
        {
            const { data, error } = await anonSupabase.auth.signInWithPassword({
                email: this.fUserMail,
                password: this.fUserPwd,
            })

            if(error)
            {
                if(error.code == 'email_not_confirmed') toast(error.message, { type: TYPE.ERROR })
                else toast("Echec de la connexion", { type: TYPE.ERROR })
                return
            }
            this.modalConnect = false
            this.$emit('connect')
        },
        e_connecter() 
        {
            if(this.creatingCompte)
            {
                if(this.fUserNewPwd != this.fUserNewPwdConfirm)
                {
                    toast('Le mot de passe et sa confirmation ne correspondent pas', { type: TYPE.ERROR })
                    return
                }
                this.signUpNewUser()
                return
            }
            this.signInUser()
        },
        e_connecterDiscord() 
        {
            this.g_connectUserDiscord(this.$route.path)
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