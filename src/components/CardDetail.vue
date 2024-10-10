<template>

  <div class="row">
    <div :class="['aw-card d-flex justify-content-center col-12', getClassColumn()]" v-for="carddet in cards">
      <!--<img :src="card.assets.WEB[0]" class="img-fluid" />-->
      <div class="aw-carddet">
        <svg xmlns="http://www.w3.org/2000/svg" width="248" height="136" fill="none" class="aw-svg">
          <path fill="url(#medium-gold_svg__a)" d="M176.686 0H248v3h-71.314z"></path><path fill="url(#medium-gold_svg__b)" fill-rule="evenodd" d="m31.879 15.5 17-15.5h127.807v3H50.121l-17 15.5H18v15.121l-15 17V136H0V49.379l15-17V28H0V0h28v15.5zM15 15.5V25H3V3h22v12.5zm37.5-9h-.198l-.144.136L35.802 22H21.5v13.816L7.12 52.676l-.12.14V136h1V53.184l14.38-16.86.12-.14V23h13.698l.144-.136L52.698 7.5H80v-1z" clip-rule="evenodd"></path><defs><linearGradient id="medium-gold_svg__a" x1="176.707" x2="248.033" y1="2.011" y2="2.002" gradientUnits="userSpaceOnUse"><stop stop-color="#FFD789"></stop><stop offset="1" stop-color="#FFD789" stop-opacity="0"></stop></linearGradient><linearGradient id="medium-gold_svg__b" x1="88.343" x2="88.343" y1="0" y2="136" gradientUnits="userSpaceOnUse"><stop stop-color="#FFD789"></stop><stop offset="0.5" stop-color="#AD7C3F"></stop><stop offset="1" stop-color="#A97948" stop-opacity="0"></stop></linearGradient></defs>
        </svg>
        <img :src="g_getImageCardPublicUrl(carddet)" class="aw-imagedet img-fluid aw-alteredcard" />
        <svg xmlns="http://www.w3.org/2000/svg" width="248" height="136" fill="none" class="aw-svgbottom">
          <path fill="url(#medium-gold_svg__a)" d="M176.686 0H248v3h-71.314z"></path><path fill="url(#medium-gold_svg__b)" fill-rule="evenodd" d="m31.879 15.5 17-15.5h127.807v3H50.121l-17 15.5H18v15.121l-15 17V136H0V49.379l15-17V28H0V0h28v15.5zM15 15.5V25H3V3h22v12.5zm37.5-9h-.198l-.144.136L35.802 22H21.5v13.816L7.12 52.676l-.12.14V136h1V53.184l14.38-16.86.12-.14V23h13.698l.144-.136L52.698 7.5H80v-1z" clip-rule="evenodd"></path><defs><linearGradient id="medium-gold_svg__a" x1="176.707" x2="248.033" y1="2.011" y2="2.002" gradientUnits="userSpaceOnUse"><stop stop-color="#FFD789"></stop><stop offset="1" stop-color="#FFD789" stop-opacity="0"></stop></linearGradient><linearGradient id="medium-gold_svg__b" x1="88.343" x2="88.343" y1="0" y2="136" gradientUnits="userSpaceOnUse"><stop stop-color="#FFD789"></stop><stop offset="0.5" stop-color="#AD7C3F"></stop><stop offset="1" stop-color="#A97948" stop-opacity="0"></stop></linearGradient></defs>
        </svg>
        <div v-if="deckbuilder && !g_isHero(carddet) && !g_isOOF(carddet, currentDeck)" class="aw-quantite">
          {{ carddet.quantite }}
        </div>
        <div class="aw-cardoptions" v-if="deckbuilder && !g_isOOF(carddet, currentDeck)">
          <div class="d-flex align-items-center">
            <div class="d-flex flex-column align-items-center flex-fill">
              <div class="d-flex justify-content-between aw-tools">
                <div class="aw-button d-flex align-items-center" v-visible="carddet.quantite > 0" @click="removeCardFromDeck(carddet)">
                  <font-awesome-icon :icon="['fa', 'circle-minus']" class="fs-1" />
                </div>
                <div class="fs-1" v-if="deckbuilder">{{ carddet.quantite }}</div>              
                <div class="aw-button d-flex align-items-center" v-visible="g_canAddCardToDeck(carddet, currentDeck)" @click="addCardToDeck(carddet)">
                  <font-awesome-icon :icon="['fa', 'circle-plus']" class="fs-1" />
                </div>
              </div>
            </div>
          </div>
        </div>       
      </div>
    </div>
  </div>
  <div class="row aw-rowlogo">
      <Logo :width="'100%'" :height="'100%'" />
  </div>
  
