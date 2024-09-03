<template>
  <Menu :user="user" @deconnect="deconnecterUser" />

  <div class="aw-wrapper">
    <img src="@/assets/img/collectionfond.png" class="aw-fond" />

    <div class="container-fluid pt-2"> <!--begin::Row-->
      <div class="row">
        <div class="col-md-3">
          <div class="col-12" v-if="deckbuilder">
            <div class="card card-outline card-info mb-1">
              <div class="card-header">
                <h3 class="card-title">Mes decks</h3>
                <div class="card-tools">
                  <BButton @click="createDeck" variant="primary" size="sm" v-if="!creatingDeck">
                    <font-awesome-icon :icon="['fas', 'circle-plus']" class="me-2" />Créer un deck
                  </BButton>
                </div>
              </div> <!-- /.card-header -->
              <div class="card-body">
                <Multiselect v-if="!creatingDeck" v-model="currentSelectedDeck" :close-on-select="true" :options="decks"
                  @select="onSelectCurrentDeck" @clear="onClearCurrentDeck" />
                <div v-else>
                  <div class="input-group">
                    <input required id="awid-fdeckname" v-model="newDeckName" type="text" class="form-control"
                      placeholder="Nom du deck">
                  </div>
                  <div class="d-flex justify-content-end">
                    <BButton @click="cancelCreateDeck" variant="tertiary" size="sm" class="mt-2 me-2">
                      <font-awesome-icon :icon="['fas', 'check']" class="me-2" />Annuler
                    </BButton>
                    <BButton @click="checkCreateDeck" variant="success" size="sm" class="mt-2">
                      <font-awesome-icon :icon="['fas', 'check']" class="me-2" />Valider
                    </BButton>
                  </div>
                </div>
              </div> <!-- /.card-body -->
            </div>
          </div>
          <div class="col-12">
            <div class="card card-outline card-warning">
              <div class="card-header" v-if="currentFaction != ''">
                <div class="card-tools">
                  <BButton @click="searchCards(false, false, false)" variant="unique" size="sm"><font-awesome-icon
                      :icon="['fas', 'magnifying-glass']" class="me-2" />Rechercher</BButton>
                  <BButton @click="searchPlayset" variant="common" size="sm ms-2" v-if="bearer && !deckbuilder">
                    <font-awesome-icon :icon="['fas', 'magnifying-glass-arrow-right']" class="me-2" />Playset
                  </BButton>
                </div>
              </div> <!-- /.card-header -->
              <div class="card-body">
                <div class="card-group justify-content-between aw-factionsel">
                  <a href="#" id="AX" :class="['mb-2 aw-axiom', isCurrentAxiom() ? 'aw-selected' : '']"
                    @click="changeFaction"><img src="@/assets/img/altered/factions/axiom.webp" class="aw-faction" /></a>
                  <a href="#" id="BR" :class="['mb-2 aw-bravos', isCurrentBravos() ? 'aw-selected' : '']"
                    @click="changeFaction"><img src="@/assets/img/altered/factions/bravos.webp"
                      class="aw-faction" /></a>
                  <a href="#" id="LY" :class="['mb-2 aw-lyra', isCurrentLyra() ? 'aw-selected' : '']"
                    @click="changeFaction"><img src="@/assets/img/altered/factions/lyra.webp" class="aw-faction" /></a>
                  <a href="#" id="MU" :class="['mb-2 aw-muna', isCurrentMuna() ? 'aw-selected' : '']"
                    @click="changeFaction"><img src="@/assets/img/altered/factions/muna.webp" class="aw-faction" /></a>
                  <a href="#" id="OR" :class="['mb-2 aw-ordis', isCurrentOrdis() ? 'aw-selected' : '']"
                    @click="changeFaction"><img src="@/assets/img/altered/factions/ordis.webp" class="aw-faction" /></a>
                  <a href="#" id="YZ" :class="['mb-2 aw-yzmir', isCurrentYzmir() ? 'aw-selected' : '']"
                    @click="changeFaction"><img src="@/assets/img/altered/factions/yzmir.webp" class="aw-faction" /></a>
                </div>
                <div class="input-group mt-4">
                  <input type="text" v-model="currentName" class="form-control" placeholder="Nom de carte" />
                </div>
                <hr />
                <div class="card-title float-none mt-3">Rareté</div>
                <div class="d-flex justify-content-evenly aw-raritysel mt-2">
                  <a href="javascript:" id="COMMON" :class="['aw-common', isSelectedCommon ? 'aw-selected' : '']"
                    @click="selectCommon"><img src="@/assets/img/altered/rarities/common.png" class="aw-rarity" /></a>
                  <a href="javascript:" id="RARE" :class="['aw-rare', isSelectedRare ? 'aw-selected' : '']"
                    @click="selectRare"><img src="@/assets/img/altered/rarities/rare.png" class="aw-rarity" /></a>
                  <a href="javascript:" id="UNIQUE" :class="['aw-unique', isSelectedUnique ? 'aw-selected' : '']"
                    @click="selectUnique"><img src="@/assets/img/altered/rarities/unique.png" class="aw-rarity" /></a>
                </div>

                <hr />
                <div class="card-title float-none mt-3">Type</div>
                <div class="card-group justify-content-evenly aw-type mt-2">
                  <a href="javascript:" id="CHARACTER"
                    :class="['aw-character d-flex flex-column align-items-center mb-3', isSelectedCharacter ? 'aw-selected' : '']"
                    @click="selectCharacter"><font-awesome-icon :icon="['fas', 'person-walking']"
                      class="fs-3" /><span>Personnages</span></a>
                  <a href="javascript:" id="SPELL"
                    :class="['aw-spell d-flex flex-column align-items-center mb-3', isSelectedSpell ? 'aw-selected' : '']"
                    @click="selectSpell"><font-awesome-icon :icon="['fas', 'wand-magic-sparkles']"
                      class="fs-3" /><span>Sorts</span></a>
                  <a href="javascript:" id="PERMANENT"
                    :class="['aw-permanent d-flex flex-column align-items-center mb-3', isSelectedPermanent ? 'aw-selected' : '']"
                    @click="selectPermanent"><font-awesome-icon :icon="['fas', 'building-shield']"
                      class="fs-3" /><span>Permanents</span></a>
                  <a href="javascript:" id="HERO"
                    :class="['aw-hero d-flex flex-column align-items-center mb-3', isSelectedHero ? 'aw-selected' : '']"
                    @click="selectHero"><font-awesome-icon :icon="['fas', 'mask']" class="fs-3" /><span>Héros</span></a>
                </div>

                <hr />
                Mots-clés :
                <Multiselect v-model="currentKeywords" mode="tags" class="mb-2"
                  :close-on-select="true" 
                  :create-option="true" 
                  :searchable="true"
                  :options="keywords" 
                  @change="onChangeKeywords" />
                
                Sous-types :
                <Multiselect v-model="currentSoustypes" mode="tags" class="mb-2"
                  :close-on-select="true" 
                  :create-option="true" 
                  :searchable="true"
                  :options="soustypes" 
                  @change="onChangeSoustypes" />
                
                Editions :
                <Multiselect v-model="currentEditions" mode="tags" class="mb-2"
                  :close-on-select="true" 
                  :create-option="true" 
                  :options="editions" 
                  @change="onChangeEditions" />

                Trier par :
                <Multiselect v-model="currentSort" mode="tags" :close-on-select="true" :create-option="true"
                  :options="sortingTypes" @change="onChangeSorting" />

                <div class="mt-3" v-if="bearer && !deckbuilder">
                  <b-form-checkbox id="emptyplayset" v-model="emptyplayset" name="emptyplayset">Playsets non complet
                    uniquement</b-form-checkbox>
                </div>
              </div>
            </div>
            <!-- /.card-body -->
          </div> <!-- /.card -->
          <div class="col-12">
            <div class="card card-outline card-danger mt-1">
              <div class="card-header">
                <h3 class="card-title">Coût de main</h3>
              </div> <!-- /.card-header -->
              <div class="card-body">
                <div class="d-flex flex-column ">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="fs-3">{{ handCost }}</div>
                    <div>
                      <BFormCheckbox v-model="handCostOrMore" value="ouplus" @change="onChangeMainCostOrMore">ou plus
                      </BFormCheckbox>
                    </div>
                    <div>
                      <BFormCheckbox v-model="handCostOrMore" value="oumoins" @change="onChangeMainCostOrMore">ou moins
                      </BFormCheckbox>
                    </div>
                  </div>
                  <div class="aw-slider aw-handcost">
                    <input type="range" id="handCost" v-model="handCost" class="w-100 mt-0" min="1" max="10" step="1"
                      value="1" @change="onChangeCost" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="card card-outline card-danger mt-1">
              <div class="card-header">
                <h3 class="card-title">Coût de réserve</h3>
              </div> <!-- /.card-header -->
              <div class="card-body">
                <div class="d-flex flex-column ">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="fs-3">{{ reserveCost }}</div>
                    <div>
                      <BFormCheckbox v-model="reserveCostOrMore" value="ouplus" @change="onChangeRecallCostOrMore">ou
                        plus</BFormCheckbox>
                    </div>
                    <div>
                      <BFormCheckbox v-model="reserveCostOrMore" value="oumoins" @change="onChangeRecallCostOrMore">ou
                        moins</BFormCheckbox>
                    </div>
                  </div>
                  <div class="aw-slider aw-reservecost">
                    <input type="range" id="reserveCost" v-model="reserveCost" class="w-100 mt-0" min="1" max="10"
                      step="1" value="1" @change="onChangeCost" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12">
            <div v-if="isSelectedCharacter" class="card card-outline card-danger mt-1">
              <div class="card-header">
                <h3 class="card-title">Patates</h3>
              </div> <!-- /.card-header -->
              <div class="card-body aw-stats">
                <div class="d-flex flex-column ">
                  <div class="card-group justify-content-between align-items-center">
                    <div><i class="altered-forest fs-5 me-2"></i><span class="fs-3">{{ forest }}</span></div>
                    <div>
                      <BFormCheckbox v-model="forestOrMore" value="ouplus" @change="onChangeForestOrMore">ou plus
                      </BFormCheckbox>
                    </div>
                    <div>
                      <BFormCheckbox v-model="forestOrMore" value="oumoins" @change="onChangeForestOrMore">ou moins
                      </BFormCheckbox>
                    </div>
                  </div>
                  <div class="aw-slider">
                    <input type="range" id="forest" v-model="forest" class="w-100" min="0" max="10" step="1" value="0"
                      @change="onChangeStat" />
                  </div>
                  <div class="card-group justify-content-between align-items-center mt-2">
                    <div><i class="altered-mountain fs-5 me-2"></i><span class="fs-3">{{ mountain }}</span></div>
                    <div>
                      <BFormCheckbox v-model="mountainOrMore" value="ouplus" @change="onChangeMountainOrMore">ou plus
                      </BFormCheckbox>
                    </div>
                    <div>
                      <BFormCheckbox v-model="mountainOrMore" value="oumoins" @change="onChangeMountainOrMore">ou moins
                      </BFormCheckbox>
                    </div>
                  </div>
                  <div class="aw-slider">
                    <input type="range" id="mountain" v-model="mountain" class="w-100" min="0" max="10" step="1"
                      value="0" @change="onChangeStat" />
                  </div>
                  <div class="card-group justify-content-between align-items-center mt-2">
                    <div><i class="altered-water fs-5 me-2"></i><span class="fs-3">{{ water }}</span></div>
                    <div>
                      <BFormCheckbox v-model="waterOrMore" value="ouplus" @change="onChangeWaterOrMore">ou plus
                      </BFormCheckbox>
                    </div>
                    <div>
                      <BFormCheckbox v-model="waterOrMore" value="oumoins" @change="onChangeWaterOrMore">ou moins
                      </BFormCheckbox>
                    </div>
                  </div>
                  <div class="aw-slider">
                    <input type="range" id="water" v-model="water" class="w-100" min="0" max="10" step="1" value="0"
                      @change="onChangeStat" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div :class="[deckbuilder && currentSelectedDeck != null ? 'col-md-3' : 'col-md-9']">
          <div class="container-fluid">
            <div class="row" v-if="!hasResult() && !loading && !imagePathFullsize && !uiparams.afficherstats">
              <img src="/src/assets/img/altered_kojo.png" alt="" class="img-fluid" />
            </div>
            <div v-if="!uiparams.afficherstats" :class="['row mb-3 aw-imgapercu', imagePathFullsize ? 'aw-imageapon' : '']">
              <div class="col-12">
                <div class="sticky">
                  <img :src="imagePathFullsize" alt="" class="img-fluid " />
                </div>
              </div>
            </div>
            <div v-else-if="currentDeck && deckbuilder">
              <DeckStats :currentDeck="currentDeck" v-if="renderStatComponent"/>
            </div>
            <div v-if="!uiparams.afficherstats">
              <div :class="['row aw-resultsearch', imagePathFullsize ? 'aw-imageapon' : '']">
                <Card v-for="card in fetchedCards" :key="card.id" :card="card" :arrayview="arrayview"
                  :emptyplayset="emptyplayset" :deckbuilder="deckbuilder && currentSelectedDeck != null"
                  :collection="bearer != ''" :currentDeck="currentDeck" @addcard="addCard" @removecard="removeCard"
                  @onshowcarddetail="onshowcarddetail" />
              </div>
              <div class="row d-flex p-2">
                <BButton v-if="hasMore && currentPage > 1 && !loading" @click="fetchCards" variant="unique" size="sm">
                  <font-awesome-icon :icon="['far', 'circle-down']" class="me-2" />Voir Plus
                </BButton>
                <div v-if="loading">
                  <Loader />
                </div>
              </div>
              <div class="row float-end p-2" v-if="arrayview">
                <BButton v-if="!loading && hasResult()" @click="exportCSV" variant="common" size="sm">
                  <font-awesome-icon :icon="['far', 'circle-down']" class="me-2" />Exporter (.csv)
                </BButton>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6" v-if="deckbuilder && currentDeck">
          <div :class="['card card-outline card-primary mb-1 aw-decklist', fullscreendecklist ? 'aw-fullscreen' : '']">
            <div class="card-header">
              <h3 class="card-title" v-if="currentDeck">{{ currentDeck.name }}</h3>
              <div class="card-tools">
                <span v-if="!fullscreendecklist">
                  Mode liste
                  <label class="switch me-2">
                    <input type="checkbox" v-model="uiparams.modeliste" @change="storeModeListe">
                    <span class="slider round"></span>
                  </label>

                  <BButton @click="saveDeck()" variant="unique" size="sm" class="me-2" v-if="user">
                      <font-awesome-icon :icon="['far', 'floppy-disk']" class="me-2" />Enregistrer
                  </BButton>
                  <BButton @click="showModalDeleteDeck()" variant="danger" size="sm" class="me-2" v-if="user"><font-awesome-icon
                      :icon="['far', 'trash-can']" /></BButton>
                    </span>
                  <BButton @click="onFullscreenDecklist()" variant="secondary" size="sm"><font-awesome-icon :icon="['fas', 'expand']" /></BButton>
              </div>
            </div> <!-- /.card-header -->
            <div class="card-body">
              <div class="aw-probapioche" v-if="!fullscreendecklist">
                  Proba en main de départ
                  <Multiselect v-model="qtesuccessproba" :close-on-select="true" :options="[1,2,3]" />
              </div>
              <div class="aw-deckstat float-start">
                <span v-if="!fullscreendecklist">
                  <label class="switch me-2">
                    <input type="checkbox" v-model="uiparams.afficherstats" @change="onChangeAfficherStats"/>
                    <span class="slider round"></span>
                  </label><font-awesome-icon :icon="['fas', 'chart-column']" class="me-2" />Afficher les stats
                </span>

                <div class="mt-2">
                  Cartes : {{ getTotalCardsCurrentDeck() }}
                </div>
                <div class="mt-2">
                  Communes : {{ getTotalCommunesCurrentDeck() }}
                </div>
                <div>
                  Rares : {{ getTotalRaresCurrentDeck() }}
                </div>
                <div>
                  Uniques : {{ getTotalUniquesCurrentDeck() }}
                </div>
                <div class="mt-2">
                  Personnages : {{ getTotalPersosCurrentDeck() }}
                </div>
                <div>
                  Sorts : {{ getTotalSortsCurrentDeck() }}
                </div>
                <div>
                  Permanents : {{ getTotalPermasCurrentDeck() }}
                </div>
              </div>
              <div class="d-flex flex-column">
                <div class="row">
                  <div class="aw-herodeck">
                    <CardDecklist v-for="card in getHeroCurrentDeck()" :card="card" @addcard="addCard"
                      @removecard="removeCard" @mouseentercard="mouseenterCard" @mouseleavecard="mouseleaveCard" @onshowcarddetail="onshowcarddetail"
                      :modeliste="uiparams.modeliste" :fullscreendecklist="fullscreendecklist" :currentDeck="currentDeck"/>
                  </div>
                </div>
                <div :class="[fullscreendecklist ? 'row' : '']">
                  <div :class="[fullscreendecklist ? 'col-4' : '']">
                      <div class="row mt-2 pb-2 aw-decklistpersos">
                        <div class="col-12 fs-4 d-flex justify-content-center aw-titletypedecklist">Personnages</div>
                        <CardDecklist v-for="card in getPersosCurrentDeck()" :card="card" @addcard="addCard"
                          @removecard="removeCard" @mouseentercard="mouseenterCard" @mouseleavecard="mouseleaveCard"
                          @onshowcarddetail="onshowcarddetail" :modeliste="uiparams.modeliste" :fullscreendecklist="fullscreendecklist"
                          :currentDeck="currentDeck" :qtesuccessproba="qtesuccessproba" :proba="getProba(card)"/>
                      </div>
                  </div>
                  <div :class="[fullscreendecklist ? 'col-4' : '']">
                    <div class="row mt-2 pb-2 aw-decklistsorts">
                      <div class="col-12 fs-4 d-flex justify-content-center aw-titletypedecklist">Sorts</div>
                      <CardDecklist v-for="card in getSortsCurrentDeck()" :card="card" @addcard="addCard"
                        @removecard="removeCard" @mouseentercard="mouseenterCard" @mouseleavecard="mouseleaveCard"
                        @onshowcarddetail="onshowcarddetail" :modeliste="uiparams.modeliste" :fullscreendecklist="fullscreendecklist"
                        :currentDeck="currentDeck" :qtesuccessproba="qtesuccessproba" :proba="getProba(card)"/>
                    </div>
                  </div>
                  <div :class="[fullscreendecklist ? 'col-4' : '']">
                    <div class="row mt-2 pb-2 aw-decklistpermas">
                      <div class="col-12 fs-4 d-flex justify-content-center aw-titletypedecklist">Permanents</div>
                      <CardDecklist v-for="card in getPermanentsCurrentDeck()" :card="card" @addcard="addCard"
                        @removecard="removeCard" @mouseentercard="mouseenterCard" @mouseleavecard="mouseleaveCard"
                        @onshowcarddetail="onshowcarddetail" :modeliste="uiparams.modeliste" :fullscreendecklist="fullscreendecklist"
                        :currentDeck="currentDeck" :qtesuccessproba="qtesuccessproba" :proba="getProba(card)"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <BModal v-model="modalDeleteDeck" @ok="deleteDeck" centered cancel-title="Annuler" ok-title="Supprimer"
    ok-variant="danger" title="Supprimer un deck">
    Etes-vous sûr de vouloir supprimer le deck ?
  </BModal>

  <BModal v-model="afficherDetails" size="fullscreen" hide-footer id="awid-carddetail" @hidden="onHideModalDetail" class="aw-modalecarddet">
    <CardDetail :card="currentCardDetail" :currentDeck="currentDeck" v-if="currentCardDetail && currentDeck"
      @addcard="addCard" @removecard="removeCard" />
  </BModal>
