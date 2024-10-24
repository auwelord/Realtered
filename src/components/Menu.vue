<template>
    <header class="header">
        <div class="navbar-area">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-lg-12">
                        <BNavbar toggleable="lg" :class="getClassNavbar()">
                            <!-- Navbar brand (Logo or Name) -->
                            <BNavbarBrand href="#">
                                <router-link to="/" class="navbar-brand">
                                    <img src="@/assets/img/altered/Realtereddark_tp.png" width="150" v-if="globalStore && globalStore.modesombre">
                                    <img src="@/assets/img/altered/Realtered_tp.png" width="150" v-else>
                                </router-link>
                            </BNavbarBrand>

                            <!-- Navbar toggle button (for mobile) -->
                            <BNavbarToggle target="nav-collapse"></BNavbarToggle>

                            <!-- Collapsible content (links) -->
                            <BCollapse id="nav-collapse" is-nav>
                            <BNavbarNav>
                                <BNavItem href="#" to="/cartes">{{ $t('ui.menu.cartes')}}</BNavItem>
                                <BNavItem href="#" to="/uniques">Uniques</BNavItem>
                                <BNavItem href="#" to="/tournois">{{ $t('ui.menu.tournois')}}</BNavItem>
                                <BNavItem href="#" to="/decklists">Decks</BNavItem>
                                <BNavItem href="#" to="/decktest">Test</BNavItem>
                                <BNavItem href="#" to="/deckbuilder">Deckbuilder</BNavItem>
                            </BNavbarNav>

                            <!-- Right aligned items -->
                            <BNavbarNav class="ml-auto">
                                <BDropdown split variant="light" class="me-2 aw-language"  v-if="globalStore">
                                    <template #button-content>
                                        <img :src="getImageLanguage()"/>
                                    </template>
                                    <BDropdownItem @click="e_setlanguage('fr')">
                                        <img src="@/assets/img/pays/fr.48.png" class="me-2"/>Français
                                    </BDropdownItem>
                                    <BDropdownItem @click="e_setlanguage('en')">
                                        <img src="@/assets/img/pays/en.48.png" class="me-2"/>English
                                    </BDropdownItem>
                                </BDropdown>
                                <div class="d-flex align-items-center d-block d-lg-none aw-md-modesombre" v-if="globalStore">
                                    <label class="switch">
                                        <input type="checkbox" v-model="globalStore.modesombre">
                                        <span class="slider round"></span>
                                    </label>
                                    <span class="ms-2 pb-2">{{ $t('ui.modesombre')}}</span>
                                </div>
                                <BButton @click="e_onClickConnect" variant="primary" size="sm" class="ms-2 color-white text-nowrap d-block d-lg-none" v-if="user">
                                    <img class="aw-avatar":src="user.user_metadata.avatar_url" v-if="user.user_metadata.avatar_url" />
                                    <span v-else><font-awesome-icon :icon="['fas', 'user']" class="me-2"/></span>
                                    {{ getDisplayName() }}
                                </BButton>
                                <BButton @click="e_onClickConnect" variant="primary" size="sm" class="ms-2 color-white text-nowrap" v-else>
                                    <font-awesome-icon :icon="['fas', 'right-to-bracket']" class="me-2" /> Se connecter
                                </BButton>
                                <BDropdown variant="primary" split class="aw-user d-none d-lg-block text-nowrap">
                                    <template #button-content>
                                        <span v-if="user" class="color-white text-nowrap" @click="e_onClickConnect">
                                            <img class="aw-avatar":src="user.user_metadata.avatar_url" v-if="user.user_metadata.avatar_url" />
                                            <span v-else><font-awesome-icon :icon="['fas', 'user']" class="me-2"/></span>
                                            {{ getDisplayName() }}
                                        </span>
                                        <span v-else @click="e_onClickConnect"><font-awesome-icon :icon="['fas', 'right-to-bracket']" class="me-2" /> Se connecter</span>
                                    </template>
                                    <BDropdownItem v-if="globalStore" >
                                        <div class="d-flex align-items-center">
                                            <span class="me-2 pb-1">{{ $t('ui.modesombre')}}</span>
                                            <label class="switch mt-2">
                                                <input type="checkbox" v-model="globalStore.modesombre">
                                                <span class="slider round"></span>
                                            </label>
                                        </div>
                                    </BDropdownItem>
                                </BDropdown>
                            </BNavbarNav>
                            </BCollapse>
                        </BNavbar>
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
        getClassNavbar(){
            return this.globalStore && this.globalStore.modesombre ? 'navbar-dark' : 'navbar-light'
        },
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
        getImageLanguage()
        {
            return 'src/assets/img/pays/' + this.globalStore.language + '.48.png'
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
@media (max-width: 992px) {
    #nav-collapse.show .aw-language
    {
        margin-left: 5px;
        margin-bottom: 10px;
        margin-top: 15px;
    }
    #nav-collapse.show .aw-user {
        margin-left: 5px;
    }
    .aw-md-modesombre
    {
        margin-left: 5px;
    }
}
.aw-language
{
    width: 100px;
}
.aw-language img
{
    width: 25px;
}
.aw-avatar{
    width: 22px;
}
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
.navbar-toggler{
    transition: all 0.3s;    
    margin-right: 15px;
    transform: rotate(0deg);
}
.navbar-toggler.not-collapsed{
    transition: all 0.3s;    
    transform: rotate(90deg);
}
</style>

<style lang="scss">
  @import "/src/assets/scss/darkmode.scss";
</style>