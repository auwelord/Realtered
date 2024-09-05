<template>
    <div class="aw-wrapper">
        <img src="@/assets/img/collectionfond.png" class="aw-fond" v-if="!afficherstats"/>

        <div class="container-fluid pt-2"> <!--begin::Row-->
            <div class="row">
                <div :class="['col-xl-4 col-12', afficherstats ? 'aw-deckliststat' : '']">
                    <div class="card card-outline card-info mb-1" v-if="!afficherstats">
                        <div class="card-header">
                            <h3 class="card-title">Factions</h3>
                            <div class="card-tools">
                                <div v-if="user">
                                    Mes decks uniquement
                                    <label class="switch me-2">
                                        <input type="checkbox" v-model="mesdecksonly">
                                        <span class="slider round"></span>
                                    </label>
                                </div>

                            </div>
                        </div>
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
                            <div class="mt-2 aw-decks">
                                <BListGroup>
                                    <BListGroupItem @click="onShowDeck(deck)" v-for="deck in decks"
                                        :class="['aw-deck', getDeckCssClass(deck)]" :id="'deck' + deck.id">
                                        
                                        <div class="d-flex justify-content-between">
                                            <div class="d-flex justify-content-start align-items-center">
                                                <img :src="getDeckFactionImage(deck)" class="aw-deckimg me-2" />
                                                <div class="aw-deckname">{{ deck.name }}</div>
                                                <font-awesome-icon :icon="['fas', 'lock']"
                                                    class="d-none aw-privateico ms-2" />
                                            </div>
                                            <div class="d-flex flex-column justify-content-end align-items-end">
                                                <div v-if="deck.hero">{{ deck.hero.name }}</div>
                                                <div><i class="fs-8">{{ getDateDeckFormatee(deck) }}</i></div>
                                            </div>
                                        </div>
                                    </BListGroupItem>
                                </BListGroup>
                            </div>
                        </div>
                    </div>

                    <DeckStats v-if="currentdeck && afficherstats" :currentDeck="currentdeck" />
                </div>
                <div class="col-xl-8 col-12" v-if="currentdeck">

                    <div :class="['card aw-carddeck', getCurrentDeckCssClass()]">
                        <div class="card-header">
                            <div class="d-flex justify-content-between">
                                <div class="d-flex flex-column justify-content-between">
                                    <div>
                                        <div class="aw-titledeck fs-3">{{currentdeck.name}} </div>
                                        <br>
                                        <div class="fs-6">Personnages : 25 </div>
                                        <div class="fs-6">Sorts : 5 </div>
                                        <div class="fs-6">Permanents : 3 </div>
                                    </div>

                                    <div>
                                        <label class="switch me-2">
                                            <input type="checkbox" v-model="afficherstats">
                                            <span class="slider round"></span>
                                        </label> Voir les statistiques
                                    </div>
                                </div>
                                <img :src="g_getImageBanner(currentdeck.hero)" />
                            </div>
                        </div>
                        <div class="card-body">                        
                            <div class="row">
                                <template v-for="card in currentdeck.cards">
                                    <div class="col-12 col-lg-4 col-xl-3 col-xxl-2 aw-card" v-if="!g_isHero(card)">
                                        <img v-for="index in card.quantite" :src="g_getImageCardPublicUrl(card)"
                                            :title="card.name" class="img-fluid" />
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
import { watch } from 'vue'
import { getCurrentInstance } from 'vue';

const props = defineProps({
    user: { type: Object },
    admin: { type: Boolean },
});

const instance = getCurrentInstance();

watch(() => props.user, async (newUser, oldUser) => {
    if (!newUser) {
        instance.proxy.loadDecks();
    }
})
</script>

<script>
import { supabase } from '@/db/client'

export default
    {
        data() {
            return {
                currentFaction: null,
                decks: null,
                mesdecksonly: false,
                currentdeck: null,
                afficherstats: false
            }
        },
        mounted() {
            //this.$events.listen('clearForm', () => alert('toto'))
            /*
            this.g_retrieveuser(puser => 
            {
                this.user = puser
                this.admin = this.g_isAdmin(puser);
            })
                */
            this.loadDecks()
        },
        methods:
        {
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
            onShowDeck(pdeck) {
                $(".aw-deck").removeClass('active');
                $("#deck" + pdeck.id).addClass('active');
                this.currentdeck = pdeck
            },
            getDeckFactionImage(pdeck) {
                return '/src/assets/img/altered/factions/icons/' + this.g_getFactionName(pdeck.main_faction, true) + '.png'
            },
            getCurrentDeckCssClass()
            {
                var css = "aw-currentdeck" + this.currentdeck.main_faction
                console.log(css)
                return css
            },
            getDeckCssClass(pdeck) {
                var css = "aw-" + pdeck.main_faction
                if (!pdeck.public) css += " aw-private"
                return css
            },
            loadDecks() {
                $(".aw-deck").removeClass('active');
                this.currentdeck = null
                var params = {
                    myonly: this.mesdecksonly,
                    faction: this.currentFaction,
                    withcards: true,
                    callback: pdecks => {
                        //tri: personnages / sorts / permanents
                        pdecks.forEach(deck => {
                            deck.cards.sort((a, b) => {
                                //deja trié via la requete, si meme type, on garde le tri d'origine
                                if (a.cardType == b.cardType) return 0;

                                if (this.g_isPersonnage(a)) return -1;
                                if (this.g_isPermanent(a)) return 1;
                                if (this.g_isPersonnage(b)) return 1;
                                if (this.g_isPermanent(b)) return -1;

                            });
                        });
                        this.decks = pdecks;
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
                this.loadDecks()
            },
            setCurrentFaction(link) {

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
        }
    }
</script>

<style scope>
.aw-deckliststat
{
    padding-left: 6% !important;
    padding-right: 6% !important;
}
.aw-titledeck
{
    padding-bottom: 4px;
    border-bottom: 1px solid white;
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

.aw-card {
    position: relative;
    margin-bottom: 70px;
}

.aw-card img {
    position: relative;
}

.aw-card img:nth-child(2) {
    position: absolute;
    z-index: 1;
    top: 34px;
    left: 0;
    padding-right: calc(var(--bs-gutter-x)* 0.5);
    padding-left: calc(var(--bs-gutter-x)* 0.5);
}

.aw-card img:nth-child(3) {
    position: absolute;
    z-index: 1;
    top: 68px;
    left: 0;
    padding-right: calc(var(--bs-gutter-x)* 0.5);
    padding-left: calc(var(--bs-gutter-x)* 0.5);
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
</style>