</template>

<style src="@vueform/multiselect/themes/default.css"></style>

<script>
import Menu from './Menu.vue';
import axios from 'axios';
import Card from './Card.vue';
import Loader from './icons/Loader.vue';
import CardDecklist from './CardDecklist.vue';
import CardDetail from './CardDetail.vue';
import DeckStats from './DeckStats.vue';
import { supabase } from '@/db/client'

export default {
  name: 'Collection',
  props: {
    deckbuilder: false,
  },
  data() {
    return {
      database: true,
      user: null,
      fullscreendecklist: false,
      renderStatComponent: true,
      isSelected: true,
      currentFaction: '',
      isSelectedCharacter: false,
      isSelectedPermanent: false,
      isSelectedSpell: false,
      isSelectedHero: false,
      isSelectedCommon: false,
      isSelectedRare: false,
      isSelectedUnique: false,
      currentName: '',
      currentSort: ["translations.name"],
      fetchedCards: [],
      itemsPerPage: 12,
      arrayview: false,
      loading: false,
      currentPage: 1,
      hasMore: true,
      handCost: 1,
      handCostOrMore: "ouplus",
      reserveCost: 1,
      reserveCostOrMore: "ouplus",
      forest: 0,
      forestOrMore: "ouplus",
      water: 0,
      waterOrMore: "ouplus",
      mountain: 0,
      mountainOrMore: "ouplus",
      emptyplayset: false,
      modalDeleteDeck: false,
      uiparams: {
        modeliste: false,
        afficherstats: false
      },
      imagePathFullsize: null,
      afficherDetails: false,
      oldAfficherStats: false,
      sortingTypes: [
        { value: 'translations.name', label: 'Nom Asc.' },
        { value: 'mainCost', label: 'Mana Asc.' },
        { value: 'recallCost', label: 'Réserve Asc.' },
        { value: 'translations.name,0', label: 'Nom Desc.' },
        { value: 'mainCost,0', label: 'Mana Desc.' },
        { value: 'recallCost,0', label: 'Réserve Desc.' },
      ],
      csv: [],
      decks: [],
      currentDeck: null,
      currentSelectedDeck: null,
      creatingDeck: false,
      newDeckName: null,
      currentCardDetail: null,
      currentKeywords: null,
      currentEditions:  ["COREKS"],
      currentSoustypes: null,
      keywords :this.g_getKeywordsOptions(),
      editions :[
        { value: 'COREKS', label: 'Au-delà des portes - KS' },
        { value: 'CORE', label: 'Au-delà des portes' },
      ],
      soustypes : this.g_getSubtypesOptions(),
      qtesuccessproba: null,
      bearer: "", //"eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJDMFo0V3JVWE1xT2JtMy1CTU8xRFV5YktidFA2bldLb2VvWmE1UGJuZHhZIn0.eyJleHAiOjE3MjQ4NjYxMzAsImlhdCI6MTcyNDg2MjUzMCwiYXV0aF90aW1lIjoxNzI0Njc0NTgzLCJqdGkiOiJiNmIyYWVmMC1kMjM5LTRjODAtODc3MC05ZDZjNGY3NThjYjYiLCJpc3MiOiJodHRwczovL2F1dGguYWx0ZXJlZC5nZy9yZWFsbXMvcGxheWVycyIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJjMDlkZTkxOS02ZjRlLTQ0MjAtYjIwZi1hNGIwM2ZiZGI2OWEiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJ3ZWIiLCJzZXNzaW9uX3N0YXRlIjoiNGFlNjdkNzktZjgxYi00NGQzLTg4MWEtZjY3YjAzMDg3MzUyIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2F1dGguYWx0ZXJlZC5nZyIsImh0dHBzOi8vd3d3LmFsdGVyZWQuZ2ciXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtcGxheWVycyIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwic2lkIjoiNGFlNjdkNzktZjgxYi00NGQzLTg4MWEtZjY3YjAzMDg3MzUyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6ImF1d2Vsb3JkQGdtYWlsLmNvbSIsImVtYWlsIjoiYXV3ZWxvcmRAZ21haWwuY29tIn0.p3jvws1b8phCQUfVd5F5eDvrEjd-o_nrZMbyHi3xeKkFXIDblAqx3KEAaABctSwxZcREUreGhClOwXRCVIsnBeCsPAtoEhWNftr-oL2g68gpb6lOO6x_bb_ZyE-oOXwiTJcHM8vYxBGc2LCNURDFHtQfBgM4kuf87AVG1NltaqrDUV0UhmP94ud4UZTTJDO_UMCUWaGuhsiWilUssCckPfLng0-T9Nd6272168fyoefgIwOZG6HWUOyZHh-5O24tVdKGBTrVA0zyAF-POg2ADxAHj7fjIj7mYC5c9oVxHSAT1oFQ4UPlliGhlO3CeKqMDmNdgBXoWLEfh1hOoMnajQ"
    };
  },
  mounted() {
    this.g_retrieveuser(puser => this.user = puser);

    //axios.get('https://api.altered.gg/cards/filter-data', {}).then(response => console.log(response));
    //axios.get('https://qr.altered.gg/ALT_COREKS_B_MU_15_C', {}).then(response => console.log(response));
    
    const storeduiparams = localStorage.getItem("uiparams");
    if(storeduiparams) this.uiparams = JSON.parse(storeduiparams);

    var filters = JSON.parse(localStorage.getItem("filters"));
    if (!filters) {
      filters = {
        isSelectedCharacter: false,
        isSelectedPermanent: false,
        isSelectedSpell: false,
        isSelectedHero: false,
        isSelectedCommon: false,
        isSelectedRare: false,
        isSelectedUnique: false,
        currentSort: ["translations.name"],
        currentEditions: ["COREKS"],
        currentSoustypes: [],
        handCost: 1,
        handCostOrMore: "ouplus",
        reserveCost: 1,
        reserveCostOrMore: "ouplus",
        forest: 0,
        forestOrMore: "ouplus",
        water: 0,
        waterOrMore: "ouplus",
        mountain: 0,
        mountainOrMore: "ouplus",
      };
      localStorage.setItem("filters", JSON.stringify(filters));
    }

    this.isSelectedCharacter = filters.isSelectedCharacter;
    this.isSelectedPermanent = filters.isSelectedPermanent;
    this.isSelectedSpell = filters.isSelectedSpell;
    this.isSelectedHero = filters.isSelectedHero;
    this.isSelectedCommon = filters.isSelectedCommon;
    this.isSelectedRare = filters.isSelectedRare;
    this.isSelectedUnique = filters.isSelectedUnique;
    this.currentSort = filters.currentSort;
    this.currentKeywords = filters.currentKeywords;
    this.currentEditions = filters.currentEditions;
    this.currentSoustypes = filters.currentSoustypes;
    this.handCost = filters.handCost;
    this.handCostOrMore = filters.handCostOrMore;
    this.reserveCost = filters.reserveCost;
    this.reserveCostOrMore = filters.reserveCostOrMore;
    this.forest = filters.forest;
    this.forestOrMore = filters.forestOrMore;
    this.water = filters.water;
    this.waterOrMore = filters.waterOrMore;
    this.mountain = filters.mountain;
    this.mountainOrMore = filters.mountainOrMore;

    this.loadDecks();
    //this.loadMore(); // Charger les premiers éléments
    //window.addEventListener('scroll', this.handleScroll); // Ajouter l'écouteur d'événements pour le scroll
  },
  methods: {
    deconnecterUser(){
      this.g_deconnecter(() => this.user = null);
    },
    onFullscreenDecklist(){
      this.fullscreendecklist = !this.fullscreendecklist;
    },
    onChangeFilter() {
      var filters = JSON.parse(localStorage.getItem("filters"));
      filters.water = this.water;
      filters.mountain = this.mountain;
      filters.forest = this.forest;
      filters.handCost = this.handCost;
      filters.reserveCost = this.reserveCost;
      filters.isSelectedCharacter = this.isSelectedCharacter;
      filters.isSelectedSpell = this.isSelectedSpell;
      filters.isSelectedPermanent = this.isSelectedPermanent;
      filters.isSelectedHero = this.isSelectedHero;
      filters.handCostOrMore = this.handCostOrMore;
      filters.reserveCostOrMore = this.reserveCostOrMore;
      filters.forestOrMore = this.forestOrMore;
      filters.mountainOrMore = this.mountainOrMore;
      filters.waterOrMore = this.waterOrMore;
      filters.currentSort = this.currentSort;
      filters.currentKeywords = this.currentKeywords;
      filters.currentEditions = this.currentEditions;
      filters.currentSoustypes = this.currentSoustypes;
      filters.isSelectedCommon = this.isSelectedCommon;
      filters.isSelectedRare = this.isSelectedRare;
      filters.isSelectedUnique = this.isSelectedUnique;
      localStorage.setItem("filters", JSON.stringify(filters));
    },
    getProba(pcard)
    {
      return this.g_getProbaMainDeDepart(this.qtesuccessproba, pcard, this.currentDeck)
    },
    async refreshStatComponent()
    {
      this.renderStatComponent = false;
      // Then, wait for the change to get flushed to the DOM
      await this.$nextTick();
      // Add MyComponent back in
      this.renderStatComponent = true;
    },
    storeUiparams()
    {
      var uiparams = JSON.parse(localStorage.getItem("uiparams"));
      if(!uiparams) uiparams = this.uiparams;
      uiparams.modeliste = this.uiparams.modeliste;
      uiparams.afficherstats = this.uiparams.afficherstats;
      localStorage.setItem("uiparams", JSON.stringify(uiparams));
    },
    onChangeAfficherStats(){
      this.storeUiparams();
    },
    onChangeMainCostOrMore() {
      this.onChangeFilter();
    },
    onChangeRecallCostOrMore() {
      this.onChangeFilter();
    },
    onChangeForestOrMore() {
      this.onChangeFilter();
    },
    onChangeMountainOrMore() {
      this.onChangeFilter();
    },
    onChangeWaterOrMore() {
      this.onChangeFilter();
    },
    storeModeListe() {
      this.storeUiparams();
    },
    showModalDeleteDeck() {
      this.modalDeleteDeck = true;
    },
    onAfficherStats() {
      this.uiparams.afficherstats = true;
    },
    onHideModalDetail() {
      //remettre à null permet de remounted à chaque affichage du detail car component v-if sur l'objet carddetail
      this.currentCardDetail = null;
    },
    loadDecks() {
      //TODO : importer les autres decks depuis la bd
      //JSON.parse(localStorage.getItem("decks"));
      this.g_fetchDecks((decks) => {
        
        //alim de la combo
        this.decks = decks.map(deck => { 
          return {
            value: deck.id, 
            label: deck.name 
          };
        });
        
        var storedDeck = JSON.parse(localStorage.getItem("currentDeck"));

        if (storedDeck) 
        {          
          if (!decks.some(zedeck => zedeck.id == storedDeck.id)) 
          {
            this.decks.push({ value: storedDeck.id, label: storedDeck.name });
          }
          this.currentSelectedDeck = storedDeck.id;
          this.currentDeck = storedDeck;

          if (this.currentDeck.main_faction) {
            this.currentFaction = this.currentDeck.main_faction;
            this.setCurrentFaction($("#" + this.currentFaction));
          }
          // si un héro est présent dans le deck, on récupère sa faction pour préselectionner le filtre faction
        }
        else {
          this.currentSelectedDeck = null;
        }
      });
    },
    updateCurrentDeck(pdeck)
    {
      if(pdeck)
      {
        $.extend(this.currentDeck, pdeck); //récup du created, userId, et id
        this.saveCurrentDeckToLocalStorage();
      }
    },
    saveDeck() 
    {
      this.g_saveDeck(this.currentDeck, deck => this.updateCurrentDeck(deck));  
/*

      var storedDecks = JSON.parse(localStorage.getItem("decks"));
      var inStore = false;
      if (storedDecks) {
        var inStore = false;
        for (var deck of storedDecks) {
          if (deck.name == this.currentSelectedDeck) {
            inStore = true;
            deck.cards = this.currentDeck.cards;
          }
        }
      }
      if (!inStore) {
        storedDecks.push(this.currentDeck)
      }

      localStorage.setItem("decks", JSON.stringify(storedDecks));
      */
    },
    deleteDeck() 
    {
      if(this.currentDeck.id > 0)
      {
        this.g_deleteDeck(this.currentDeck, (presponse) => 
        {
          console.log(presponse);
          localStorage.removeItem("currentDeck"); //le deck supprimé est forcément le current
          this.loadDecks();
        }); 
      }
      else{
        console.log("only local");
        localStorage.removeItem("currentDeck"); //le deck supprimé est forcément le current
        this.loadDecks();
      }
    },
    getTotalRarityCurrentDeck(ptype) {
      var total = 0;
      for (var pcard of this.currentDeck.cards) {
        if (!ptype || (pcard.rarity == ptype && pcard.cardType != "HERO"))
          total += pcard.quantite;
      }
      return total;
    },
    getTotalCardsCurrentDeck() {
      return this.getTotalRarityCurrentDeck();
    },
    getTotalCommunesCurrentDeck() {
      return this.getTotalRarityCurrentDeck("COMMON");
    },
    getTotalRaresCurrentDeck() {
      return this.getTotalRarityCurrentDeck("RARE");
    },
    getTotalUniquesCurrentDeck() {
      return this.getTotalRarityCurrentDeck("UNIQUE");
    },
    getTotalTypesCurrentDeck(ptype) {
      var total = 0;
      for (var pcard of this.currentDeck.cards) {
        if (pcard.cardType == ptype)
          total += pcard.quantite;
      }
      return total;
    },
    getTotalPersosCurrentDeck() {
      return this.getTotalTypesCurrentDeck("CHARACTER");
    },
    getTotalSortsCurrentDeck() {
      return this.getTotalTypesCurrentDeck("SPELL");
    },
    getTotalPermasCurrentDeck() {
      return this.getTotalTypesCurrentDeck("PERMANENT");
    },
    saveCurrentDeckToLocalStorage() {
      localStorage.setItem("currentDeck", JSON.stringify(this.currentDeck));
    },
    mouseenterCard(card) {
      this.oldAfficherStats = this.uiparams.afficherstats;
      this.uiparams.afficherstats = false;
      this.imagePathFullsize = card.imagePath;  //"/src/assets/img/altered_kojo.png",
    },
    mouseleaveCard(card) {
      this.uiparams.afficherstats = this.oldAfficherStats;
      this.imagePathFullsize = null;
    },
    onshowcarddetail(card) {
      this.currentCardDetail = card;
      this.afficherDetails = true;
    },
    removeCard(card) {
      var indice = 0;
      for (var pcard of this.currentDeck.cards) {
        if (pcard.reference == card.reference) {
          pcard.quantite--;

          if (pcard.quantite == 0) {
            this.currentDeck.cards.splice(indice, 1);
          }
          this.saveCurrentDeckToLocalStorage();
          this.refreshStatComponent();
          return;
        }
        indice++;
      }
      
    },
    getXXXsCurrentDeck(ptype) {
      if (!this.currentDeck) return [];

      const persos = [];
      this.currentDeck.cards.forEach(card => {
        if (card.cardType == ptype) {
          persos.push(card);
        }
      });
      return persos;
    },
    getHeroCurrentDeck() {
      return this.getXXXsCurrentDeck("HERO");
    },
    getPersosCurrentDeck() {
      return this.getXXXsCurrentDeck("CHARACTER");
    },
    getSortsCurrentDeck() {
      return this.getXXXsCurrentDeck("SPELL");
    },
    getPermanentsCurrentDeck() {
      return this.getXXXsCurrentDeck("PERMANENT");
    },
    fetchCardInDeck(card) {
      for (var pcard of this.currentDeck.cards) {
        if (pcard.reference == card.reference) {
          return pcard;
        }
      }
      return null;
    },
    addCard(card) {
      var existingCard = this.fetchCardInDeck(card);
      if (existingCard) {
        if (existingCard.quantite < 3) {
          if (existingCard.rarity != "UNIQUE" || existingCard.quantite == 0) {
            existingCard.quantite++;
          }
        }
      }
      else 
      {
        if(this.g_isHero(card))
        {
          this.currentDeck.main_faction = card.mainFaction;
        }
        const addedCard = $.extend(card, { quantite: 1 });
        //récup des détails de la carte
        /*
        try {
            axios.get('https://api.altered.gg/cards/' + card.reference,
            {
              headers: {"Accept-Language": "en-en"}
            }).then(response => {
              $.extend(addedCard, { keywords: this.g_extractKeywordsFromCardDetail(response.data) });
            });

        } catch (error) {
          console.error('Error fetching cards:', error);
        }
          */
        this.currentDeck.cards.push(addedCard);
      }
      this.refreshStatComponent();
      this.saveCurrentDeckToLocalStorage();
    },
    onChangeSorting() {
      setTimeout(() => this.onChangeFilter(), 500);
    },
    onChangeKeywords(){
      setTimeout(() => this.onChangeFilter(), 500);
    },
    onChangeEditions(){
      setTimeout(() => this.onChangeFilter(), 500);
    },
    onChangeSoustypes(){
      setTimeout(() => this.onChangeFilter(), 500);
    },
    onSelectCurrentDeck() 
    {
      this.g_fetchDeck(this.currentSelectedDeck, true, deck => 
      {
        if(deck)
        {
          if(!deck.cards) deck.cards = [];
          this.currentDeck = deck;
          this.saveCurrentDeckToLocalStorage();
        }
        
        this.currentDeck = JSON.parse(localStorage.getItem("currentDeck"));

        console.log(this.currentDeck);
        if(this.currentDeck)
        {
          this.currentSelectedDeck = this.currentDeck.id;
          
          var factionDeck = this.currentDeck.main_faction;
          if(!factionDeck)
          {
            var hero = this.getHeroCurrentDeck();
            factionDeck = hero && hero.length == 1 ? hero[0].mainFaction : null;
          }
          
          if (factionDeck) {
            if (this.currentFaction != factionDeck) {
              this.searchCards(false, true, true); //faction différente -> on reset le résultat de la recherche
            }
            this.currentFaction = factionDeck;
            this.setCurrentFaction($("#" + this.currentFaction));
          }
        }

        /*
        if (!storedDeck || storedDeck.name != this.currentSelectedDeck) {
          this.decks.push({ value: this.newDeckName, label: this.newDeckName });
        }
        */
        this.refreshStatComponent();
      });
    },
    onClearCurrentDeck() {
      this.currentDeck = null;
    },
    checkCreateDeck() {
      if (!this.newDeckName) {
        return;
      }
      this.decks.push({ value: 0, label: this.newDeckName });
      this.currentSelectedDeck = 0;
      
      this.currentDeck = {
        id: 0,
        name: this.newDeckName,
        description: '',
        public: true,
        main_faction: '',
        cards: []
      };

      this.saveCurrentDeckToLocalStorage();

      //this.newDeckName = null;
      this.creatingDeck = false;
    },
    cancelCreateDeck() {
      this.creatingDeck = false;
    },
    createDeck() {
      this.creatingDeck = true;

      //$("#awid-fdeckname").trigger("focus");
    },
    exportCSV() {
      const exportedCards = [];
      this.fetchedCards.forEach((card) => {
        exportedCards.push({
          rarete: card.rarity.name,
          faction: card.mainFaction.name,
          nom: card.name,
          manquant: 3 - card.inMyCollection
        });
      });
      var csv = exportedCards.map(row => {
        return Object.values(row).map(value => {
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',');
      }).join('\n');

      const csvFile = new Blob([csv], { type: 'text/csv' });
      const downloadLink = document.createElement('a');

      downloadLink.href = window.URL.createObjectURL(csvFile);
      downloadLink.download = "AlteredPlayset.csv";
      downloadLink.click();
    },
    hasResult() {
      return this.fetchedCards.length > 0;
    },
    onChangeStat(event) {

      var rangePercent = this.forest;

      if ($(event.target).attr("id") == "mountain") rangePercent = this.mountain;
      // : this.forest);
      $(event.target).css('filter', 'grayscale(' + (50 - (5 * rangePercent)) + '%)');

      this.onChangeFilter();
    },
    onChangeCost(event) {
      var rangePercent = ($(event.target).attr("id") == "handCost" ? this.handCost : this.reserveCost) * 10;
      $(event.target).css('filter', 'hue-rotate(-' + rangePercent + 'deg)');

      this.onChangeFilter();
    },
    selectCharacter() {
      this.isSelectedCharacter = !this.isSelectedCharacter;
      this.onChangeFilter();
    },
    selectSpell() {
      this.isSelectedSpell = !this.isSelectedSpell;
      this.onChangeFilter();
    },
    selectPermanent() {
      this.isSelectedPermanent = !this.isSelectedPermanent;
      this.onChangeFilter();
    },
    selectHero() {
      this.isSelectedHero = !this.isSelectedHero;
      this.onChangeFilter();
    },
    isEmptyFetchedCards() {
      return !this.hasResult();
    },
    isCurrentAxiom() {
      return this.currentFaction == "AX";
    },
    isCurrentBravos() {
      return this.currentFaction == "BR";
    },
    isCurrentLyra() {
      return this.currentFaction == "LY";
    },
    isCurrentMuna() {
      return this.currentFaction == "MU";
    },
    isCurrentOrdis() {
      return this.currentFaction == "OR";
    },
    isCurrentYzmir() {
      return this.currentFaction == "YZ";
    },
    searchPlayset() {
      this.searchCards(true, false, false);
    },
    searchCards(pArrayView, pdontfetch, pshowstat) {
      this.fetchedCards = [];
      this.hasMore = true;
      this.currentPage = 1;
      this.itemsPerPage = pArrayView ? 100000 : 12;
      this.arrayview = pArrayView;
      this.uiparams.afficherstats = pshowstat;

      if(this.deckbuilder)
      {
        this.storeUiparams();
      }
      if (!pdontfetch) {
        this.fetchCards();
      }
    },
    changeFaction(event) {
      var $target = $(event.target);
      var $a = $target.is("a") ? $target : $target.parents("a:first");
      this.setCurrentFaction($a);
    },
    setCurrentFaction(link) {
      $(".aw-factionsel a").each(function () {
        $(this).removeClass("aw-selected");
      });

      this.currentFaction = link.attr("id");
      link.addClass("aw-selected")
    },
    selectCommon() {
      this.isSelectedCommon = !this.isSelectedCommon
      this.onChangeFilter();;
    },
    selectRare() {
      this.isSelectedRare = !this.isSelectedRare;
      this.onChangeFilter();
    },
    selectUnique() {
      this.isSelectedUnique = !this.isSelectedUnique;
      this.onChangeFilter();
    },
    calcCost(rangeType, costValue) {
      var couts = [];

      if (!rangeType) return [Number(costValue)];
      if (rangeType == "ouplus") {
        if (costValue == 1) return []; //0 ou plus : ne pas envoyer le param
        for (let cost = Number(costValue); cost <= 20; cost++) {
          couts.push(cost);
        }
      }
      else {
        if (costValue == 10) return []; //10 ou moins : ne pas envoyer le param
        for (let cost = Number(costValue); cost >= 1; cost--) {
          couts.push(cost);
        }
      }
      return couts;
    },
    calcMainCost() {
      return this.calcCost(this.handCostOrMore, this.handCost);
    },
    calcReserveCost() {
      return this.calcCost(this.reserveCostOrMore, this.reserveCost);
    },
    calcStat(rangeType, statvalue) {
      var powers = [];
      if (!this.isSelectedCharacter) return powers; //si pas type perso, power ne sert à rien
      if (!rangeType) return [Number(statvalue)];
      if (rangeType == "ouplus") {
        if (statvalue == 0) return []; //0 ou plus : ne pas envoyer le param
        for (let power = Number(statvalue); power <= 10; power++) {
          powers.push(power);
        }
      }
      else {
        if (statvalue == 10) return []; //10 ou moins : ne pas envoyer le param
        for (let power = Number(statvalue); power >= 1; power--) {
          powers.push(power);
        }
      }
      return powers;
    },
    calcForest() {
      return this.calcStat(this.forestOrMore, this.forest);
    },
    calcMountain() {
      return this.calcStat(this.mountainOrMore, this.mountain);
    },
    calcWater() {
      return this.calcStat(this.waterOrMore, this.water);
    },
    calcType() {
      var types = [];
      if (this.isSelectedCharacter) types.push("CHARACTER");
      if (this.isSelectedSpell) types.push("SPELL");
      if (this.isSelectedPermanent) types.push("PERMANENT");
      if (this.isSelectedHero) types.push("HERO");
      return types;
    },
    calcRarities() {
      var rarities = [];
      if (this.isSelectedCommon) rarities.push("COMMON");
      if (this.isSelectedRare) rarities.push("RARE");
      if (this.isSelectedUnique) rarities.push("UNIQUE");
      return rarities;
    },
    async fetchCardsFromDatabase()
    {
      var req = supabase
            .from('Card')
            .select()
            .eq('mainFaction', this.currentFaction);

      if (this.currentName != '') req = req.ilike('name', '%' + this.currentName + '%');

      var calculatedrarity = this.calcRarities();
      if (calculatedrarity.length > 0) req = req.in("rarity", calculatedrarity);

      var calculatedmaincost = this.calcMainCost();
      if (calculatedmaincost.length > 0) req = req.in("mainCost", calculatedmaincost);
      var calculatedrecallcost = this.calcReserveCost();
      if (calculatedrecallcost.length > 0) req = req.in("recallCost", calculatedrecallcost);
      
      var calculatedforest = this.calcForest();
      if (calculatedforest.length > 0) req = req.in("forestPower", calculatedforest);
      var calculatedmountain = this.calcMountain();
      if (calculatedmountain.length > 0) req = req.in("mountainPower", calculatedmountain);
      var calculatedwater = this.calcWater();
      if (calculatedwater.length > 0) req = req.in("oceanPower", calculatedwater);

      var calculatedtype = this.calcType();
      if (calculatedtype.length > 0) req = req.in("cardType", calculatedtype);

      if (this.currentEditions.length > 0) req = req.in("cardSet", this.currentEditions);

      var streq = [];
      if (this.currentSoustypes.length > 0)
      {
        this.currentSoustypes.forEach(st => streq.push('cardSubtypes.cs.\{' + st + '\}'));
      }
      if(streq.length > 0) req = req.or(streq.join(','));

      //mot-clé : convertir les codes en termes à recherche dans main_effet et echo_effect
      //if (this.currentKeywords.length > 0) $.extend(params, { keyword: this.currentKeywords });
      var keywords = [];
      this.currentKeywords.forEach(kw => {
        var label = this.g_getKeywordLabel(kw);
        keywords.push('main_effect.ilike.%' + label + '%,echo_effect.ilike.%' + label + '%');
      });
      if(keywords.length > 0) req = req.or(keywords.join(','));

      this.currentSort.forEach(sortref => {
        req = req.order('name', { ascending: true })
      });      
      req = req.range((this.currentPage - 1) * 12, (this.currentPage * 12) );
      const { data: cards, error } = await req;
        

      this.currentPage++;
      this.hasMore = cards.length > 12;
      if(this.hasMore) cards.pop(); //on vire le dernier élément qui ne sert qy'à savoir si il y a d'autres cartes à fetch
      
      cards.forEach(card => 
      {
        if (!this.emptyplayset || (this.emptyplayset && card.inMyCollection < 3)) 
        {
          var zecard = this.deckbuilder ? this.g_getCardInDeck(card.reference, this.currentDeck) : card;
          if (zecard) this.fetchedCards.push(zecard);
          else 
          {
            card.quantite = 0;
            this.fetchedCards.push(card);
          }
        }
      });
      this.loading = false;
    },
    fetchCards() {
      if (this.currentPage > 1 && !this.hasMore) return;

      try {
        this.loading = true;
        if (!this.currentSort || this.currentSort.length == 0) this.currentSort = ["translations.name"];

        if(this.database)
        {
          this.fetchCardsFromDatabase();
          return;
        }       

        var params = {
          itemsPerPage: this.itemsPerPage,
          page: this.currentPage,
          factions: this.currentFaction
        };
        this.currentSort.forEach((sortingType) => {
          var tabs = sortingType.split(',');
          params["order[" + tabs[0] + "]"] = (tabs.length == 1 ? "ASC" : "DESC");
        });

        if (this.bearer != '') $.extend(params, { collection: true });
        if (this.currentName != '') $.extend(params, { "translations.name": this.currentName });

        var calculatedforest = this.calcForest();
        if (calculatedforest.length > 0) $.extend(params, { forestPower: calculatedforest });
        var calculatedmountain = this.calcMountain();
        if (calculatedmountain.length > 0) $.extend(params, { mountainPower: calculatedmountain });
        var calculatedwater = this.calcWater();
        if (calculatedwater.length > 0) $.extend(params, { oceanPower: calculatedwater });
        var calculatedmaincost = this.calcMainCost();
        if (calculatedmaincost.length > 0) $.extend(params, { mainCost: calculatedmaincost });
        var calculatedrecallcost = this.calcReserveCost();
        if (calculatedrecallcost.length > 0) $.extend(params, { recallCost: calculatedrecallcost });
        var calculatedtype = this.calcType();
        if (calculatedtype.length > 0) $.extend(params, { cardType: calculatedtype });
        var calculatedrarity = this.calcRarities();
        if (calculatedrarity.length > 0) $.extend(params, { rarity: calculatedrarity });
        
        if (this.currentKeywords.length > 0) $.extend(params, { keyword: this.currentKeywords });
        if (this.currentEditions.length > 0) $.extend(params, { cardSet: this.currentEditions });
        if (this.currentSoustypes.length > 0) $.extend(params, { cardSubTypes: this.currentSoustypes });

        var headers = {
          "Accept-Language": "fr-fr"
        };
        if (this.bearer) {
          $.extend(headers, { Authorization: "Bearer " + this.bearer });
        }

        //console.log(params);
        axios.get('https://api.altered.gg/cards',
          {
            headers: headers,
            params: params
          }).then((response) => {
            var cpt = 0;
            response.data["hydra:member"].forEach(element => 
            {
              this.g_upsertCard(element, false, true);

              if (!this.emptyplayset || (this.emptyplayset && element.inMyCollection < 3)) {
                var zecard = this.deckbuilder ? this.g_getCardInDeck(element.reference, this.currentDeck) : element;
                if (zecard) this.fetchedCards.push(zecard);
                else {
                  element.quantite = 0;
                  this.fetchedCards.push(element);
                }
              }
            });
            this.loading = false;
            this.currentPage++;
            this.hasMore = response.data["hydra:view"]["hydra:next"] != undefined;
          });

      } catch (error) {
        console.error('Error fetching cards:', error);
        this.loading = false;
      }
    }
  }
};
</script>

<style>
.aw-probapioche
{
  position: absolute;
  right: 15px;
}
.aw-decklistpersos
{
  background-color: #b4bf4d36;
}
.aw-decklistsorts
{
  background-color: #be804940;
}
.aw-decklistpermas
{
  background-color: #648ab954;
}

.aw-titletypedecklist
{
  border-top: 1px solid #aa77087a;
}
.aw-modalecarddet .modal-body
{
  background-image: url("@/assets/img/altered/fond1.png");
  background-size: cover;
}
.aw-modalecarddet .modal-header
{
  background-color: var(--c-ordis);
  color: white;  
}

.aw-herodeck {
  min-height: 210px;
}

.aw-imgapercu img {
  transition: all .5s ease-in;
  margin-top: -1000px;
  width: calc(0.22* 100vw);

}

.aw-imgapercu.aw-imageapon img {
  margin-top: 0;
}

.aw-resultsearch {
  transition: opacity .5s ease-in;
}

.aw-resultsearch.aw-imageapon {
  opacity: 0.1;
}

.aw-deckstat {
  position: absolute;
}

.aw-decklist .card-body {
  min-height: 130px;
  background-image: url(/src/assets/img/bgarch.png);
  background-repeat: repeat;
}

.aw-decklist.aw-fullscreen
{
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  overflow: scroll;
  bottom: 0;
  right: 0;
}

.aw-noresult {
  font-size: 50px;
  text-align: end;
}

.aw-noresult img {
  max-width: 500px;
}

.aw-noresult {
  background-image: url(/src/assets/img/bgshape2.png);
  background-repeat: no-repeat;
  background-size: contain;
}

img.aw-fond {
  width: 360px;
  position: absolute;
  z-index: -1;
}

img.aw-faction {
  width: 35px;
}

.aw-wrapper {
  margin-top: 90px;
}

.aw-raritysel img {
  width: 50px;
}

.aw-raritysel a:hover::after,
.aw-raritysel .aw-selected::after {
  content: '';
  width: 50px;
  display: block;
  margin: 0 auto;
  position: absolute;
  border-bottom-width: 5px;
  border-bottom-style: solid;
}

.aw-factionsel a:hover::after,
.aw-factionsel .aw-selected::after {
  content: '';
  width: 37px;
  display: block;
  margin: 0 auto;
  position: absolute;
  border-bottom-width: 5px;
  border-bottom-style: solid;
}

.aw-factionsel a.aw-axiom::after {
  border-bottom-color: var(--c-axiom);
}

a.aw-bravos::after {
  border-bottom-color: var(--c-bravos);
}

a.aw-lyra::after {
  border-bottom-color: var(--c-lyra);
}

a.aw-muna::after {
  border-bottom-color: var(--c-muna);
}

a.aw-ordis::after {
  border-bottom-color: var(--c-ordis);
}

a.aw-yzmir::after {
  border-bottom-color: var(--c-yzmir);
}

a.aw-common::after {
  border-bottom-color: var(--c-common);
}

a.aw-rare::after {
  border-bottom-color: var(--c-rare);
}

a.aw-unique::after {
  border-bottom-color: var(--c-unique);
}


.aw-slider {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.aw-slider input[type=range] {
  outline: 0;
  border: 0;
  border-radius: 500px;
  width: 400px;
  max-width: 100%;
  margin: 16px 0 0 0px;
  transition: box-shadow 0.2s ease-in-out;
}

@media screen and (-webkit-min-device-pixel-ratio: 0) {
  .aw-slider input[type=range] {
    overflow: hidden;
    height: 25px;
    -webkit-appearance: none;
    background-color: #ddd;
  }

  .aw-slider input[type=range]::-webkit-slider-runnable-track {
    height: 25px;
    -webkit-appearance: none;
    color: #444;
    -webkit-transition: box-shadow 0.2s ease-in-out;
    transition: box-shadow 0.2s ease-in-out;
  }

  .aw-slider input[type=range]::-webkit-slider-thumb {
    width: 25px;
    -webkit-appearance: none;
    height: 25px;
    cursor: ew-resize;
    background: #fff;
    box-shadow: -330px 0 0 320px #1597ff, inset 0 0 0 25px #1597ff;
    border-radius: 50%;
    -webkit-transition: box-shadow 0.2s ease-in-out;
    transition: box-shadow 0.2s ease-in-out;
    position: relative;
  }

  .aw-slider input[type=range]:active::-webkit-slider-thumb {
    background: #fff;
    box-shadow: -330px 0 0 320px #1597ff, inset 0 0 0 3px #1597ff;
  }
}

.aw-slider input[type=range]::-moz-range-progress {
  background-color: #43e5f7;
}

.aw-slider input[type=range]::-moz-range-track {
  background-color: #9a905d;
}

.aw-slider input[type=range]::-ms-fill-lower {
  background-color: #c933bc;
}

.aw-slider input[type=range]::-ms-fill-upper {
  background-color: #9a905d;
}


@media screen and (-webkit-min-device-pixel-ratio: 0) {
  .aw-stats .aw-slider input[type=range] {
    /*transform:rotate(270deg);*/
    /*cursor:n-resize;*/
    filter: grayscale(25%);
    margin-top: 0;
  }

  .aw-stats .aw-slider input[type=range] {
    height: 20px;
  }

  .aw-stats .aw-slider input[type=range]::-webkit-slider-runnable-track {
    height: 20px;
  }

  .aw-stats .aw-slider input[type=range]::-webkit-slider-thumb {
    height: 20px;
    width: 20px;
  }

  .aw-stats .aw-slider input#forest[type=range]::-webkit-slider-thumb {
    box-shadow: -330px 0 0 320px var(--c-forest), inset 0 0 0 25px var(--c-forest);
  }

  .aw-stats .aw-slider input#mountain[type=range]::-webkit-slider-thumb {
    box-shadow: -330px 0 0 320px var(--c-mountain), inset 0 0 0 25px var(--c-mountain);
  }

  .aw-stats .aw-slider input#water[type=range]::-webkit-slider-thumb {
    box-shadow: -330px 0 0 320px var(--c-water), inset 0 0 0 25px var(--c-water);
  }
}

