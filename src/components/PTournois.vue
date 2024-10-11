<template>
<div class="aw-wrapper">
    <img src="@/assets/img/collectionfond.png" class="aw-fond" v-if="!afficherstats"/>

    <div class="container-fluid pt-2">
        <div :class="['aw-imgapercu', showImageFullsize ? 'aw-imageapon' : '']">
            <div class="aw-imgapercustick">
                <img :src="g_getImageApercu(imagePathFullsize)" alt="" class="img-fluid aw-alteredcard" />
            </div>
        </div>
        <BRow>
            <BCol lg="4" v-if="!afficherstats">
                <div class="card card-outline card-info">
                    <div class="card-header">
                        <h3 class="card-title">{{$t('ui.lib.tournois')}}</h3>
                        <div class="card-tools d-flex">
                            <BButton @click="e_createTournoi" variant="primary" size="sm" v-if="!show_formtournoi && g_isAdmin(user)">
                                <font-awesome-icon :icon="['fas', 'circle-plus']" class="me-2" />{{$t('ui.action.creer')}}
                            </BButton>
                        </div>
                    </div>
                    <div class="card-body">
                        <BForm @submit="e_submitTournoi" v-if="show_formtournoi">
                            <BRow class="mb-2">
                                <BCol sm="12" class="mb-2">
                                    <BFormFloatingLabel label="Libellé">
                                        <BFormInput id="awid-libtournoi" placeholder="Saisissez le libellé du tournoi" v-model="fLibelleTournoi" :required="true"/>
                                    </BFormFloatingLabel>
                                </BCol>
                                <BCol sm="12" class="mb-2">
                                    <BFormFloatingLabel label="Lieu">
                                        <BFormInput id="awid-lieutournoi" placeholder="Saisissez le lieu du tournoi" v-model="fLieuTournoi" :required="true" />
                                    </BFormFloatingLabel>
                                </BCol>
                                <BCol sm="12" class="mb-2">
                                    <VueDatePicker v-model="fDatesTournoi" auto-apply range placeholder="Saisissez la date du tournoi (début et fin)" :enableTimePicker="false" required></VueDatePicker>
                                </BCol>
                                <BCol sm="12" class="mb-2">
                                    <Multiselect v-model="cbFormatTournoi" :close-on-select="true" :options="formats" :canDeselect="false" :canClear="false" required placeholder="Sélectionnez le format du tournoi" />
                                </BCol>
                                <BCol sm="12">
                                    <BFormFloatingLabel label="Nombres de joueurs">
                                        <BFormInput id="awid-nbjoueurstournoi" placeholder="Saisissez le nombre de joueurs du tournoi" v-model="fNbJoueursTournoi" :required="true" type="number" min="4"/>
                                    </BFormFloatingLabel>
                                </BCol>
                            </BRow>
                            <div class="d-flex justify-content-end">
                                <BButton variant="light" @click="show_formtournoi = false">{{$t('ui.action.annuler')}}</BButton>
                                <BButton type="submit" variant="primary" class="ms-2">{{$t('ui.action.valider')}}</BButton>
                            </div>
                        </BForm>

                        <div v-if="!show_formtournoi">
                            <div v-if="!tournois || tournois.length == 0">Aucun tournoi</div>
                            <BListGroup v-else>
                                <BListGroupItem v-for="tournoi in tournois" @click="e_showTournoi(tournoi)" :class="['aw-tournoi aw-cursor-pointer', getClassTournoi(tournoi)]" :id="'tournoi' + tournoi.id">
                                    <div class="d-flex justify-content-between">
                                        <div class="d-flex flex-column">
                                            <div class="fs-6">{{ tournoi.libelle }}</div>
                                            <div class="fs-7">{{  tournoi.nbjoueurs }} joueurs</div>
                                        </div>
                                        <div class="d-flex flex-column">
                                            <div class="fs-6">{{ tournoi.lieu }}</div>
                                            <div class="fs-7">{{ getFormattedDateTournoi(tournoi) }}</div>
                                        </div>
                                    </div>
                                </BListGroupItem>
                            </BListGroup>
                        </div>
                    </div>
                </div>
                <div class="card card-outline card-info" v-if="currentTournoi && !show_formtournoi">
                    <div class="card-header" v-if="previewexturl">
                        <h3 class="card-title">Article</h3>
                    </div>
                    <div class="card-body" v-if="previewexturl">
                        <a :href="currentTournoi.exturl" target="_blank" class="fs-6">{{ g_decodeHTMLEntities(previewexturl.ogTitle) }}</a>
                        <div class="d-flex justify-content-center">
                            <a :href="currentTournoi.exturl" target="_blank" class="d-flex justify-content-center">                                
                                <img :src="previewexturl.ogImage[0].url" alt="URL Preview" class="img-fluid w-25"/>
                            </a>
                        </div>                      
                    </div>
                    <div class="card-header">
                        <h3 class="card-title">Decks</h3>
                    </div>
                    <div class="card-body">
                        <div v-if="decks && decks.length > 0">
                            <BListGroup >
                                <BListGroupItem v-for="deck in decks" @click="e_showDeck(deck)" :class="['aw-deck aw-cursor-pointer', getClassDeck(deck)]" :id="'deck' + deck.id">
                                    <div class="d-flex justify-content-between">
                                        <div>{{ deck.name }}</div>
                                        <div class="aw-posdeck">
                                            <img src="/src/assets/img/altered/place1.png" v-if="deck.tournoiPos == 1"/>
                                            <img src="/src/assets/img/altered/place2.png" v-if="deck.tournoiPos == 2"/>
                                            <img src="/src/assets/img/altered/place3.png" v-if="deck.tournoiPos == 3"/>
                                            {{ deck.tournoiPos }}
                                            
                                        </div>
                                    </div>
                                </BListGroupItem>
                            </BListGroup>
                            <Pie :options="chartFaction.chartOptions" :data="chartFaction.chartData" class="mt-3" v-if="loadedCharts"/>
                            <Pie :options="chartHero.chartOptions" :data="chartHero.chartData" class="mt-3" v-if="loadedCharts"/>
                        </div>
                        
                        <div v-else>Aucun deck</div>

                        
                    </div>
                </div>
            </BCol>
            <BCol lg="4" v-if="currentDeck && !show_formtournoi && afficherstats">
                <DeckStats :currentDeck="currentDeck" />
            </BCol>
            <BCol lg="8" v-if="currentDeck && !show_formtournoi">
                <Decklists :currentdeck="currentDeck" :user="user"
                    @mouseentercard="mouseEnterCard" 
                    @mouseleavecard="mouseLeaveCard" 
                    @onafficherstat="e_afficherstat"/>
            </BCol>
        </BRow>
    </div>
