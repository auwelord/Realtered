<template>

  <div class="aw-playset" role="rowgroup" v-if="arrayview">
    <div>{{ card.cardType.name }}</div>
    <div>{{ card.rarity.name }}</div>
    <div>{{ card.mainFaction.name }}</div>
    <div>{{ card.name }}</div>
    <div>{{ emptyplayset ? 3 - card.inMyCollection : card.inMyCollection }}</div>
  </div>

  <div :class="getGridClass()" v-else>
    <div class="d-flex flex-column align-items-center aw-card">
      <div>
        <img :src="card.imagePath" :title="card.name" class="img-fluid" />
        <div class="aw-collection" v-if="collection">{{ card.inMyCollection }}</div>
        <div class="aw-deckbuilder d-flex flex-column align-items-stretch" v-if="deckbuilder">
          <BButton size="sm" variant="unique" class="text-nowrap flex-fill" :disabled="!g_canAddCardToDeck(card, currentDeck)" @click="addCardToDeck(card)">
            <font-awesome-icon :icon="['fa', 'circle-plus']" class="fs-3" />
          </BButton>
          <BButton size="sm" variant="danger" class="text-nowrap flex-fill" :disabled="card.quantite == 0" @click="removeCardFromDeck(card)">
            <font-awesome-icon :icon="['fa', 'circle-minus']" class="fs-3" />
          </BButton>
          <BButton variant="rare" size="sm" class="text-nowrap flex-fill" @click="onShowCardDetail(card)">
            <font-awesome-icon :icon="['far', 'eye']" class="fs-3" />
          </BButton>
        </div>
      </div>
      <div class="aw-cardname">{{ card.name }}</div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['addcard', 'onshowcarddetail', 'removecard']);

const addCardToDeck = (pcard) => {
  emit('addcard', pcard);
}
const removeCardFromDeck = (pcard) => {
  emit('removecard', pcard);
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

.aw-card:hover .aw-deckbuilder {
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
  height: 50%;
  border-radius: 0;
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