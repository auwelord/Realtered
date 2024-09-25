<template>
    <div class="aw-wrapper">

        <div v-if="erreurdeckid" class="d-flex justify-content-center">
            <img src="@/assets/img/empty.png" v-if="!decks || decks.length == 0"/>
        </div>

        <img src="@/assets/img/collectionfond.png" class="aw-fond" v-if="!afficherstats && !imagePathFullsize"/>

        <div class="container-fluid pt-2" v-if="!erreurdeckid"> <!--begin::Row-->
            <div class="row">
                <div :class="['col-lg-4 col-12 aw-colleft', afficherstats ? 'aw-deckliststat' : '']">
                    <div class="card card-outline card-info mb-1" v-if="!afficherstats && !imagePathFullsize">
                        <div class="card-body">
                            <div class="card-group justify-content-between aw-factionsel">
                                <a href="#" id="AX" :class="['mb-2 aw-axiom', isCurrentAxiom() ? 'aw-selected' : '']"
                                    @click="changeFaction"><img src="@/assets/img/altered/factions/axiom.webp"
                                        class="aw-faction" /></a>
                                <a href="#" id="BR" :class="['mb-2 aw-bravos', isCurrentBravos() ? 'aw-selected' : '']"
                                    @click="changeFaction"><img src="@/assets/img/altered/factions/bravos.webp"
                                        class="aw-faction" /></a>
                                <a href="#" id="LY" :class="['mb-2 aw-lyra', isCurrentLyra() ? 'aw-selected' : '']"
                                    @click="changeFaction"><img src="@/assets/img/altered/factions/lyra.webp"
                                        class="aw-faction" /></a>
                                <a href="#" id="MU" :class="['mb-2 aw-muna', isCurrentMuna() ? 'aw-selected' : '']"
                                    @click="changeFaction"><img src="@/assets/img/altered/factions/muna.webp"
                                        class="aw-faction" /></a>
                                <a href="#" id="OR" :class="['mb-2 aw-ordis', isCurrentOrdis() ? 'aw-selected' : '']"
                                    @click="changeFaction"><img src="@/assets/img/altered/factions/ordis.webp"
                                        class="aw-faction" /></a>
                                <a href="#" id="YZ" :class="['mb-2 aw-yzmir', isCurrentYzmir() ? 'aw-selected' : '']"
                                    @click="changeFaction"><img src="@/assets/img/altered/factions/yzmir.webp"
                                        class="aw-faction" /></a>
                            </div>
                            Héro / Héroïne
                            <Multiselect v-model="currenthero"
                                :options="heroes"
                                :close-on-select="true" 
                                :searchable="true"
                                />

                            <BFormCheckbox v-model="mesdecksonly" class="ms-1 mt-2">Mes decks uniquement</BFormCheckbox>
                            <BFormCheckbox v-model="mesfavorisonly" class="ms-1">Mes favoris uniquement</BFormCheckbox>

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
                                <BButton @click="onPreviousDecks" variant="uniqued2" size="sm" class="flex-fill me-2 fs-4" title="Decks précédents" v-visible="currentpage > 1">
                                    <font-awesome-icon :icon="['fas', 'left-long']" />
                                </BButton>
                                <BButton @click="onNextDecks" variant="uniqued2" size="sm" class="flex-fill ms-2 fs-4" title="Decks suivants" v-visible="hasnextdeck">
                                    <font-awesome-icon :icon="['fas', 'right-long']" />
                                </BButton>
                            </div>
                        </div>
                    </div>

                    <div :class="['aw-imgapercu', imagePathFullsize ? 'aw-imageapon' : '']">
                        <div class="sticky">
                            <img :src="imagePathFullsize" alt="" class="img-fluid aw-alteredcard" />
                        </div>
                    </div>
                    <DeckStats v-if="currentdeck && afficherstats && !imagePathFullsize" :currentDeck="currentdeck" />
                </div>
                <div class="col-lg-8 col-12">
                    <div class="col-12 d-flex flex-column align-items-center" v-if="!currentdeck">
                        <div class="fs-4">Sélectionnez un deck pour voir la decklist</div>
                        <img src="/src/assets/img/empty.png" alt="" class="mt-5" style="width: 300px" />
                    </div>
                    <div v-else :class="['card aw-carddeck', getCurrentDeckCssClass()]">
                        <div class="card-header">
                            <div class="ribbon-wrapper ribbon-lg">
                                <div :class="['ribbon text-white', currentdeck.valide ? 'bg-success' : 'bg-danger']">
                                {{ currentdeck.valide ? 'Légal' : 'Non Légal'}}
                                </div>
                            </div>
                            <div class="d-flex justify-content-between">
                                <div class="d-flex flex-column justify-content-between">
                                    <div>
                                        <div class="aw-titledeck">
                                            <span class="fs-3">{{currentdeck.name}} </span><span class="fs-7 ms-3">(v{{currentdeck.version}})</span>
                                        </div>
                                        <br>
                                        <div class="aw-titlehero fs-7">{{currentdeck.hero.name}} </div>
                                        
                                        <div class="d-flex mt-2">
                                            <div class="d-flex flex-column align-items-center me-4">
                                                {{ g_getTotalPersosInDeck({deck: currentdeck}) }}
                                                <font-awesome-icon :icon="['fas', 'person-walking']" class="fs-6" />
                                            </div>
                                            <div class="d-flex flex-column align-items-center me-4">
                                                {{ g_getTotalSortsInDeck({deck: currentdeck}) }}
                                                <font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" class="fs-6" />
                                            </div>
                                            <div class="d-flex flex-column align-items-center">
                                                {{ g_getTotalPermasInDeck({deck: currentdeck}) }}
                                                <font-awesome-icon :icon="['fas', 'building-shield']" class="fs-6" />
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="!deckid" class="mt-4">
                                        <label class="switch me-2">
                                            <input type="checkbox" v-model="afficherstats">
                                            <span class="slider round"></span>
                                        </label> Voir les statistiques
                                    </div>
                                    
                                    <div class="mt-2">
                                    <BButton @click="onImporterDeck" variant="unique" size="sm" title="importer le deck">
                                        <font-awesome-icon :icon="['fas', 'right-long']" class="me-2"/>Importer
                                    </BButton>

                                    <BButton @click="onCopierLienDeck" variant="uniqued2" size="sm" title="Copier le lien" class="ms-2">
                                        <font-awesome-icon :icon="['fab', 'threads']" class="me-2" />Copier le lien
                                    </BButton>

                                    <BButton @click="onToggleFavoris" variant="white" size="sm" class="ms-2" v-if="user">
                                        <font-awesome-icon :icon="['fas', 'heart']" style="color: red" v-if="currentdeck.favori" />
                                        <font-awesome-icon :icon="['fas', 'heart']" v-else />
                                    </BButton>                                    
                                    </div>

                                    <div class="mt-2">
                                        Description <font-awesome-icon v-b-toggle.awid-descdeck :icon="['fas', 'chevron-right']" class="text-white aw-arrowcollapse" /> 
                                    </div>

                                </div>
                                <img :src="g_getImageBanner(currentdeck.hero)" />
                            </div>
                        </div>
                        <div class="card-body">
                            <BCollapse id="awid-descdeck">
                                <div class="col-12 mt-4" v-html="getFormattedDescriptionCurrentDeck()"></div>
                            </BCollapse>                        
                            <div class="row">
                                <template v-for="card in currentdeck.cards">
                                    <div class="col-12 col-lg-4 col-xl-3 col-xxl-2 aw-decklistcard" v-if="!g_isHero(card)" @mouseenter="mouseEnterCard(card)" @mouseleave="mouseLeaveCard(card)">
                                        <img v-for="index in card.quantite" :src="g_getImageCardPublicUrl(card)"
                                            :title="card.name" class="img-fluid aw-alteredcard" />
                                    </div>
                                </template>
                            </div>
                        </div>                        
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { watch, onMounted, getCurrentInstance } from 'vue'
import { useHead } from '@vueuse/head';
import { useRoute } from 'vue-router';
import MarkdownIt from "markdown-it";

