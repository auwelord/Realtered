<template>

  <div class="aw-playset" role="rowgroup" v-if="arrayview">
    <div>{{ card.cardType.name }}</div>
    <div>{{ card.rarity.name }}</div>
    <div>{{ card.mainFaction.name }}</div>
    <div>{{ card.name }}</div>
    <div>{{ emptyplayset ? 3 - card.inMyCollection : card.inMyCollection }}</div>
  </div>

  <div :class="getGridClass()" v-else>
    <div class="d-flex flex-column align-items-center aw-card" @mouseenter="mouseEnterCard(card)" @mouseleave="mouseLeaveCard(card)">
      <div>
        <img :src="g_getImageCardPublicUrl(card)" :title="card.name" class="img-fluid aw-alteredcard" />
        <div class="aw-collection" v-if="collection">{{ card.inMyCollection }}</div>
        <div class="aw-cardoptions ">
          <div class="d-flex align-items-center">
            <div class="d-flex flex-column align-items-center flex-fill">
              <div class="d-flex justify-content-between aw-tools" v-if="!g_isOOF(card, currentDeck)">
                <div class="aw-button d-flex align-items-center" v-if="deckbuilder" v-visible="card.quantite > 0" @click="removeCardFromDeck(card)">
                  <font-awesome-icon :icon="['fa', 'circle-minus']" class="fs-3" />
                </div>
                <div class="aw-quantite fs-4" v-if="deckbuilder">{{ card.quantite }}</div>              
                <div class="aw-button d-flex align-items-center" v-if="deckbuilder" v-visible="g_canAddCardToDeck(card, currentDeck)" @click="addCardToDeck(card)">
                  <font-awesome-icon :icon="['fa', 'circle-plus']" class="fs-3" />
                </div>
              </div>
              <div class="mt-2 aw-tools aw-raritycompare d-flex flex-column align-items-center" @click="onShowCardDetail(card)" title="Comparer les raretés">
                <font-awesome-icon :icon="['fas', 'code-compare']" class="fs-6" />
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
    arrayview: Boolean,
    emptyplayset: Boolean,
    deckbuilder: Boolean,
    collection: Boolean,
  },
  methods: {
    getGridClass() {
      if (this.deckbuilder)
        return "col-12 col-xl-6 col-xxl-4 mb-3";
      return "col-12 col-md-6 col-lg-4 col-xxl-2 mb-3";
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
  color: black;
  font-size: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
  border: 3px solid black;
  background-color: white;
  padding: 0 15px;
}

img {
  padding: 0;
}

.aw-cardname {
  text-align: center;
  font-size: 13px;
}

@media screen and (max-width: 1920px) {
  .aw-card .aw-collection {
    width: 3vw;
    height: 2vw;
  }
}

@media screen and (max-width: 1200px) {
  .aw-card .aw-collection {
    width: 4vw;
    height: 3vw;
  }
}

@media screen and (max-width: 992px) {
  .aw-cardname {
    font-size: 33px;
  }

  .aw-card .aw-collection {
    width: 6vw;
    height: 5vw;
  }
}
</style>