<template>

  <div class="container-fluid">
    <div class="row">
      <div :class="['aw-card d-flex justify-content-center col-12', cards.length == 2 ? 'col-xxl-6' : 'col-xl-6 col-xxl-4']" v-for="carddet in cards">
        <!--<img :src="card.assets.WEB[0]" class="img-fluid" />-->
        <div class="aw-carddet">
          <svg xmlns="http://www.w3.org/2000/svg" width="248" height="136" fill="none" class="aw-svg">
            <path fill="url(#medium-gold_svg__a)" d="M176.686 0H248v3h-71.314z"></path><path fill="url(#medium-gold_svg__b)" fill-rule="evenodd" d="m31.879 15.5 17-15.5h127.807v3H50.121l-17 15.5H18v15.121l-15 17V136H0V49.379l15-17V28H0V0h28v15.5zM15 15.5V25H3V3h22v12.5zm37.5-9h-.198l-.144.136L35.802 22H21.5v13.816L7.12 52.676l-.12.14V136h1V53.184l14.38-16.86.12-.14V23h13.698l.144-.136L52.698 7.5H80v-1z" clip-rule="evenodd"></path><defs><linearGradient id="medium-gold_svg__a" x1="176.707" x2="248.033" y1="2.011" y2="2.002" gradientUnits="userSpaceOnUse"><stop stop-color="#FFD789"></stop><stop offset="1" stop-color="#FFD789" stop-opacity="0"></stop></linearGradient><linearGradient id="medium-gold_svg__b" x1="88.343" x2="88.343" y1="0" y2="136" gradientUnits="userSpaceOnUse"><stop stop-color="#FFD789"></stop><stop offset="0.5" stop-color="#AD7C3F"></stop><stop offset="1" stop-color="#A97948" stop-opacity="0"></stop></linearGradient></defs>
          </svg>
          <img :src="g_getImageCardPublicUrl(carddet)" class="aw-imagedet img-fluid aw-alteredcard" />
          <svg xmlns="http://www.w3.org/2000/svg" width="248" height="136" fill="none" class="aw-svgbottom">
            <path fill="url(#medium-gold_svg__a)" d="M176.686 0H248v3h-71.314z"></path><path fill="url(#medium-gold_svg__b)" fill-rule="evenodd" d="m31.879 15.5 17-15.5h127.807v3H50.121l-17 15.5H18v15.121l-15 17V136H0V49.379l15-17V28H0V0h28v15.5zM15 15.5V25H3V3h22v12.5zm37.5-9h-.198l-.144.136L35.802 22H21.5v13.816L7.12 52.676l-.12.14V136h1V53.184l14.38-16.86.12-.14V23h13.698l.144-.136L52.698 7.5H80v-1z" clip-rule="evenodd"></path><defs><linearGradient id="medium-gold_svg__a" x1="176.707" x2="248.033" y1="2.011" y2="2.002" gradientUnits="userSpaceOnUse"><stop stop-color="#FFD789"></stop><stop offset="1" stop-color="#FFD789" stop-opacity="0"></stop></linearGradient><linearGradient id="medium-gold_svg__b" x1="88.343" x2="88.343" y1="0" y2="136" gradientUnits="userSpaceOnUse"><stop stop-color="#FFD789"></stop><stop offset="0.5" stop-color="#AD7C3F"></stop><stop offset="1" stop-color="#A97948" stop-opacity="0"></stop></linearGradient></defs>
          </svg>
          <div v-if="!g_isHero(carddet) && !g_isOOF(carddet, currentDeck)" class="aw-quantite">
            {{ carddet.quantite }}
          </div>
          <div class="aw-deckbuilder d-flex flex-column align-items-stretch" v-if="!g_isOOF(carddet, currentDeck)">
            <BButton size="sm" variant="unique" class="text-nowrap flex-fill" :disabled="!canAddCard(carddet)" @click="addCardToDeck(carddet)">
              <font-awesome-icon :icon="['fa', 'circle-plus']" class="fs-1" />
            </BButton>
            <BButton size="sm" variant="danger" class="text-nowrap flex-fill" :disabled="carddet.quantite == 0" @click="removeCardFromDeck(carddet)">
              <font-awesome-icon :icon="['fa', 'circle-minus']" class="fs-1" />
            </BButton>
          </div>
        </div>
      </div>
    </div>
    <div class="row aw-rowlogo">
      <!--
      <BButton size="sm" variant="unique" class="text-nowrap flex-fill" @click="updateallcards()">
        <font-awesome-icon :icon="['fa', 'circle-plus']" class="fs-1" />
      </BButton>
      -->
        <Logo :width="'100%'" :height="'100%'" />
    </div>
  </div>
