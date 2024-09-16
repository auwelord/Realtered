<template>
  <div :class="getClassGrid()" v-if="!modeliste">
    <div class="aw-carddeck">
      <img :src="getImageCardPublicUrl(card)" :title="card.name" class="img-fluid aw-alteredcard" />
      <div v-if="!g_isHero(card)" class="aw-quantite">
        {{ card.quantite }}
      </div>
      <div class="aw-deckbuilder d-flex flex-column align-items-stretch">
        <BButton size="sm" variant="unique" class="text-nowrap flex-fill" :disabled="!canAddCard(card)" @click="addCardToDeck(card)">
          <font-awesome-icon :icon="['fa', 'circle-plus']" class="fs-3" />
        </BButton>
        <BButton size="sm" variant="danger" class="text-nowrap flex-fill" v-if="card.quantite > 0" @click="removeCardFromDeck(card)">
          <font-awesome-icon :icon="['fa', 'circle-minus']" class="fs-3" />
        </BButton>
        <BButton variant="rare" size="sm" class="text-nowrap flex-fill" @click="onShowCardDetail(card)">
          <font-awesome-icon :icon="['far', 'eye']" class="fs-3" />
        </BButton>
      </div>
    </div>
    <div class="d-flex flex-column fs-7" v-if="!g_isHero(card) && qtesuccessproba != null">
      <div>>= {{ qtesuccessproba }} : {{ proba[2] }}</div>
      <div>= {{ qtesuccessproba }} : {{ proba[1] }}</div>
      <div><= {{ qtesuccessproba }} : {{ proba[0] }}</div>
      <div>0 : {{ proba[3] }}</div>
    </div>
  </div>
  <div v-else-if="!g_isHero(card)" class="col-12 col-xxxl-6 aw-carddecklist">
        <div class="d-flex justify-content-between">
          <div class="aw-comparecard" title="Comparer les raretés" @click="onShowCardDetail(card)">
            <font-awesome-icon :icon="['fas', 'code-compare']" />
          </div>
          <div :class="['d-flex justify-content-between flex-fill aw-carddeck', getClassCardDeckList()]">
            <div class="d-flex" @mouseenter="mouseEnterCard(card)" @mouseleave="mouseLeaveCard(card)">
              <div class="aw-costcarddeck me-3">{{  card.mainCost }} / {{ card.recallCost }}</div>
              <div class="aw-namecarddeck">{{ card.name }} </div>
            </div>
            <div class="d-flex">
              <div class="aw-addremovecard ps-2 pe-2 me-1" @click="removeCardFromDeck(card)">-</div>
              <div class="aw-qtecarddeck">{{ card.quantite }} </div>
              <div class="aw-addremovecard ps-2 pe-2 ms-1" @click="addCardToDeck(card)" v-visible="canAddCard(card)">+</div>
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
    qtesuccessproba: 0,
    proba: {
      type: Object,
      required: false
    },
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
.aw-decklistpersos .aw-carddecklist:nth-child(2),
.aw-decklistsorts .aw-carddecklist:nth-child(2),
.aw-decklistpermas .aw-carddecklist:nth-child(2)
{
  /*margin-top: 15px;*/
}

.aw-carddeck {
  position: relative;
}

/*.aw-carddeck .aw-quantite */
.aw-quantite {
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

.aw-carddeck:hover .aw-deckbuilder {
  width: 75%;
  left: 25%;
  opacity: 0.80;
  padding: 3px;
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
  height: 33.33%;
  border-radius: 0;
}
</style>