<template>
    <div class="aw-wrapper">

        <div v-if="erreurdeckid" class="d-flex justify-content-center">
            <img src="@/assets/img/empty.png" v-if="!decks || decks.length == 0"/>
        </div>

        <img src="@/assets/img/collectionfond.png" class="aw-fond" v-if="!afficherstats"/>

        <div class="container-fluid pt-2" v-if="!erreurdeckid"> <!--begin::Row-->
            <div class="row">
                <div :class="['col-lg-4 col-12 aw-colleft', afficherstats ? 'aw-deckliststat' : '']" v-if="!fullscreen">
                    <div :class="['aw-imgapercu', showImageFullsize ? 'aw-imageapon' : '']">
                        <div class="aw-imgapercustick">
                            <img :src="g_getImageApercu(imagePathFullsize)" alt="" class="img-fluid aw-alteredcard" />
                        </div>
                    </div>
                    <div class="card card-outline card-info mb-1" v-if="!afficherstats">
                        <div class="card-body">
                            <div class="card-group justify-content-between aw-factionsel">
                                <a href="#" id="AX" :class="['mb-2 aw-axiom', g_isCodeAxiom(currentFaction) ? 'aw-selected' : '']"
                                    @click="changeFaction"><img src="@/assets/img/altered/factions/axiom.webp"
                                        class="aw-faction" /></a>
                                <a href="#" id="BR" :class="['mb-2 aw-bravos', g_isCodeBravos(currentFaction) ? 'aw-selected' : '']"
                                    @click="changeFaction"><img src="@/assets/img/altered/factions/bravos.webp"
                                        class="aw-faction" /></a>
                                <a href="#" id="LY" :class="['mb-2 aw-lyra', g_isCodeLyra(currentFaction) ? 'aw-selected' : '']"
                                    @click="changeFaction"><img src="@/assets/img/altered/factions/lyra.webp"
                                        class="aw-faction" /></a>
                                <a href="#" id="MU" :class="['mb-2 aw-muna', g_isCodeMuna(currentFaction) ? 'aw-selected' : '']"
                                    @click="changeFaction"><img src="@/assets/img/altered/factions/muna.webp"
                                        class="aw-faction" /></a>
                                <a href="#" id="OR" :class="['mb-2 aw-ordis', g_isCodeOrdis(currentFaction) ? 'aw-selected' : '']"
                                    @click="changeFaction"><img src="@/assets/img/altered/factions/ordis.webp"
                                        class="aw-faction" /></a>
                                <a href="#" id="YZ" :class="['mb-2 aw-yzmir', g_isCodeYzmir(currentFaction) ? 'aw-selected' : '']"
                                    @click="changeFaction"><img src="@/assets/img/altered/factions/yzmir.webp"
                                        class="aw-faction" /></a>
                            </div>
                            {{$t('ui.lib.hero')}}
                            <Multiselect v-model="currenthero"
                                :options="heroes"
                                :close-on-select="true" 
                                :searchable="true"
                                />

                            <BFormCheckbox v-model="mesdecksonly" class="ms-1 mt-2">{{$t('ui.lib.onmymydeck')}}</BFormCheckbox>
                            <BFormCheckbox v-model="mesfavorisonly" class="ms-1">{{$t('ui.lib.onmyfav')}}</BFormCheckbox>

                            <div :class="['mt-2 aw-decks', decks && decks.length > 0 ? '' : 'd-flex justify-content-center']">
                                <img src="@/assets/img/empty.png" v-if="!decks || decks.length == 0"/>
                                <BListGroup>
                                    <BListGroupItem @click="onShowDeck(deck)" v-for="deck in decks" :class="['aw-deck', getClassDeck(deck)]" :id="'deck' + deck.id">
                                        
                                        <div class="d-flex justify-content-between">
                                            <div class="d-flex justify-content-start align-items-center">
                                                <img :src="getDeckFactionImage(deck)" class="aw-deckimg me-2" />
                                                <div>
                                                    <div class="d-flex justify-content-start align-items-center">                                                    
                                                        <div class="aw-deckname">{{ deck.name }}</div>
                                                        <font-awesome-icon :icon="['fas', 'lock']" class="ms-2" v-if="!deck.public"/>
                                                        <font-awesome-icon :icon="['fas', 'heart']" class="ms-2" style="color: red" v-if="deck.favori" />
                                                    </div>
                                                    <div class="fs-8">(version {{ deck.version }})</div>
                                                </div>
                                            </div>
                                            <div class="d-flex flex-column justify-content-end align-items-end">
                                                <div><span v-if="deck.hero">{{ deck.hero.name }}</span><span :class="['ms-2 badge', deck.valide ? 'bg-success':'bg-danger']">{{(deck.valide ? '': 'Non ') + 'Légal'}}</span> </div>
                                                <div><i class="fs-8">{{ getDateDeckFormatee(deck) }}</i></div>
                                            </div>
                                        </div>
                                    </BListGroupItem>
                                </BListGroup>
                            </div>
                            <div class="mt-2 d-flex">
                                <BButton @click="onPreviousDecks" variant="uniqued2" size="sm" class="flex-fill me-2 fs-4" :title="$t('ui.lib.previousdecks')" v-visible="currentpage > 1">
                                    <font-awesome-icon :icon="['fas', 'left-long']" />
                                </BButton>
                                <BButton @click="onNextDecks" variant="uniqued2" size="sm" class="flex-fill ms-2 fs-4" :title="$t('ui.lib.nextdecks')" v-visible="hasnextdeck">
                                    <font-awesome-icon :icon="['fas', 'right-long']" />
                                </BButton>
                            </div>
                        </div>
                    </div>

                    
                    <DeckStats v-if="currentdeck && afficherstats" :currentDeck="currentdeck" />
                </div>

                <div class="col-lg-8 col-12" v-if="isDecklist() && currentdeck">
                    <Decklists :user="user" :currentdeck="currentdeck" :deckid="deckid"
                        @mouseentercard="mouseEnterCard" 
                        @mouseleavecard="mouseLeaveCard"
                        @onafficherstat="pafficher => afficherstats = pafficher"/>
                </div>

                <Decktest :user="user" :currentdeck="currentdeck" v-if="isDeckTest() && currentdeck" 
                    @mouseentercard="mouseEnterCard" 
                    @mouseleavecard="mouseLeaveCard"
                    @togglefullscreen="togglefullscreen" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { watch, onMounted, getCurrentInstance } from 'vue'
