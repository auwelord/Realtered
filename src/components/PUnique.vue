<template>
    <div class="aw-wrapper">
        <img src="@/assets/img/collectionfond.png" class="aw-fond"/>

        <div class="container-fluid pt-2">
            <div :class="['aw-imgapercu', showImageFullsize ? 'aw-imageapon' : '']">
                <div class="aw-imgapercustick">
                    <img :src="g_getImageApercu(imagePathFullsize)" class="img-fluid aw-alteredcard" />
                </div>
            </div>
            <BRow>
                <BCol lg="3">
                    <CardFilter 
                        :user="user" 
                        :deckbuilder="false"
                        :canselectfaction="true"
                        :gstunique="true"
                        @searchcards="e_searchCards" />
                </BCol>
                <BCol lg="9">
                    <BRow>
                        <Card v-for="card in fetchedCards" 
                            :key="card.id" 
                            :card="card" 
                            :deckbuilder="false"
                            :user="user"
                            @onshowcarddetail="e_showcarddetail" 
                            @mouseentercard="e_mouseenterCard" 
                            @mouseleavecard="e_mouseleaveCard" />
                    </BRow>
                </BCol>
            </BRow>
        </div>
    </div>  

    <BModal v-model="afficherDetails" size="fullscreen" hide-footer id="awid-carddetail" @hidden="e_hideModalDetail" class="aw-modalecarddet">
        <CardDetail v-if="currentCardDetail"
            :card="currentCardDetail" 
            :deckbuilder="false"/>
    </BModal>
</template>

<script setup>
const props = defineProps({
    user: { type: Object },
});
</script>

<script>
import { useGlobalStore } from '@/stores/global'

export default {
    name: 'Uniques',
    data() {
        return {
            globalStore: useGlobalStore(),
            itemsPerPage: 12,
            currentPage: 1,
            fetchedCards: [],
            hasMore: false,
            showImageFullsize: false,
            imagePathFullsize: null,
            mousetimeout: null,
            currentCardDetail: null,
            afficherDetails: false,
        }
    },
    mounted(){
        this.globalStore.database = true
        this.globalStore.cardfilter.unique = true
        this.globalStore.controlerFiltreUnique() //désactivation des autres raretes et selection characters seulement
        
    },
    methods: {
        e_searchCards() {
            this.fetchedCards = [];
            this.hasMore = true;
            this.currentPage = 1;

            if (this.currentPage > 1 && !this.hasMore) return;

            var calcparams = $.extend(
            {
                itemsPerPage: this.itemsPerPage,
                currentPage: this.currentPage,
                deckbuilder: false
            }, this.globalStore.getParamsForRequestCards())

            this.g_fetchCardsFromDatabase(calcparams, pcards => 
            {
                if(pcards)
                {
                    this.currentPage++;
                    this.hasMore = pcards.length > this.itemsPerPage;
                    if(this.hasMore) pcards.pop(); //on vire le dernier élément qui ne sert qu'à savoir si il y a d'autres cartes à fetch

                    pcards.forEach(card => 
                    {
                        this.fetchedCards.push(card);
                    })
                }
            })
        },
        e_mouseenterCard(card) 
        {
            if(this.mousetimeout) clearTimeout(this.mousetimeout)
            this.imagePathFullsize = this.g_getImageCardPublicUrl(card)
            this.showImageFullsize = true
        },
        e_mouseleaveCard(card)
        {
            this.mousetimeout = setTimeout(() => 
            {
                if(this.mousetimeout) this.showImageFullsize = false
            }, 200)
        },
        e_showcarddetail(card) 
        {
            this.currentCardDetail = card
            this.afficherDetails = true
        },
        e_hideModalDetail() {
            //remettre à null permet de remounted à chaque affichage du detail car component v-if sur l'objet carddetail
            this.currentCardDetail = null;
        },
    
    }
}
</script>