</template>

<script>
import Logo from './icons/Logo.vue';

export default {
  props: {
    card: {
      type: Object,
      required: true
    },
    currentDeck: {
      type: Object,
      required: false
    },
    deckbuilder: false
  },
  data() {
    return {
      cards: []
    }
  },
  mounted() 
  {
    $("#awid-carddetail-label").html(this.card.name);

    const cardsrefs = []

    if(this.g_isHero(this.card)) cardsrefs.push(this.card.reference)
    else
    {
      var tab = this.card.reference.split('_');
      cardsrefs.push(tab[0] + '_' + tab[1] + '_' + tab[2] + '_' + tab[3] + '_' + tab[4] + '_C')
      cardsrefs.push(tab[0] + '_' + tab[1] + '_' + tab[2] + '_' + tab[3] + '_' + tab[4] + '_R1')
      cardsrefs.push(tab[0] + '_' + tab[1] + '_' + tab[2] + '_' + tab[3] + '_' + tab[4] + '_R2')
      
      if (this.g_isUnique(this.card)) 
      {
        cardsrefs.push(this.card.reference)
      }
    } 

    cardsrefs.forEach(pref => this.fetchDetails(pref))
  },
  methods: {
    getClassColumn()
    {
      switch (this.cards.length) {
        case 2: return 'col-md-6'
        case 3: return 'col-lg-4'
        case 4: return 'col-xl-3 col-md-6'
        default: return 'col-md-12'
      }
    },
    canAddCard(pcard)
    {
      if(pcard.quantite == 3 || (pcard.quantite == 1 && (this.g_isUnique(pcard) || this.g_isHero(pcard)))) return false;
      return true;
    },
    findInCurrentDeck(pid) 
    {
      if(this.deckbuilder) for (var zecard of this.currentDeck.cards) {
        if (zecard.reference == pid) return zecard;
      }
      return null;
    },
    addCardDetail(pcard) {
      if (!pcard.quantite) pcard.quantite = 0;

      this.cards.push(pcard)
      this.cards.sort((carda, cardb) => 
      {
        if(this.g_isCommon(carda)) return -1
        if(this.g_isCommon(cardb)) return 1
        if(this.g_isUnique(carda)) return 1
        if(this.g_isUnique(cardb)) return -1

        //a et b sont rare, on met la not OOF en premier
        var tab = carda.reference.split('_');
        if(tab[tab.length -1] == 'R1') return -1
        return 0
      })
    },
    async fetchDetails(preference) 
    {
      //si la carte est deja dans le deck, pas besoin de fetch
      var deckcard = this.findInCurrentDeck(preference);
      if (deckcard) {
        this.addCardDetail(deckcard);
        return;
      }
      
      this.g_fetchCard(preference, pcard => this.addCardDetail(pcard))
    }
  }
};
</script>

<style scoped>
.aw-rowlogo{
  padding-left: 31%;
    padding-right: 31%;
    padding-top: 10px;
}
.aw-carddet {
  position: relative;
  max-width: 500px;
  margin-top: 35px;
  margin-left: 35px;
  margin-bottom: 35px;
}
.aw-svg
{
  position: absolute;
  margin-top: -25px;
  margin-left: -26px;
}
.aw-svgbottom
{
  position: absolute;
    bottom: 0;
    right: 0;
    margin-right: -25px;
    margin-bottom: -26px;
    transform: rotate3d(0, 0, 1, 180deg);
}
.aw-quantite {
  position: absolute;
  background: white;
  color: black;
  bottom: 3px;
  left: 3px;
  padding: 12px 27px;
  font-size: 30px;
  border-radius: 3px;
  border: 3px solid black;
}
.aw-cardoptions .aw-tools
{
  padding: 25px !important;
}
</style>

<script setup>
const emit = defineEmits(['addcard', 'removecard']);

const removeCardFromDeck = (pcard) => {
  emit('removecard', pcard);
}
const addCardToDeck = (pcard) => {
  emit('addcard', pcard);
}
</script>