import { useHead } from '@vueuse/head';
import { useRoute } from 'vue-router';

const props = defineProps({
    deckid: { 
        type: Number,
        default: 0,     // Valeur par défaut (facultatif)
        validator: (value) => Number.isInteger(value)  // Vérifier que la valeur est un entier
    },
    user: { type: Object },
    typeui: { type: String, default: 'decklist' },
});
const route = useRoute();
const instance = getCurrentInstance();
instance.proxy.currentdeck = null


watch(() => props.user, async (newUser, oldUser) => {
    if (!newUser) {
        instance.proxy.loadDecks();
    }
})
watch(() => route.params.deckid, (newId) => {
    if(newId === undefined)
    {
        window.location.reload()
    }
});

useHead({
    title: 'Realtered',
    meta: [
        { property: 'og:title', content: 'Realtered' },
        { property: 'og:description', content: 'Realtered: deckbuilder by Auwelord' },
        { property: 'og:image', content: 'https://fyqptmokmnymednlerpj.supabase.co/storage/v1/object/public/Altered/assets/logos/Realtered.png' },
        { property: 'og:url', content: window.location.href },
        { property: 'og:type', content: 'article' }
    ]
})

onMounted(async () => {
    
    if(props.deckid)
    {
        instance.proxy.onShowDeck(null, pdeck => {
            useHead({
                title: 'Realtered : ' + pdeck.name,
                meta: [
                    { property: 'og:title', content: instance.proxy.getOgTitle() },
                    { property: 'og:description', content: instance.proxy.getOgDescription() },
                    { property: 'og:image', content: instance.proxy.getOgImage() },
                    { property: 'og:url', content: window.location.href },
                    { property: 'og:type', content: 'article' }
                ]
            });
        });
    }
})
</script>

<script>
import { useToast, TYPE } from "vue-toastification";
import { useHead } from '@vueuse/head';

const toast = useToast();

