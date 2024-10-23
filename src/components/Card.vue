<template>

  <div :class="getGridClass()" :data-ref="card.reference">
    <div :class="['d-flex flex-column align-items-center aw-card', getClassCard()]" @mouseenter="mouseEnterCard(card)" @mouseleave="mouseLeaveCard(card)">
      <div>
        <div class="position-relative">
          <img :src="g_getImageCardPublicUrl(card)" :title="card.name" class="img-fluid aw-alteredcard" />
          <img src="@/assets/img/sparkles.gif" alt="" class="image-sparkles mbm-color-dodge" />
        </div>
        <div :class="['aw-collection', getClassCardCollection()]" v-if="user && (!deckbuilder || globalStore.cardfilter.onlycollec)">
          Collection: {{ card.inMyCollection }}<br>
          <span v-if="!deckbuilder">
            Echangeable: {{ card.echangeable }}<br>
            Tradelist: {{ card.inMyTradelist }}<br>
            Wantlist: {{ card.inMyWantlist }}
          </span>
        </div>
        <div class="aw-cardoptions" v-if="!g_isToken(card)">
          <div class="d-flex align-items-center">
            <div class="d-flex flex-column flex-fill">
              <div class="d-flex justify-content-between aw-tools" v-if="deckbuilder && !g_isOOF(card, currentDeck)">
                <div class="aw-button d-flex align-items-center" v-visible="card.quantite > 0" @click="removeCardFromDeck(card)">
                  <font-awesome-icon :icon="['fa', 'circle-minus']" class="fs-3" />
                </div>
                <div class="aw-quantite fs-4">{{ card.quantite }}</div>
                <div class="aw-button d-flex align-items-center" v-visible="g_canAddCardToDeck(card, currentDeck)" @click="addCardToDeck(card)">
                  <font-awesome-icon :icon="['fa', 'circle-plus']" class="fs-3" />
                </div>
              </div>
              <div class="mt-2 aw-tools d-flex flex-column align-items-center" @click="onShowCardDetail(card)" :title="$t('ui.action.comparerraretes')">
                <font-awesome-icon :icon="['fas', 'code-compare']" class="fs-6" />
              </div>
              <div class="mt-2 aw-tools d-flex flex-column align-items-center" @click="e_onToggleFavori(card)" :title="$t('ui.action.addorremovefav')" v-if="user && !deckbuilder && g_isUnique(card)">
                <font-awesome-icon :icon="['fas', 'heart']" style="color: red" v-if="card.favori" />
                <font-awesome-icon :icon="['fas', 'heart']" v-else />
              </div>
              <div class="mt-2 aw-tools aw-cursor-default d-flex justify-content-between align-items-center" v-if="user && !deckbuilder">
                <font-awesome-icon :icon="['far', 'square-minus']" class="me-2 aw-hoverscale15 aw-cursor-pointer" v-visible="card.inMyCollection > 0" @click="e_changeCollection(-1)"/>
                Collection: {{ card.inMyCollection || 0}}
                <font-awesome-icon :icon="['far', 'square-plus']" class="ms-2 aw-hoverscale15 aw-cursor-pointer" v-visible="!g_isUnique(card) || !card.inMyCollection" @click="e_changeCollection(1)"/>
              </div>
              <div class="mt-2 aw-tools aw-cursor-default d-flex justify-content-between align-items-center" v-if="user && !deckbuilder">
                <font-awesome-icon :icon="['far', 'square-minus']" class="me-2 aw-hoverscale15 aw-cursor-pointer" v-visible="card.echangeable > 0" @click="e_changeEchangeable(-1)" />
                <div>Echangeable: {{ card.echangeable || 0}}</div>
                <font-awesome-icon :icon="['far', 'square-plus']" class="ms-2 aw-hoverscale15 aw-cursor-pointer" v-visible="canAddEchangeable()" @click="e_changeEchangeable(1)"/>
              </div>
              <div class="mt-2 aw-tools aw-cursor-default d-flex justify-content-between align-items-center" v-if="user && !deckbuilder">
                <font-awesome-icon :icon="['far', 'square-minus']" class="me-2 aw-hoverscale15 aw-cursor-pointer" v-visible="card.inMyTradelist > 0" @click="e_changeTrade(-1)"/>
                Trade: {{ card.inMyTradelist || 0 }}
                <font-awesome-icon :icon="['far', 'square-plus']" class="ms-2 aw-hoverscale15 aw-cursor-pointer" v-visible="card.inMyTradelist < card.inMyCollection && (!g_isUnique(card) || !card.inMyTradelist)" @click="e_changeTrade(1)" />
              </div>
              <div class="mt-2 aw-tools aw-cursor-default d-flex justify-content-between align-items-center" v-if="user && !deckbuilder">
                <font-awesome-icon :icon="['far', 'square-minus']" class="me-2 aw-hoverscale15 aw-cursor-pointer" v-visible="card.inMyWantlist > 0" @click="e_changeWant(-1)" />
                <div>Want: {{ card.inMyWantlist || 0}}</div>
                <font-awesome-icon :icon="['far', 'square-plus']" class="ms-2 aw-hoverscale15 aw-cursor-pointer" v-visible="canAddWant()" @click="e_changeWant(1)"/>
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
import { useGlobalStore } from '@/stores/global'
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
    deckbuilder: Boolean,
    pptUnique: Boolean,
  },
  data(){
    return {
      timeoutcollection: null,
      timeouttrade: null,
      timeoutwant: null,
      timeoutechangeable: null,
      globalStore: useGlobalStore(),
    }
  },
  methods: {
    canAddEchangeable()
    {
      if(this.card.inMyCollection == 0 || this.card.echangeable == this.card.inMyCollection) return false
      return true
    },
    canAddWant()
    {
      if(this.g_isUnique(this.card) && (this.card.inMyCollection == 1 || this.card.inMyWantlist == 1)) return false
      return true
    },
    getGridClass() 
    {
      if (this.deckbuilder)
        return "col-12 col-xl-6 col-xxl-4 mb-3";
      return "col-12 col-md-6 col-lg-4 col-xxl-2 mb-3";
    },
    getClassCard()
    {
      return this.card.foiled ? 'aw-foiled' : ''
    },
    getClassCardCollection()
    {
      if(!this.deckbuilder)
      {
        if(this.affmissingcollection && this.isMissingPlayset()) return 'aw-missingcard'
        if(this.affmissingtrade && this.isMissingTrade()) return 'aw-missingtradelist'
        if(this.affmissingwant && this.isMissingWant()) return 'aw-missingwantlist'
      }
      return ''
    },
    isMissingPlayset()
    {
      return (this.g_isUnique(this.card) && this.card.inMyCollectionTotal == 0) || (!this.g_isUnique(this.card) && this.card.inMyCollectionTotal < 3)
    },
    isMissingTrade()
    {
      if(this.g_isUnique(this.card)) return this.card.inMyCollectionTotal > 0 && this.card.inMyTradelistTotal != 1
      return this.card.inMyCollectionTotal - 3 > this.card.inMyTradelistTotal
    },
    isMissingWant()
    {
        if(this.g_isUnique(this.card)) return false
        return this.card.inMyCollectionTotal < 3 && !this.card.inMyWantlist
    },
    e_changeCollection(pqte)
    {
      if(!this.card.inMyCollection) this.card.inMyCollection = 0
      this.card.inMyCollection += pqte
      this.card.inMyCollectionTotal += pqte

      if(this.card.echangeable > this.card.inMyCollection) this.card.echangeable = this.card.inMyCollection
      if(this.card.inMyTradelist > this.card.inMyCollection) this.card.inMyTradelist = this.card.inMyCollection
      if(this.g_isUnique(this.card) && this.card.inMyCollection == 1) this.card.inMyWantlist = 0

      if(this.timeoutcollection) clearTimeout(this.timeoutcollection)
      this.timeoutcollection = this.updateCollection()
    },
    e_changeTrade(pqte)
    {
      if(!this.card.inMyTradelist) this.card.inMyTradelist = 0
      this.card.inMyTradelist += pqte
      this.card.inMyTradelistTotal += pqte

      if(this.timeouttrade) clearTimeout(this.timeouttrade)
      this.timeouttrade = this.updateCollection()
    },
    e_changeEchangeable(pqte)
    {
      if(!this.card.echangeable) this.card.echangeable = 0
      this.card.echangeable += pqte

      if(this.timeoutechangeable) clearTimeout(this.timeoutechangeable)
      this.timeoutechangeable = this.updateCollection()
    },
    e_changeWant(pqte)
    {
      if(!this.card.inMyWantlist) this.card.inMyWantlist = 0
      this.card.inMyWantlist += pqte

      if(this.timeoutwant) clearTimeout(this.timeoutwant)
      this.timeoutwant = this.updateCollection()
    },
    updateCollection()
    {
      return setTimeout(() => {
        this.g_updateCollection([this.card], pdata => {
          if(pdata && pdata.nbupdates == 1) toast("Collection mise à jour pour '" + this.card.name + "'", { type: TYPE.SUCCESS })
          else toast("Une erreur s'est produite lors de la mise à jur de la collection de '" + this.card.name + "'", { type: TYPE.ERROR })
        })  
      }, 1000)
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
.image-sparkles.mbm-color-dodge {
    z-index: 11;
}
.mbm-color-dodge {
    mix-blend-mode: color-dodge;
}

.image-sparkles {
    position: absolute;
    left: 0%;
    top: 0%;
    right: 0%;
    bottom: 0%;
    max-height: 100%;
}

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
.aw-card:hover .aw-collection {
  display: none;
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

.aw-card .image-sparkles
{
  display: none;
}
.aw-card.aw-foiled .image-sparkles
{
  display: block;
}

img {
  padding: 0;
}

.aw-cardname {
  text-align: center;
  font-size: 13px;
}
</style>