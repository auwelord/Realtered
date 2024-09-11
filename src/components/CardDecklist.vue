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
  <div v-else-if="g_isHero(card)" class="aw-HERO">
    <div>
      <img :src="getImageCardPublicUrl(card)" :title="card.name" class="img-fluid" />
    </div>
  </div>
  <div v-else class="col-12  aw-carddecklist" @mouseenter="mouseEnterCard(card)" @mouseleave="mouseLeaveCard(card)">
    <div :class="['d-flex justify-content-between', getClassCardDeckList()]">
        <div>
          <BButton size="sm" variant="danger" class="me-1" @click="removeCardFromDeck(card)">
            <font-awesome-icon :icon="['fa', 'circle-minus']" />
          </BButton>
          <BButton size="sm" variant="unique" class="me-1" @click="addCardToDeck(card)" :disabled="!canAddCard(card)">
            <font-awesome-icon :icon="['fa', 'circle-plus']" />
          </BButton>
          <BButton size="sm" variant="rare" class="me-1" @click="onShowCardDetail(card)">
            <font-awesome-icon :icon="['far', 'eye']" />
          </BButton>
          {{ card.quantite }} - {{ card.name }} 
        </div>
        <div><img :src="getImageRarete()" /></div>
    </div>
    <!--( {{  card.elements.MAIN_COST }} / {{  card.elements.RECALL_COST }}) */-->
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
    getImageRarete(){
      return "/src/assets/img/altered/rarities/" + this.card.rarity.toLowerCase() + ".png";
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
.aw-carddecklist
{
  position: relative;
}
.aw-carddecklist > div
{
    color: black;
    margin: 2px 0;
    padding: 10px 8px;
    border-radius: 6px;
}
.aw-carddecklist > div::after
{
  background-repeat: no-repeat;
    background-size: contain;
    position: absolute;
    right: 11px;
    top: 21px;
    content: "";
    width: 40px;
    height: 18px;
    display: block;
}
.aw-carddecklist img
{
  width: 50px;
}

.aw-carddeck {
  position: relative;
}

.aw-HERO img{
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
  border-radius: 20px;
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