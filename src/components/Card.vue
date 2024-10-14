<template>

  <div :class="getGridClass()">
    <div class="d-flex flex-column align-items-center aw-card" @mouseenter="mouseEnterCard(card)" @mouseleave="mouseLeaveCard(card)">
      <div>
        <img :src="g_getImageCardPublicUrl(card)" :title="card.name" class="img-fluid aw-alteredcard" />
        <div :class="['aw-collection', getClassCardCollection()]" v-if="!deckbuilder && g_isBearer()">
          Collection: {{ card.inMyCollection }} <br>
          Wantlist: {{ card.inMyWantlist ? 'Oui' : 'Non' }}<br>
          Tradelist: {{ card.inMyTradelist }}
        </div>
        <div class="aw-cardoptions" v-if="!g_isToken(card)">
          <div class="d-flex align-items-center">
            <div class="d-flex flex-column align-items-center flex-fill">
              <div class="d-flex justify-content-between aw-tools" v-if="deckbuilder && !g_isOOF(card, currentDeck)">
                <div class="aw-button d-flex align-items-center" v-visible="card.quantite > 0" @click="removeCardFromDeck(card)">
                  <font-awesome-icon :icon="['fa', 'circle-minus']" class="fs-3" />
                </div>
                <div class="aw-quantite fs-4">{{ card.quantite }}</div>              
                <div class="aw-button d-flex align-items-center" v-visible="g_canAddCardToDeck(card, currentDeck)" @click="addCardToDeck(card)">
                  <font-awesome-icon :icon="['fa', 'circle-plus']" class="fs-3" />
                </div>
              </div>
              <div class="mt-2 aw-tools aw-raritycompare d-flex flex-column align-items-center" @click="onShowCardDetail(card)" :title="$t('ui.action.comparerraretes')">
                <font-awesome-icon :icon="['fas', 'code-compare']" class="fs-6" />
              </div>
              <div class="mt-2 aw-tools aw-raritycompare d-flex flex-column align-items-center" @click="e_onToggleFavori(card)" :title="$t('ui.action.addorremovefav')" v-if="user && !deckbuilder && g_isUnique(card)">
                <font-awesome-icon :icon="['fas', 'heart']" style="color: red" v-if="card.favori" />
                <font-awesome-icon :icon="['fas', 'heart']" v-else />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['addcard', 'onshowcarddetail', 'removecard', 'mouseentercard', 'mouseleavecard']);

const addCardToDeck = (pcard) => {
  emit('addcard', pcard);
}
const removeCardFromDeck = (pcard) => {
  emit('removecard', pcard);
}
const onShowCardDetail = (pcard) => {
  emit('onshowcarddetail', pcard);
}
const mouseEnterCard = (pcard) => {
  emit('mouseentercard', pcard);
}
const mouseLeaveCard = (pcard) => {
  emit('mouseleavecard', pcard);
}
</script>

<script>
import { useToast, TYPE } from "vue-toastification"
const toast = useToast()

export default {
  props: {
    user: {
      type: Object,
      required: true
    },
    card: {
      type: Object,
      required: true
    },
    currentDeck: {
      type: Object,
      required: false
    },
    affmissingcollection: Boolean,
    affmissingtrade: Boolean,
    affmissingwant: Boolean,
    emptyplayset: Boolean,
    deckbuilder: Boolean,
  },
  methods: {
    getGridClass() {
      if (this.deckbuilder)
        return "col-12 col-xl-6 col-xxl-4 mb-3";
      return "col-12 col-md-6 col-lg-4 col-xxl-2 mb-3";
    },
    getClassCardCollection()
    {
      if(!this.deckbuilder)
      {
        if(this.card.inMyCollectionTotal < 3 && this.affmissingcollection && this.affmissingcollection) return 'aw-missingcard'
        if(this.card.inMyCollectionTotal - 3 > this.card.inMyTradelistTotal && this.affmissingtrade) return 'aw-missingtradelist'
        if(this.card.inMyCollectionTotal < 3 && !this.card.inMyWantlist && this.affmissingwant) return 'aw-missingwantlist'
      }
      return ''
    },
    e_onToggleFavori(pcard)
    {
      this.g_toggleCardFavori(pcard, (card, perror) => 
      {
        if(perror) toast("Une erreur s'est produite lors de la gestion du favori", { type: TYPE.ERROR })
        else
        {
          toast('La carte a été ' + (card.favori ? 'ajoutée aux favoris' :  'retirée des favoris'), { type: TYPE.SUCCESS })
        }
      })
    }
  }
};
</script>

<style scoped>
.aw-playset {
  display: grid;
  grid-template-columns: 150px 80px 80px repeat(auto-fill, 350px) 100%;
}

.aw-card>div {
  position: relative;
}

.aw-card .aw-collection {
  position: absolute;
  left: 3px;
  bottom: 3px;
  right: 3px;
  border-radius: 3px;
  border: 3px solid black;
  color: white;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 0 15px;
  height: auto;
}

.aw-card .aw-collection.aw-missingcard
{
  background-color: rgba(255, 0, 0, 0.7);
}
.aw-card .aw-collection.aw-missingtradelist
{
  background-color: var(--c-oceantp);
}
.aw-card .aw-collection.aw-missingwantlist
{
  background-color: var(--c-mountaintp);
}

img {
  padding: 0;
}

.aw-cardname {
  text-align: center;
  font-size: 13px;
}
</style>