export default
    {
        data() {
            return {
                currentFaction: null,
                decks: null,
                mesdecksonly: false,
                mesfavorisonly: false,
                currentdeck: null,
                afficherstats: false,
                ipp: 10,
                currentpage: 1,
                hasnextdeck: false,
                heroes: null,
                currenthero: null,
                erreurdeckid: false,
                imagePathFullsize: null,
                showImageFullsize: false,
                mousetimeout: null,
                fullscreen: false,
            }
        },
        mounted() 
        {
            if(!this.deckid)
            {
                this.alimListeHeroes()
            }
            else
            {
                /*
                this.onShowDeck(null, pdeck => {
                    console.log(pdeck)
                })
                    */
                this.afficherstats = true
            }
        },
        watch:{
            // Watcher for 'message'
            mesdecksonly(newValue, oldValue) {
                this.resetDecks();
            },
            mesfavorisonly(newValue, oldValue) {
                this.resetDecks();
            },
            currenthero(newValue, oldValue) {
                this.resetDecks();
            },
        },
        methods:
        {
            isDecklist(){
                return this.typeui == 'decklist'
            },
            isDeckTest(){
                return this.typeui == 'decktest'
            },
            getClassDeck(pdeck)
            {
                return this.currentdeck && this.currentdeck.id == pdeck.id ? 'active' : ''
            },
            mouseEnterCard(pcard)
            {
                if(this.mousetimeout) clearTimeout(this.mousetimeout)
                this.imagePathFullsize = this.g_getImageCardPublicUrl(pcard)
                this.showImageFullsize = true
            },
            mouseLeaveCard(pcard)
            {
                this.mousetimeout = setTimeout(() => {
                    if(this.mousetimeout) this.showImageFullsize = false
                }, 200)
            },
            togglefullscreen(pfullscreen)
            {
                this.fullscreen = pfullscreen
            },
            alimListeHeroes()
            {
                this.currenthero = null
                this.g_fetchHeroes({
                    faction: this.currentFaction,
                    callback: pheroes => 
                    {
                        this.heroes = pheroes.map(hero => { 
                            return {
                                value: hero.reference, 
                                label: hero.name
                            };
                        });
                        this.heroes.sort((a,b) => a.label.localeCompare(b.label));
                    }
                });
        
                this.resetDecks()
            },
            getDateDeckFormatee(pdeck){
                const date = new Date(pdeck.modifiedAt);
                const formatter = new Intl.DateTimeFormat('fr-FR', {
                //weekday: 'long', // Jour de la semaine (optionnel)
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                });
                return formatter.format(date);
            },
            onShowDeck(pdeck, pcallback) 
            {
                this.setCurrentDeck(null)

                var zedeckid = pdeck ? pdeck.id : this.deckid

                var params = {
                    id: zedeckid,
                    withcards: true,
                    withfavs: true,
                }
                this.g_fetchDeck(params, pdeck => 
                {
                    if(this.deckid && !pdeck) this.erreurdeckid = true
                    else if(!this.deckid || !pdeck || pdeck.public) 
                    {
                        this.setCurrentDeck(pdeck)
                        if(pcallback) pcallback(pdeck)
                    }
                    else this.g_isOwerDeck({
                        deck: pdeck,
                        callback: isowner => 
                        {
                            //le deck n'est pas public, il faut vérifier si l'user est connecté et possesseur du deck
                            //this.setCurrentDeck(isowner ? pdeck : null)
                            this.erreurdeckid = !isowner
                            if(isowner) {
                                this.setCurrentDeck(pdeck)
                                if(pcallback) pcallback(pdeck)
                            }
                        }
                    })
                })
            },
            setCurrentDeck(pdeck)
            {
                this.currentdeck = pdeck
                this.g_sortDeck(this.currentdeck)
            },
            getDeckFactionImage(pdeck) {
                return 'https://fyqptmokmnymednlerpj.supabase.co/storage/v1/object/public/Altered/assets/icons/' + this.g_getFactionName(pdeck.main_faction, true) + '.png'
            },
            resetDecks()
            {
                this.currentpage = 1
                this.loadDecks()
            },
            onPreviousDecks()
            {
                this.currentpage--;
                this.loadDecks()
            },
            onNextDecks()
            {
                this.currentpage++;
                this.loadDecks()
            },
            loadDecks() {
                //this.currentdeck = null
                var params = {
                    myonly: this.mesdecksonly,
                    favonly: this.mesfavorisonly,
                    faction: this.currentFaction,
                    hero: this.currenthero,
                    withhero: true,
                    page: this.currentpage,
                    ipp: this.ipp,
                    withfavs: true,
                    callback: pdecks => {
                        this.decks = pdecks
                        this.hasnextdeck = params.hasnext
                    }
                }
                this.g_fetchDecks(params)
            },
            changeFaction(event) {
                var $target = $(event.target);
                var $a = $target.is("a") ? $target : $target.parents("a:first");

                $(".aw-factionsel a").each(function () {
                    $(this).removeClass("aw-selected");
                });

                var attr = $a.attr("id")
                if (attr != this.currentFaction) {
                    this.currentFaction = attr;
                    $a.addClass("aw-selected")
                }
                else this.currentFaction = null;

                //reload des decks directement

                this.alimListeHeroes()
            },
            getOgTitle(){
                return 'Realtered : ' + this.deckid ? this.currentdeck.name + ' (' + this.currentdeck.hero.name + ')' : 'liste des decks'
            },         
            getOgDescription(){
                return this.deckid ? 'Realtered Decklist : ' + this.currentdeck.name : ''
            },
            getOgImage(){
                return this.deckid ? this.g_getImageBanner(this.currentdeck.hero) : this.g_getImageLogo()
            }
        },
    }
</script>

<style scope>
.aw-decks .aw-deck {
    cursor: pointer;
}

.aw-decks .aw-deckimg {
    max-width: 30px;
}

.aw-deck.aw-private .aw-privateico {
    display: block !important;
}

.aw-colleft.aw-imageapon
{
    /*
    padding-left: 20px !important;
    padding-right: 20px !important;
    */
}
.aw-colleft.aw-imageapon .aw-imgapercu img {
    margin-top: 0;
    width: calc(0.20 * 100vw);
}

@media (max-width: 1199px) {
    .aw-colleft.aw-imageapon .aw-imgapercu img {
        display: none;
    }
}
</style>