const props = defineProps({
    deckid: { 
        type: Number,
        default: 0,     // Valeur par défaut (facultatif)
        validator: (value) => Number.isInteger(value)  // Vérifier que la valeur est un entier
    },
    user: { type: Object }
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
                mousetimeout: null,
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
            imagePathFullsize(newValue, oldValue) {
                if(newValue)
                {
                    setTimeout(() => $('.aw-colleft').addClass('aw-imageapon'), 10)
                }
                else
                {
                    setTimeout(() => $('.aw-colleft').removeClass('aw-imageapon'), 10)
                }
            },
        },
        methods:
        {
            getClassDeck(pdeck)
            {
                return this.currentdeck && this.currentdeck.id == pdeck.id ? 'active' : ''
            },
            getFormattedDescriptionCurrentDeck()
            {
                const markdown = new MarkdownIt();
                return markdown.render(this.currentdeck.description)
            },
            mouseEnterCard(pcard)
            {
                clearTimeout(this.mousetimeout)
                this.imagePathFullsize = this.g_getImageCardPublicUrl(pcard)
            },
            mouseLeaveCard(pcard)
            {
                this.mousetimeout = setTimeout(() => {
                    if(this.mousetimeout)this.imagePathFullsize = null
                }, 200)
            },
            onToggleFavoris(){
                this.g_toggleDeckFavori(this.currentdeck, pfavori => 
                {
                    this.currentdeck.favori = pfavori

                    if(this.decks)
                    {
                        for(let deck of this.decks)
                        {
                            if(deck.id == this.currentdeck.id) deck.favori = this.currentdeck.favori
                        }
                    }
                })
            },
            onCopierLienDeck()
            {
                if(this.deckid)
                {
                    navigator.clipboard.writeText(window.location.href)
                }
                else
                {
                    var link = window.location.href + (window.location.href.endsWith('/') ? '' : '/')
                    navigator.clipboard.writeText(link + this.currentdeck.id)
                }

                toast("Le lien vers ce deck a été copié dans le presse-papier", { type: TYPE.SUCCESS });
            },
            onImporterDeck()
            {
                this.g_importDeck({deck: this.currentdeck}, 
                    //onImportedDeck: 
                    pdeck => 
                    {
                        if(pdeck) toast("Deck importé !", { type: TYPE.SUCCESS })
                        else toast("Une erreur s'est produite", { type: TYPE.ERROR })
                    }
                )
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
                if(this.currentdeck)
                {
                    this.currentdeck.cards.sort((a, b) => {
                        if(this.g_isUnique(a) && !this.g_isUnique(b)) return -1;
                        if(!this.g_isUnique(a) && this.g_isUnique(b)) return 1;

                        //deja trié via la requete, si meme type, on garde le tri d'origine
                        if (a.cardType == b.cardType)
                        {
                            if(a.mainCost != b.mainCost) return a.mainCost < b.mainCost ? -1 : 1
                            if(a.recallCost != b.recallCost) return a.recallCost < b.recallCost ? -1 : 1
                            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                        }

                        if (this.g_isPersonnage(a)) return -1;
                        if (this.g_isPermanent(a)) return 1;
                        if (this.g_isPersonnage(b)) return 1;
                        if (this.g_isPermanent(b)) return -1;
                    });
                }
            },
            getDeckFactionImage(pdeck) {
                return 'https://fyqptmokmnymednlerpj.supabase.co/storage/v1/object/public/Altered/assets/icons/' + this.g_getFactionName(pdeck.main_faction, true) + '.png'
            },
            getCurrentDeckCssClass()
            {
                return this.currentdeck ? "aw-currentdeck" + this.currentdeck.main_faction : ''
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
            isCurrentAxiom() {
                return this.currentFaction == "AX";
            },
            isCurrentBravos() {
                return this.currentFaction == "BR";
            },
            isCurrentLyra() {
                return this.currentFaction == "LY";
            },
            isCurrentMuna() {
                return this.currentFaction == "MU";
            },
            isCurrentOrdis() {
                return this.currentFaction == "OR";
            },
            isCurrentYzmir() {
                return this.currentFaction == "YZ";
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

.aw-deckliststat
{
    padding-left: 4% !important;
    padding-right: 4% !important;
}
.aw-titledeck
{
    padding-bottom: 4px;
    border-bottom: 1px solid white;
}
.aw-titlehero
{
    margin-top: -15px;
}
.aw-carddeck .card-header
{
    color: white;
    min-height: 150px;
}
.aw-carddeck.aw-currentdeckAX .card-header
{
    background-color: var(--c-axiom);
}
.aw-carddeck.aw-currentdeckBR .card-header
{
    background-color: var(--c-bravos);
}
.aw-carddeck.aw-currentdeckLY .card-header
{
    background-color: var(--c-lyra);
}
.aw-carddeck.aw-currentdeckMU .card-header
{
    background-color: var(--c-muna);
}
.aw-carddeck.aw-currentdeckOR .card-header
{
    background-color: var(--c-ordis);
}
.aw-carddeck.aw-currentdeckYZ .card-header
{
    background-color: var(--c-yzmir);
}
.aw-carddeck.aw-currentdeckAX .card-body
{
    background-color: var(--c-axiomtp);
}
.aw-carddeck.aw-currentdeckBR .card-body
{
    background-color: var(--c-bravostp);
}
.aw-carddeck.aw-currentdeckLY .card-body
{
    background-color: var(--c-lyratp);
}
.aw-carddeck.aw-currentdeckMU .card-body
{
    background-color: var(--c-munatp);
}
.aw-carddeck.aw-currentdeckOR .card-body
{
    background-color: var(--c-ordistp);
}
.aw-carddeck.aw-currentdeckYZ .card-body
{
    background-color: var(--c-yzmirtp);
}
.aw-carddeck .card-img-top {
    max-height: 150px;
}

.list-group-item.active {
    background-color: var(--c-unique) !important;
    border-color: var(--c-uniqued2) !important;
}

.aw-decklistcard {
    position: relative;
    margin-bottom: 70px;
    margin-top: 0.5vw !important;
}

.aw-decklistcard img {
    position: relative;
}
.aw-decklistcard img:nth-child(2),
.aw-decklistcard img:nth-child(3){
    position: absolute;
    z-index: 1;
    left: 0;
    padding-right: 7.5px;
    padding-left: 7.5px;
}
.aw-decklistcard img:nth-child(2) {
    top: 1.6vw;
}
.aw-decklistcard img:nth-child(3) {
    top: 3.2vw;
}
@media (max-width: 1399px) {
    .aw-decklistcard img:nth-child(2) {
        top: 2.4vw;
    }
    .aw-decklistcard img:nth-child(3) {
        top: 4.8vw;
    }   
}
@media (max-width: 1199px) {
    .aw-decklistcard img:nth-child(2) {
        top: 5vw;
    }
    .aw-decklistcard img:nth-child(3) {
        top: 10vw;
    } 
    .aw-decklistcard:first-child {
        margin-top: 0 !important;
    }
    .aw-decklistcard:nth-child(2),
    .aw-decklistcard:nth-child(3) {
        margin-top: 0 !important;
    }
    .aw-decklistcard {
        margin-top: 4.5vw !important;
    } 

}
@media (max-width: 991px) {
    .aw-decklistcard img:nth-child(2) {
        top: 14.5vw;
    }
    .aw-decklistcard img:nth-child(3) {
        top: 29vw;
    }
    .aw-decklistcard:first-child {
        margin-top: 0 !important;
    }
    .aw-decklistcard {
        margin-top: 22.5vw !important;
    }
}
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
    padding-left: 20px !important;
    padding-right: 20px !important;
}
.aw-colleft.aw-imageapon .aw-imgapercu img {
    margin-top: 0;
    width: calc(0.31 * 100vw);
}

@media (max-width: 1199px) {
    .aw-colleft.aw-imageapon .aw-imgapercu img {
        display: none;
    }
}
</style>