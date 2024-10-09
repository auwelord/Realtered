<template>
  <div :class="getClassGrid()" v-if="!modeliste">
    <div class="aw-carddeck" @mouseenter="mouseEnterCard(card)" @mouseleave="mouseLeaveCard(card)">
      <img :src="getImageCardPublicUrl(card)" :title="card.name" class="img-fluid aw-alteredcard" />
      <div v-if="!g_isHero(card)" class="aw-quantiteindeck">
        {{ card.quantite }}
      </div>
      <div class="aw-cardoptions ">
        <div class="d-flex align-items-center">
          <div class="d-flex flex-column align-items-center flex-fill">
            <div class="d-flex justify-content-between aw-tools" v-if="!g_isOOF(card, currentDeck)">
              <div class="aw-button d-flex align-items-center" v-visible="card.quantite > 0" @click="removeCardFromDeck(card)">
                <font-awesome-icon :icon="['fa', 'circle-minus']" class="fs-4" />
              </div>
              <div class="aw-quantite fs-4">{{ card.quantite }}</div>              
              <div class="aw-button d-flex align-items-center" v-visible="g_canAddCardToDeck(card, currentDeck)" @click="addCardToDeck(card)">
                <font-awesome-icon :icon="['fa', 'circle-plus']" class="fs-4" />
              </div>
            </div>
            <div class="mt-2 aw-tools aw-raritycompare d-flex flex-column align-items-center" @click="onShowCardDetail(card)" :title="$t('ui.action.comparerraretes')">
              <font-awesome-icon :icon="['fas', 'code-compare']" class="fs-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="!g_isHero(card)" class="col-12 col-xxxl-6 aw-carddecklist">
        <div class="d-flex justify-content-between">
          <div class="aw-comparecard" title="Comparer les raretés" @click="onShowCardDetail(card)">
            <font-awesome-icon :icon="['fas', 'code-compare']" />
          </div>
          <div :class="['d-flex justify-content-between flex-fill aw-carddeck', getClassCardDeckList()]">
            <div class="d-flex" @mouseenter="mouseEnterCard(card)" @mouseleave="mouseLeaveCard(card)">
              <div class="aw-costcarddeck me-3 d-flex align-items-center">{{  card.mainCost }} / {{ card.recallCost }}</div>
              <div class="aw-namecarddeck">{{ card.name }} </div>
            </div>
            <div class="d-flex">
              <div class="aw-addremovecard ps-2 pe-2 me-1 d-flex align-items-center" @click="removeCardFromDeck(card)">-</div>
              <div class="aw-qtecarddeck d-flex align-items-center">{{ card.quantite }} </div>
              <div class="aw-addremovecard ps-2 pe-2 ms-1 d-flex align-items-center" @click="addCardToDeck(card)" v-visible="canAddCard(card)">+</div>
            </div>
          </div>
        </div>
    
    <!-- {{ card.quantite }} - -->
  </div>
</template>

<script setup>
const emit = defineEmits(['addcard', 'removecard', 'mouseentercard', 'mouseleavecard', 'onshowcarddetail']);

const removeCardFromDeck = (pcard) => {
  emit('removecard', pcard);
}
const addCardToDeck = (pcard) => {
  emit('addcard', pcard);
}
const mouseEnterCard = (pcard) => {
  emit('mouseentercard', pcard);
}
const mouseLeaveCard = (pcard) => {
  emit('mouseleavecard', pcard);
}
const onShowCardDetail = (pcard) => {
  emit('onshowcarddetail', pcard);
}
</script>

<script>
export default {
  props: {
    card: {
      type: Object,
      required: true
    },
    currentDeck: {
      type: Object,
      required: true
    },
    modeliste: Boolean,
  },
  data() {
    return {    
    }
  },
  mounted() {
    //this.quantite = this.card.quantite
    //console.log(this.card);
  },
  methods:
  {
    getImageCardPublicUrl(pcard)
    {
      return this.g_isHero(pcard) ? this.g_getImageHeroNotext(pcard) : this.g_getImageCardPublicUrl(pcard)
    },
    canAddCard(pcard)
    {
      return pcard.quantite < 3 && !this.g_isHero(pcard) && !this.g_isUnique(pcard);
    },
    getClassCardDeckList() {
      return "aw-" + this.card.rarity;
    },
    getClassGrid() {
      var classe = "aw-qte" + this.card.quantite + " mt-2 aw-" + this.card.cardType;

      if(this.g_isHero(this.card)) classe += " d-flex col-12 justify-content-md-center";
      else classe += " col-12 col-sm-6 col-lg-3"; //col-xxl-2
      return classe;
    }
  }
};
</script>

<style scoped>

.aw-carddecklist .aw-comparecard
{
  padding: 4px 7px 0 0;
  cursor: pointer;
}

.aw-carddecklist .aw-comparecard:hover
{
  color: var(--c-uniqued2)
}

.aw-carddecklist .aw-addremovecard
{
  transition: all 0.5s;
  border-radius: 3px;
  cursor: pointer;
}

.aw-carddecklist .aw-costcarddeck
{
  padding: 0 6px;
  border-radius: 5px;
  text-wrap: nowrap;
}

.aw-carddecklist .aw-namecarddeck
{
  font-weight: bold;
}

.aw-carddecklist .aw-qtecarddeck
{
  padding: 0 6px;
  border-radius: 5px;
}
.aw-carddecklist div.aw-carddeck.aw-UNIQUE .aw-qtecarddeck,
.aw-carddecklist div.aw-carddeck.aw-UNIQUE .aw-costcarddeck,
.aw-carddecklist div.aw-carddeck.aw-UNIQUE .aw-addremovecard:hover
{
  background-color: var(--c-uniqued2);
}
.aw-carddecklist div.aw-carddeck.aw-RARE .aw-qtecarddeck,
.aw-carddecklist div.aw-carddeck.aw-RARE .aw-costcarddeck,
.aw-carddecklist div.aw-carddeck.aw-RARE .aw-addremovecard:hover
{
  background-color: var(--c-rared3);
}
.aw-carddecklist div.aw-carddeck.aw-COMMON .aw-costcarddeck,
.aw-carddecklist div.aw-carddeck.aw-COMMON .aw-addremovecard:hover
{
  background-color: var(--c-commond2);
}
.aw-carddecklist
{
  position: relative;
}
.aw-carddecklist div.aw-carddeck
{
  padding: 2px 11px;
  color: white;
  border-radius: 9px;
  margin-top: 2px;
}
.aw-carddecklist div.aw-carddeck.aw-UNIQUE
{
  background-color: var(--c-uniqued1);
}
.aw-carddecklist div.aw-carddeck.aw-RARE
{
  background-color: var(--c-rared2);
}
.aw-carddecklist div.aw-carddeck.aw-COMMON
{
  background-color: var(--c-commond1);
}

.aw-carddeck {
  position: relative;
}

.aw-quantiteindeck {
  position: absolute;
  background: white;
  color: black;
  bottom: 3px;
  left: 3px;
  padding: 0px 13px;
  font-size: 25px;
  border-radius: 3px;
  border: 3px solid black;
}
</style>