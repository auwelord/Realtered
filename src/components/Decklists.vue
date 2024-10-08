<template>
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
                            <input type="checkbox" v-model="afficherstats" @change="e_afficherStat(afficherstats)">
                            <span class="slider round"></span>
                        </label> Voir les statistiques
                    </div>
                    
                    <div class="mt-2">
                    <BButton @click="onImporterDeck" variant="uniqued2" size="sm" title="importer le deck" class="me-2" v-if="user">
                        <font-awesome-icon :icon="['fas', 'right-long']" class="me-2"/>Importer
                    </BButton>

                    <BButton @click="onCopierLienDeck" variant="uniqued2" size="sm" title="Copier le lien" class="me-2">
                        <font-awesome-icon :icon="['fab', 'threads']" class="me-2" />Copier le lien
                    </BButton>

                    <BButton @click="e_testerDeck" variant="uniqued2" size="sm" title="Tester le deck" class="me-2">
                        <font-awesome-icon :icon="['fas', 'vial']"  class="me-2" />Tester le deck
                    </BButton>

                    <BButton @click="onToggleFavoris" variant="uniqued2" size="sm" class="me-2" v-if="user">
                        <font-awesome-icon :icon="['fas', 'heart']" style="color: red" v-if="currentdeck.favori" />
                        <font-awesome-icon :icon="['fas', 'heart']" v-else />
                    </BButton>                                    
                    </div>

                    <div class="d-flex mt-2">
                        <div v-b-toggle.awid-descdeck class="aw-collapsible" >
                            Description <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-white aw-arrowcollapse" /> 
                        </div>
                        <div v-b-toggle.awid-probadeck class="aw-collapsible ms-3">
                            Probas <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse mt-1" />
                        </div>
                    </div>

                </div>
                <img :src="g_getImageBanner(currentdeck.hero)" />
            </div>
        </div>
        <div class="card-body">
            <BCollapse id="awid-descdeck">
                <div class="col-12 mt-4" v-if="!currentdeck.description"><i class="fs-7"><font-awesome-icon :icon="['fas', 'ban']" class="me-2"/>Ce deck ne possède pas de description</i></div>
                <div class="col-12 mt-4" v-html="getFormattedDescriptionCurrentDeck()"></div>
            </BCollapse>   
            <BCollapse id="awid-probadeck">
                <DeckProba :deck="currentdeck"/>                     
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
</template>

<script setup>
import MarkdownIt from "markdown-it";

const props = defineProps({
    deckid: { 
        type: Number,
        default: 0
    },
    user: { type: Object },
    currentFaction: { type: String },
    currentdeck: { type: Object }
});

const emit = defineEmits(['mouseentercard', 'mouseleavecard', 'onafficherstat']);

const mouseEnterCard = (pcard) => {
  emit('mouseentercard', pcard);
}
const mouseLeaveCard = (pcard) => {
  emit('mouseleavecard', pcard);
}
const e_afficherStat = (pafficherstats) => {
  emit('onafficherstat', pafficherstats);
}
</script>

<script>
import { useToast, TYPE } from "vue-toastification";
import { useRouter } from 'vue-router';

const toast = useToast();

export default
    {
        data() {
            return {
                afficherstats: false,
                currenthero: null,
                erreurdeckid: false,
                imagePathFullsize: null,
                mousetimeout: null,
                router: null,
            }
        },
        mounted() 
        {
            this.router = useRouter();
        },
        watch:{
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
            e_testerDeck()
            {
                const route = this.$router.resolve('/decktest/' + this.currentdeck.id);
      
                // Open the route in a new tab
                window.open(route.href);
            },
            onCopierLienDeck()
            {
                const baseUrl = window.location.origin; 
                const { href: decklisturl } = this.router.resolve({ name: 'DeckList' });
                navigator.clipboard.writeText(baseUrl + decklisturl + '/' + this.currentdeck.id)
                toast("Le lien vers ce deck a été copié dans le presse-papier", { type: TYPE.SUCCESS });
            },
            onImporterDeck()
            {
                this.g_importDeck({deck: this.currentdeck, setuniquefav: true}, 
                    //onImportedDeck: 
                    pdeck => 
                    {
                        if(pdeck) toast("Deck importé !", { type: TYPE.SUCCESS })
                        else toast("Une erreur s'est produite", { type: TYPE.ERROR })
                    }
                )
            },
            getCurrentDeckCssClass()
            {
                return this.currentdeck ? "aw-currentdeck" + this.currentdeck.main_faction : ''
            },
        },
    }
</script>

<style scope>

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
</style>