.aw-stats .altered-forest {
  color: var(--c-forest);
}

.aw-stats .altered-mountain {
  color: var(--c-mountain);
}

.aw-stats .altered-water {
  color: var(--c-water);
}

.aw-type a,
.aw-type a span {
  color: #5E678C;
  transition: all .5s;
  position: relative;
}

.aw-type a.aw-character:hover,
.aw-type a.aw-character:hover span,
.aw-type a.aw-character.aw-selected {
  color: var(--c-unique);
}

.aw-type a.aw-spell:hover,
.aw-type a.aw-spell:hover span,
.aw-type a.aw-spell.aw-selected {
  color: var(--c-water);
}

.aw-type a.aw-permanent:hover,
.aw-type a.aw-permanent:hover span,
.aw-type a.aw-permanent.aw-selected {
  color: var(--c-mountain);
}

.aw-type a.aw-hero:hover,
.aw-type a.aw-hero:hover span,
.aw-type a.aw-hero.aw-selected {
  color: var(--c-forest);
}

.aw-type a:hover::after,
.aw-type a.aw-selected::after {
  content: '';
  width: 50px;
  display: block;
  margin: 0 auto;
  position: absolute;
  border-bottom-width: 5px;
  border-bottom-style: solid;
  bottom: -8px;
}

/***********************
SWITCH
************************ */
/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 27px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked+.slider {
  background-color: #2196F3;
}

input:focus+.slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked+.slider:before {
  -webkit-transform: translateX(29px);
  -ms-transform: translateX(29px);
  transform: translateX(29px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>