</template>

<style scoped>
.aw-rowlogo{
  padding-left: 31%;
    padding-right: 31%;
    padding-top: 70px;
}
.aw-carddet {
  position: relative;
  max-width: 500px;
  margin-top: 35px;
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
.aw-deckbuilder {
  position: absolute;
  overflow: hidden;
  width: 0;
  height: 100%;
  left: 100%;
  right: 0;
  transition: .5s ease;
  top: 0;
  opacity: 0;
}

.aw-deckbuilder>button {
  /*opacity: 1;*/
  width: 100%;
  height: 50%;
  border-radius: 0;
}
.aw-carddet:hover .aw-deckbuilder {
  width: 70%;
  left: 30%;
  opacity: 0.80;
  padding: 3px;
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

<script>
import axios from 'axios';
import Logo from './icons/Logo.vue';
import { supabase } from '@/db/client'

export default {
  props: {
    card: {
      type: Object,
      required: true
    },
    currentDeck: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      cards: []
    }
  },
  mounted() {
    var deckcard = this.findInCurrentDeck(this.card.reference);
    if(deckcard) this.cards.push(deckcard);
    else {
      this.card.quantite = 0;
      this.cards.push(this.card);
    }    

    $("#awid-carddetail-label").html(this.card.name);

    if (!this.g_isHero(this.card)) {
      if (this.g_isCommon(this.card)) {
        this.fetchDetailsRare();
      }
      else if (this.g_isRare(this.card)) {
        this.fetchDetailsCommon();
      }
      else if (this.g_isUnique(this.card)) {
        this.fetchDetailsRare();
        this.fetchDetailsCommon();
      }
    }
  },
  methods: {
    canAddCard(pcard)
    {
      if(pcard.quantite == 3 || (pcard.quantite == 1 && (this.g_isUnique(pcard) || this.g_isHero(pcard)))) return false;
      return true;
    },
    async fetchDetailsRare() {
      //"ALT_CORE_B_AX_04_C";
      var tab = this.card.reference.split('_');
      var idcard = tab[0] + '_' + tab[1] + '_' + tab[2] + '_' + tab[3] + '_' + tab[4] + '_R1';
      this.fetchDetails(idcard);
    },
    fetchDetailsCommon() {
      //"ALT_CORE_B_AX_04_R1";
      var tab = this.card.reference.split('_');
      var idcard = tab[0] + '_' + tab[1] + '_' + tab[2] + '_' + tab[3] + '_' + tab[4] + '_C';
      this.fetchDetails(idcard);
    },
    findInCurrentDeck(pid) 
    {
      for (var zecard of this.currentDeck.cards) {
        if (zecard.reference == pid) return zecard;
      }
      return null;
    },
    addCardDetail(pcard) {
      if (!pcard.quantite) pcard.quantite = 0;

      if (this.g_isCommon(pcard)) {
        this.cards.unshift(pcard);
      }
      else if (this.g_isRare(pcard)) {
        if (this.cards.length == 2) {
          //si [common, rare] alors insérer la rare
          this.cards.splice(1, 0, pcard);
        }
        else {
          //longueur 1 : dépend de la rareté de la carte [common] ou [unique]
          if (this.g_isCommon(this.cards[0])) this.cards.push(pcard);
          else this.cards.unshift(pcard);
        }
      }
    },
    async fetchDetails(preference) {
      //si la carte est deja dans le deck, pas besoin de fetch
      var deckcard = this.findInCurrentDeck(preference);
      if (deckcard) {
        this.addCardDetail(deckcard);
        return;
      }
      
      this.g_fetchCard(preference, pcard => this.addCardDetail(pcard));
    }
  }
};
</script>