</div>
</template>

<script setup>
defineProps({
    user: { type: Object },
    tournoiid: { 
        type: Number,
        default: 0
    },
});
</script>

<script>
import { useToast, TYPE } from "vue-toastification";
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale)

const toast = useToast();

export default {
    name: 'PTournois',
    components: { Pie },
    data() {
        return {
            fLibelleTournoi:'',
            fLieuTournoi:'',
            fDatesTournoi:null,
            fNbJoueursTournoi:4,
            cbFormatTournoi: null,
            formats : this.g_formatsForCb(),
            show_formtournoi: false,
            currentTournoi: null,
            tournois: [],
            currentDeck: null,
            decks: [],
            showImageFullsize: false,
            imagePathFullsize: null,
            mousetimeout: null,
            previewexturl: null,
            chartFaction: {
                chartData: {
                    labels: null,
                    datasets: [
                        {
                            data: null,
                            backgroundColor: null,
                        }
                    ]
                },
                chartOptions: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: this.$t('ui.lib.factiondistrib')
                        }
                    }
                }
            },
            chartHero: {
                chartData: {
                    labels: null,
                    datasets: [
                        {
                            data: null,
                            backgroundColor: null,
                        }
                    ]
                },
                chartOptions: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: this.$t('ui.lib.herodistrib')
                        }
                    }
                }
            },
            loadedCharts: false,
            afficherstats: false,
        }
    },
    watch:{
        //RAS
    },
    mounted(){
        this.tournois = []
        this.decks = []
        this.currentTournoi = null
        this.currentDeck = null

        this.g_fetchTournois({tournoiid: this.tournoiid}, ptournois => {
            this.tournois = ptournois

            if(this.tournoiid && this.tournois && this.tournois.length == 1)
            {
                this.e_showTournoi(this.tournois[0])
            }
        })
    },
    methods:{
        e_afficherstat(pafficher)
        {
            this.afficherstats = pafficher
        },
        setDataCharts() 
        {
            var factionLabels = [],
                factionDataset = {
                    data: [],
                    backgroundColor: []
                },
                heroLabels = [],
                heroDataset = {
                    data: [],
                    backgroundColor: []
                }

            if(this.decks)
            {
                this.decks.forEach(pdeck => 
                {
                    const faction = this.g_getFaction(pdeck.main_faction)
                    
                    var indexfaction = factionLabels.indexOf(faction.fr)
                    if(indexfaction == -1)
                    {
                        factionLabels.push(faction.fr)
                        indexfaction = factionLabels.indexOf(faction.fr)

                        factionDataset.data.push(0)
                        factionDataset.backgroundColor.push(faction.color)
                    }
                    factionDataset.data[indexfaction]++

                    var indexhero = heroLabels.indexOf(pdeck.hero.name)
                    if(indexhero == -1) 
                    {
                        heroLabels.push(pdeck.hero.name)
                        indexhero = heroLabels.indexOf(pdeck.hero.name)

                        heroDataset.data.push(0)
                        heroDataset.backgroundColor.push(this.g_getHeroColorByName(pdeck.hero.name))
                    }
                    heroDataset.data[indexhero]++
                })
            }
            this.chartFaction.chartData.datasets[0] = factionDataset
            this.chartFaction.chartData.labels = factionLabels
            this.chartHero.chartData.datasets[0] = heroDataset
            this.chartHero.chartData.labels = heroLabels
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
        e_createTournoi(){
            this.fLibelleTournoi = ''
            this.fLieuTournoi = ''
            this.fDatesTournoi = null
            this.fNbJoueursTournoi = 4
            this.cbFormatTournoi = this.g_formats()[0].code
            this.show_formtournoi = true

            setTimeout(() => $("#awid-libtournoi").trigger('select'), 50)
        },
        e_submitTournoi(event)
        {
            event.preventDefault()

            if(!this.currentTournoi)
            {
                this.currentTournoi = {}
            }
            this.currentTournoi.libelle = this.fLibelleTournoi
            this.currentTournoi.lieu = this.fLieuTournoi
            this.currentTournoi.format = this.cbFormatTournoi
            this.currentTournoi.dates = this.fDatesTournoi
            this.currentTournoi.nbjoueurs = this.fNbJoueursTournoi

            this.g_saveTournoi(this.currentTournoi, ptournoi => {

                if(ptournoi)
                {
                    this.currentTournoi = ptournoi
                    this.show_formtournoi = false

                    return
                }

                toast("Une erreur s'est produite lors de la sauvegarde du tournoi", { type: TYPE.ERROR })    
            })
        },
        e_showTournoi(ptournoi)
        {
            this.currentTournoi = ptournoi
            this.currentDeck = null
            this.loadedCharts = false

            this.g_getPreviewArticle(this.currentTournoi.exturl, pdata => this.previewexturl = pdata)
            
            this.g_fetchDecksTournoi(ptournoi, pdecks => {
                this.decks = pdecks
                this.setDataCharts()
                this.loadedCharts = true
            })
        },
        e_showDeck(pdeck)
        {
            var params = {
                id: pdeck.id,
                withcards: true,
                withfavs: false,
            }
            this.g_fetchDeck(params, ppdeck => 
            {
                this.currentDeck = ppdeck
                this.g_sortDeck(this.currentDeck)
            })
        },
        getClassTournoi(ptournoi)
        {
            return this.currentTournoi && this.currentTournoi.id == ptournoi.id ? 'active' : ''
        },
        getClassDeck(pdeck)
        {
            return this.currentDeck && this.currentDeck.id == pdeck.id ? 'active' : ''
        },
        getFormattedDate(pdate)
        {
            const datedeb = new Date(pdate)
            const formatter = new Intl.DateTimeFormat('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'            
            })

            return formatter.format(datedeb)
        },
        getFormattedDateTournoi(ptournoi)
        {
            const datedeb = this.getFormattedDate(ptournoi.dates[0])
            const datefin = this.getFormattedDate(ptournoi.dates[1])

            if(datedeb == datefin)
            {
                return "le " + datedeb
            }
            return "du " + datedeb + " au " + datefin
        },
    }
}


</script>

<style scoped>
*:required {
  border-left: 3px solid var(--c-unique);
}
.aw-posdeck img
{
    width: 30px;
}
</style>