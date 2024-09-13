<template>
  <div :class="['aw-wrapper', deckbuilder ? 'aw-deckbuilder' : '']">
    <img src="@/assets/img/collectionfond.png" class="aw-fond" />

    <div class="container-fluid pt-2"> <!--begin::Row-->
      <div class="row">
        <div class="col-12 col-xl-3">
          <div v-if="deckbuilder" class="card card-outline card-info mb-1">
            <div class="card-header">
              <h3 class="card-title">Mes decks</h3>
              <div class="card-tools d-flex">
                <BDropdown v-model="showDDCreateDeck" v-if="!creatingDeck && !proprietingdeck" size="sm" split split-href="#foo/bar" variant="primary" class="me-2" @click="createDeck">
                  <template #button-content>
                    <font-awesome-icon :icon="['fas', 'circle-plus']" class="me-2"/>Créer
                  </template>
                  <BDropdownItem @click="importDeck" variant="infod2" v-if="!creatingDeck && user && !proprietingdeck">
                    <font-awesome-icon :icon="['fas', 'file-arrow-down']" class="me-2" />Importer
                  </BDropdownItem>
                </BDropdown>
                <BDropdown v-model="showDeckoptions" start size="sm" variant="outline-secondary">
                  <template #button-content>
                    <font-awesome-icon :icon="['fas', 'gear']" />
                  </template>
                  <BDropdownItem @click="onShowProprietesDeck" v-if="!creatingDeck && user && currentSelectedDeck && !proprietingdeck">
                    <font-awesome-icon :icon="['fas', 'gear']" class="me-2" />Propriétés
                  </BDropdownItem>
                  <BDropdownItem @click="exporterCurrentDeck()" v-if="user && currentDeck">
                    <font-awesome-icon :icon="['fas', 'file-export']" class="me-2"/>Exporter
                  </BDropdownItem>                  
                  <BDropdownDivider />  
                  <BDropdownItem  @click="showModalDeleteDeck()" variant="danger" v-if="user && currentDeck">
                      <font-awesome-icon :icon="['far', 'trash-can']" class="me-2" />Supprimer
                  </BDropdownItem>
                </BDropdown>
              </div>
            </div> <!-- /.card-header -->
            <div class="card-body">
              <Multiselect v-if="!creatingDeck && !proprietingdeck" v-model="currentSelectedDeck" 
                :close-on-select="true" 
                :options="decks"
                :searchable="true"
                @select="onSelectCurrentDeck" 
                @clear="onClearCurrentDeck" />
              <div v-else>
                <div class="input-group mb-2">
                  <input type="text" class="form-control" placeholder="Identifiant d'un deck Altered" v-model="fIdAlteredDeck">
                  <span class="input-group-append">
                    <button type="button" class="btn btn-primary" @click="searchAlteredDeck"><font-awesome-icon :icon="['fas', 'magnifying-glass']" /></button>
                  </span>
                </div>
                <div class="input-group">
                  <input required id="awid-fdeckname" v-model="newDeckName" type="text" class="form-control" placeholder="Nom du deck">
                </div>
                <div class="input-group mt-2" v-if="isImporting() && !proprietingdeck">
                  <BFormTextarea v-model="newDecklist" placeholder="Collez ici la decklist..." rows="15" />
                </div>
                <div class="mt-3" v-if="proprietingdeck && !isImporting()">
                  <div class="d-flex justify-content-end">
                    Deck public
                    <label class="switch ms-2 mb-2">
                      <input type="checkbox" v-model="currentDeck.public"/>
                      <span class="slider round"></span>
                    </label>
                  </div>

                  <div><i class="fs-8">Vous pouvez utiliser le markdown pour la description du deck</i></div>
                  <BFormTextarea v-model="taDescDeck" placeholder="Description du deck..." rows="15" />
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
          <div v-if="!deckbuilder" :class="['aw-imgapercu', imagePathFullsize ? 'aw-imageapon' : '']">
            <div class="sticky">
              <img :src="imagePathFullsize" class="img-fluid aw-alteredcard" />
            </div>
          </div>
          <div v-if="deckbuilder || !imagePathFullsize">
            <div v-if="!database && fetchedCards && g_isAdmin(user) && currentFaction != ''">
                <BButton @click="updateDetailFromApi" variant="secondary" size="sm" class="me-2">
                  <font-awesome-icon :icon="['fas', 'file-import']" class="me-2" />Details <span v-if="updatingname">{{  updatingname }}</span>
                </BButton>
                <BButton @click="onClickDownloadImages" variant="secondary" size="sm" class="me-2">
                  <font-awesome-icon :icon="['fas', 'file-import']" class="me-2" />Images <span v-if="updatingname">{{  updatingname }}</span>
                </BButton>
            </div>

            <div class="card card-outline card-warning">
              <div class="card-header" v-if="currentFaction != ''">
                <div class="d-flex justify-content-end">
                  <div v-if="g_isAdmin(user) && currentFaction != ''">
                    BDD
                    <label class="switch me-2">
                      <input type="checkbox" v-model="database">
                      <span class="slider round"></span>
                    </label>
                  </div>
                  <BButton @click="searchCards(false, false, false)" variant="unique" size="sm">
                    <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="me-2" />Rechercher
                  </BButton>
                  <BButton @click="searchPlayset" variant="common" size="sm" class="ms-2" v-if="gaa_isBearer() && !deckbuilder">
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

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  Rareté
                  <img v-b-toggle.aw-filtresrarity src="@/assets/img/arrow.png" class="aw-arrowcollapse ms-3" />
                </div>
                <BCollapse id="aw-filtresrarity" v-model="uiparams.filtreRarity" @hide="storeUiparams" @show="storeUiparams">
                  <div class="d-flex justify-content-evenly aw-raritysel mt-2">
                    <a href="javascript:" id="COMMON" :class="['aw-common', isSelectedCommon ? 'aw-selected' : '']"
                      @click="selectCommon"><img src="@/assets/img/altered/rarities/common.png" class="aw-rarity" /></a>
                    <a href="javascript:" id="RARE" :class="['aw-rare', isSelectedRare ? 'aw-selected' : '']"
                      @click="selectRare"><img src="@/assets/img/altered/rarities/rare.png" class="aw-rarity" /></a>
                    <a href="javascript:" id="UNIQUE" :class="['aw-unique', isSelectedUnique ? 'aw-selected' : '']"
                      @click="selectUnique"><img src="@/assets/img/altered/rarities/unique.png" class="aw-rarity" /></a>
                  </div>
                </BCollapse>

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  Type
                  <img v-b-toggle.aw-filtrestype src="@/assets/img/arrow.png" class="aw-arrowcollapse ms-3" />
                </div>
                <BCollapse id="aw-filtrestype" v-model="uiparams.filtreType" @hide="storeUiparams" @show="storeUiparams">
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
                </BCollapse>
                
                <hr>
                <div class="d-flex justify-content-between mt-3">
                  Coût de main
                  <img v-b-toggle.aw-filtrescoutmain src="@/assets/img/arrow.png" class="aw-arrowcollapse ms-3" />
                </div>
                <BCollapse id="aw-filtrescoutmain" v-model="uiparams.filtreMainCost" @hide="storeUiparams" @show="storeUiparams">
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
                </BCollapse>

                <hr>
                <div class="d-flex justify-content-between mt-3 mb-2">
                  Coût de réserve
                  <img v-b-toggle.aw-filtrescoutreserve src="@/assets/img/arrow.png" class="aw-arrowcollapse ms-3" />
                </div>
                <BCollapse id="aw-filtrescoutreserve" v-model="uiparams.filtreRecallCost" @hide="storeUiparams" @show="storeUiparams">
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
                </BCollapse>

                <div v-if="isSelectedCharacter">
                  <hr>
                  <div class="d-flex justify-content-between mt-3">
                    Patates
                    <img v-b-toggle.aw-filtrespower src="@/assets/img/arrow.png" class="aw-arrowcollapse ms-3" />
                  </div>
                  <BCollapse id="aw-filtrespower" v-model="uiparams.filtrePower" @hide="storeUiparams" @show="storeUiparams">
                    <div class="d-flex flex-column aw-stats">
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
                  </BCollapse>
                </div>

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  Mots-clés
                  <img v-b-toggle.aw-filtreskeyword src="@/assets/img/arrow.png" class="aw-arrowcollapse ms-3" />
                </div>
                <BCollapse id="aw-filtreskeyword" v-model="uiparams.filtreKeyword" @hide="storeUiparams" @show="storeUiparams">
                  <Multiselect v-model="currentKeywords" mode="tags" class="mb-2"
                    :close-on-select="true" 
                    :create-option="true" 
                    :searchable="true"
                    :options="keywords" 
                    @change="onChangeKeywords" />
                </BCollapse>

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  Sous-types
                  <img v-b-toggle.aw-filtressubtype src="@/assets/img/arrow.png" class="aw-arrowcollapse ms-3" />
                </div>
                <BCollapse id="aw-filtressubtype" v-model="uiparams.filtreSubtype" @hide="storeUiparams" @show="storeUiparams">
                <Multiselect v-model="currentSoustypes" mode="tags" class="mb-2"
                  :close-on-select="true" 
                  :create-option="true" 
                  :searchable="true"
                  :options="soustypes" 
                  @change="onChangeSoustypes" />
                </BCollapse>

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  Editions
                  <img v-b-toggle.aw-filtresedition src="@/assets/img/arrow.png" class="aw-arrowcollapse ms-3" />
                </div>
                <BCollapse id="aw-filtresedition" v-model="uiparams.filtreEdition" @hide="storeUiparams" @show="storeUiparams"> 
                <Multiselect v-model="currentEditions" mode="tags" class="mb-2"
                  :close-on-select="true" 
                  :create-option="true" 
                  :options="editions" 
                  @change="onChangeEditions" />
                </BCollapse>

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  Trier par
                  <img v-b-toggle.aw-filtrestri src="@/assets/img/arrow.png" class="aw-arrowcollapse ms-3" />
                </div>
                <BCollapse id="aw-filtrestri" v-model="uiparams.filtreSort" @hide="storeUiparams" @show="storeUiparams">              
                  <Multiselect v-model="currentSort" mode="tags" :close-on-select="true" :create-option="true"
                    :options="sortingTypes" @change="onChangeSorting" class="mb-2"/>
                </BCollapse>

                <div class="mt-3" v-if="gaa_isBearer() && !deckbuilder">
                  <b-form-checkbox id="emptyplayset" v-model="emptyplayset" name="emptyplayset">Playsets non complet
                    uniquement</b-form-checkbox>
                </div>
              </div>
            </div>
            <!-- /.card-body -->
          </div> <!-- /.card -->
        </div>
        <div :class="['col-12', deckbuilder && currentSelectedDeck != null ? 'col-xl-4' : 'col-xl-9']">
          <div class="container-fluid">
            <div class="row" v-if="!hasResult() && !loading && !imagePathFullsize && !uiparams.afficherstats">
              <img src="/src/assets/img/altered_kojo.png" alt="" class="img-fluid aw-imgmiddle" />
            </div>
            <div v-if="!uiparams.afficherstats && deckbuilder" :class="['row mb-3 aw-imgapercu', imagePathFullsize ? 'aw-imageapon' : '']">
              <div class="col-12">
                <div class="sticky">
                  <img :src="imagePathFullsize" alt="" class="img-fluid aw-alteredcard" />
                </div>
              </div>
            </div>
            <div v-else-if="currentDeck && deckbuilder && currentSelectedDeck != null">
              <DeckStats :currentDeck="currentDeck" v-if="renderStatComponent"/>
            </div>
            <div v-if="!uiparams.afficherstats">
              <div :class="['row aw-resultsearch', imagePathFullsize && deckbuilder ? 'aw-imageapon' : '']">
                <Card v-for="card in fetchedCards" 
                  :key="card.id" 
                  :card="card" 
                  :arrayview="arrayview"
                  :emptyplayset="emptyplayset" 
                  :deckbuilder="deckbuilder && currentSelectedDeck != null"
                  :collection="gaa_isBearer()" 
                  :currentDeck="currentDeck" 
                  @addcard="addCard" 
                  @removecard="removeCard"
                  @onshowcarddetail="onshowcarddetail" 
                  @mouseentercard="mouseenterCard" 
                  @mouseleavecard="mouseleaveCard" />
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
        <div class="col-12 col-xl-5" v-if="deckbuilder && currentDeck">
          <div class="card card-outline card-primary mb-1 aw-decklist">
            <div class="card-header">
              <div class="d-flex justify-content-between">
                <div class="d-flex flex-column">
                  <h3 class="fs-5" v-if="currentDeck"><font-awesome-icon :icon="['fas', 'lock']" class="me-2" v-if="!currentDeck.public"/>{{ currentDeck.name }}</h3>
                  <div class="fs-7">Cartes: {{ g_getTotalCardsInDeck({deck: currentDeck}) }}</div>
                </div>
                <div class="d-flex align-items-end">
                    <div>
                      <BButton @click="saveDeck()" variant="primary" size="sm" class="me-2" v-if="user">
                        <font-awesome-icon :icon="['far', 'floppy-disk']" class="me-2" />Enregistrer
                      </BButton>
                    </div>                    
                    <BDropdown v-model="showDecklistoptions" start size="sm" variant="outline-secondary">
                      <template #button-content>
                        <font-awesome-icon :icon="['fas', 'gear']" />
                      </template>
                      <BDropdownItem @click="affModalImportUnique()" variant="unique">
                        <font-awesome-icon :icon="['fas', 'file-arrow-down']" class="me-2" />Importer une carte Unique
                      </BDropdownItem>
                      <BDropdownDivider />
                      <BDropdownItem @click="redirectToDecklist()">
                        <font-awesome-icon :icon="['far', 'eye']" class="me-2" v-if="user" />Afficher la DeckList
                      </BDropdownItem>
                      <BDropdownItem @click="changeModeListe()">
                        <span v-if="uiparams.modeliste">
                          <font-awesome-icon :icon="['far', 'image']" class="me-2" />Passer en mode visuel
                        </span>
                        <span v-else>
                          <font-awesome-icon :icon="['fas', 'list']" class="me-2" />Passer en mode liste
                        </span>
                      </BDropdownItem>
                      <BDropdownItem @click="changeModeStats()">
                          <font-awesome-icon :icon="['fas', 'chart-column']" class="me-2" />
                          <span v-if="!uiparams.afficherstats">Afficher les stats</span>
                          <span v-else>Cacher les stats</span>
                      </BDropdownItem>
                    </BDropdown>               
                </div>
              </div>
            </div> <!-- /.card-header -->
            <div class="card-body">
              <div class="row justify-content-md-cente">
                <div class="col-12">
                  <div class="aw-herodeck d-flex flex-column justify-content-start">
                    <div class="d-flex mb-2 ps-1 pe-1">
                      <div class="d-flex flex-column align-items-center">
                        {{ g_getTotalCommunesInDeck({deck: currentDeck}) }}
                        <img src="/src/assets/img/altered/rarities/common.png" width="40px"/>
                      </div>
                      <div class="d-flex flex-column align-items-center">
                        {{ g_getTotalRaresInDeck({deck: currentDeck}) }}
                        <img src="/src/assets/img/altered/rarities/rare.png" width="40px"/>
                      </div>
                      <div class="d-flex flex-column align-items-center">
                        {{ g_getTotalUniquesInDeck({deck: currentDeck}) }}
                        <img src="/src/assets/img/altered/rarities/unique.png" width="40px"/>
                      </div>
                    </div>
                    <div class="d-flex mb-2 ps-3 pe-3">
                      <div class="d-flex flex-column align-items-center me-4">
                        {{ g_getTotalPersosInDeck({deck: currentDeck}) }}
                        <font-awesome-icon :icon="['fas', 'person-walking']" class="fs-6" />
                      </div>
                      <div class="d-flex flex-column align-items-center me-4">
                        {{ g_getTotalSortsInDeck({deck: currentDeck}) }}
                        <font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" class="fs-6" />
                      </div>
                      <div class="d-flex flex-column align-items-center">
                        {{ g_getTotalPermasInDeck({deck: currentDeck}) }}
                        <font-awesome-icon :icon="['fas', 'building-shield']" class="fs-6" />
                      </div>
                    </div>
                    <div class="col-12 d-flex flex-column justify-content-between">
                      <!--
                      <div>
                        Proba en main de départ
                        <Multiselect v-model="qtesuccessproba" :close-on-select="true" :options="[1,2,3]" />
                      </div>
                    -->
                      <div class="d-flex justify-content-end">
                        Description <img v-b-toggle.awid-descdeck src="@/assets/img/arrow.png" class="aw-arrowcollapse ms-3" />
                      </div>
                      <BCollapse id="awid-descdeck">
                        <div class="col-12 mt-4" v-html="getFormattedDescriptionCurrentDeck()"></div>
                      </BCollapse>
                    </div>
                    <div v-if="currentDeck && currentDeck.hero" :class="['d-flex flex-column justify-content-between aw-HERO', 'aw-' + g_getHeroName(currentDeck.hero)]">
                        <div class="aw-heroname">{{ currentDeck.hero.name }}</div>
                        
                        <div class="aw-herodelete">
                          <font-awesome-icon :icon="['far', 'trash-can']" class="fs-5" @click="removeCard(currentDeck.hero)" title="Supprimer le héro/la héroïne"/>
                        </div>
                    </div>
                    <!--
                    <CardDecklist v-for="card in getHeroCurrentDeck()" :card="card" @addcard="addCard"
                      @removecard="removeCard" @mouseentercard="mouseenterCard" @mouseleavecard="mouseleaveCard" @onshowcarddetail="onshowcarddetail"
                      :modeliste="uiparams.modeliste" :currentDeck="currentDeck"/>
                  -->
                  </div>
                </div>
                
              </div>
              <div class="row mt-2 pb-2 aw-decklistpersos">
                <div class="col-12 fs-4 d-flex justify-content-center aw-titletypedecklist">Personnages</div>
                <CardDecklist v-for="card in getPersosCurrentDeck()" :card="card" @addcard="addCard"
                  @removecard="removeCard" @mouseentercard="mouseenterCard" @mouseleavecard="mouseleaveCard"
                  @onshowcarddetail="onshowcarddetail" :modeliste="uiparams.modeliste"
                  :currentDeck="currentDeck" :qtesuccessproba="qtesuccessproba" :proba="getProba(card)"/>
              </div>
              <div class="row mt-2 pb-2 aw-decklistsorts">
                <div class="col-12 fs-4 d-flex justify-content-center aw-titletypedecklist">Sorts</div>
                <CardDecklist v-for="card in getSortsCurrentDeck()" :card="card" @addcard="addCard"
                  @removecard="removeCard" @mouseentercard="mouseenterCard" @mouseleavecard="mouseleaveCard"
                  @onshowcarddetail="onshowcarddetail" :modeliste="uiparams.modeliste"
                  :currentDeck="currentDeck" :qtesuccessproba="qtesuccessproba" :proba="getProba(card)"/>
              </div>
              <div class="row mt-2 pb-2 aw-decklistpermas">
                <div class="col-12 fs-4 d-flex justify-content-center aw-titletypedecklist">Permanents</div>
                <CardDecklist v-for="card in getPermanentsCurrentDeck()" :card="card" @addcard="addCard"
                  @removecard="removeCard" @mouseentercard="mouseenterCard" @mouseleavecard="mouseleaveCard"
                  @onshowcarddetail="onshowcarddetail" :modeliste="uiparams.modeliste"
                  :currentDeck="currentDeck" :qtesuccessproba="qtesuccessproba" :proba="getProba(card)"/>
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
    <CardDetail 
      :card="currentCardDetail" 
      :currentDeck="currentDeck" 
      :deckbuilder="deckbuilder"
      v-if="currentCardDetail && currentDeck"
      @addcard="addCard" @removecard="removeCard" />
  </BModal>
  <BModal v-model="showModalImportUnique" size="md" hide-footer @cancel="closeModalImportUnique" @ok="importerUnique" title="Importer une Unique" cancel-title="Annnuler" ok-title="Importer" ok-variant="unique">
    <BInputGroup>
      <BFormInput v-model="codeImportUnique" placeholder="Code" />
      
      <BButton variant="primary" @click="importerUnique"><font-awesome-icon :icon="['fas', 'magnifying-glass']" /></BButton>
    </BInputGroup>

    <div  v-if="importedUnique" class="d-flex flex-column justify-content-center mt-2">
      <div class="text-center fs-5 p-2">Carte trouvée et importée</div>
      <img :src="g_getImageCardPublicUrl(importedUnique)" class="img-fluid"/>
      <BButton variant="primary" @click="addUniqueToDeck" class="mt-2"><font-awesome-icon :icon="['fas', 'circle-plus']" class="me-2"/>Ajouter la carte au deck</BButton>
    </div>
  </BModal>

  <BModal v-model="showModalConfirmChangeDeck" @ok="confirmChangeDeck" @cancel="dontChangeDeck" centered cancel-title="Annuler" ok-title="Continuer"
    ok-variant="primary" title="Modifications en cours">
    Attention ! Le deck contient des modifications qui n'ont pas été enregistrées.
    <br />
    Si vous continuez, les changements apportés seront perdus. 
    <br />
    Voulez-vous continuer ?
  </BModal>
</template>

<style src="@vueform/multiselect/themes/default.css"></style>

<script setup>
import { watch } from 'vue'
import { getCurrentInstance } from 'vue';

const props = defineProps({
  user: { type: Object},
  deckbuilder: false,
});

const instance = getCurrentInstance();

watch(() => props.user, async (newUser, oldUser) => 
{
  if(!newUser)
  {
    instance.proxy.loadDecks(0, true);
  }
})
</script>

<script>
import { useToast, TYPE } from "vue-toastification";
import MarkdownIt from "markdown-it";

export default {
  name: 'Collection',
  data() {
    return {
      database: true,
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
      currentSort: ["name"],
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
        afficherstats: false,
        filtreRarity: true,
        filtreRecallCost: true,
        filtreMainCost: true,
        filtreSort: true,
        filtreKeyword: true,
        filtreEdition: true,
        filtreSubtype: true,
        filtreType: true,
        filtrePower: true
      },
      imagePathFullsize: null,
      afficherDetails: false,
      oldAfficherStats: false,
      sortingTypes: [
        { value: 'name', label: 'Nom Asc.' },
        { value: 'mainCost', label: 'Mana Asc.' },
        { value: 'recallCost', label: 'Réserve Asc.' },
        { value: 'name,0', label: 'Nom Desc.' },
        { value: 'mainCost,0', label: 'Mana Desc.' },
        { value: 'recallCost,0', label: 'Réserve Desc.' },
      ],
      csv: [],
      decks: [],
      currentDeck: null,
      currentSelectedDeck: null,
      creatingDeck: false,
      newDeckName: null,
      fIdAlteredDeck: null,
      newDecklist: null,
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
      showModalImportUnique: false,
      codeImportUnique: null,
      importedUnique: null,
      deckModified: false,
      showModalImportUnique: false,
      showModalConfirmChangeDeck: false,
      actionOriConfirmChangeDeck: null,
      updatingname: null,
      proprietingdeck: false,
      taDescDeck: null,
      mousetimeout: null,
      showDeckoptions: false,
      showDecklistoptions: false,
      showDDCreateDeck: false,
    };
  },
  mounted() 
  { 
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
        currentKeywords: [],
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
  watch:{
    proprietingdeck(newValue, oldValue) {
        if(newValue)
        {
          this.newDeckName = this.currentDeck.name
          this.taDescDeck = this.currentDeck.description

          setTimeout(() => $('#awid-fdeckname').trigger('select')) //.trigger('focus'), 50)
        }
    },
  },
  methods: {
    searchAlteredDeck()
    {
      if(this.fIdAlteredDeck)
      {
        var tab = this.fIdAlteredDeck.split('/')
        var id = tab[tab.length - 1]
        this.fIdAlteredDeck = id
        
        this.gaa_fetchDeck(this.fIdAlteredDeck, pdeck => 
        {
          const toast = useToast()

          if(!pdeck)
          {
            toast("Une erreur s'est produite lors de la récupération du deck", { type: TYPE.ERROR })    
            return
          }

          toast("Le deck a été trouvé", { type: TYPE.SUCCESS })    
          this.newDeckName = pdeck.name

          this.newDecklist = ""
          var cards = []
          if(pdeck.cardIndexes) for (let key in pdeck.cardIndexes) 
          {
            cards.push(pdeck.cardIndexes[key] + ' ' + key.split('/').pop());
          }
          this.newDecklist = ''
          if(pdeck.alterator)
          {
            this.newDecklist = '1 ' + pdeck.alterator.reference + '\n'
          }
          this.newDecklist += cards.join('\n')
        })
      }
    },
    exporterCurrentDeck()
    {
      const toast = useToast();
      var copy = ''
      this.currentDeck.cards.forEach(card => copy += (copy == '' ? '' : '\n') + card.quantite + ' ' + card.reference)
      navigator.clipboard.writeText(copy)
        .then(() => {
          toast("La decklist a été copiée dans le presse-papier", { type: TYPE.SUCCESS });
        })
        .catch(err => {
          toast("Une erreur s'est produite", { type: TYPE.ERROR });
          console.error('Failed to copy: ', err);
        });
    },
    redirectToDecklist()
    {
      const route = this.$router.resolve('/decklists/' + this.currentDeck.id);
      
      // Open the route in a new tab
      window.open(route.href, '_blank');

      //this.$router.push('/decklists/' + this.currentDeck.id)
    },
    updateDetailFromApi()
    {
      this.g_updateCardsFromApi(this.fetchedCards,
        //onUpdatingCard: 
        pcard => this.updatingname = pcard.reference,
        //onUpdatedCards: 
        () => this.updatingname = null
      )
    },
    onClickDownloadImages()
    {
      this.g_downloadImages(this.fetchedCards,
        //onDownloadingImage
        pcard => this.updatingname = pcard.reference,
        //onDownloadedImages
        () => this.updatingname = null,
        //onUpdatedImageS3
        null
      );
    },
    dontChangeDeck()
    {
      this.currentSelectedDeck = this.currentDeck.id; 
      this.actionOriConfirmChangeDeck = null;
    },
    addUniqueToDeck()
    {
      this.addCard(this.importedUnique)
      this.closeModalImportUnique()
    },
    importerUnique(){
      //this.codeImportUnique = 'ALT_COREKS_B_MU_11_U_2926';
      if(!this.codeImportUnique)
      {
        return;
      }

      const onFetchedCard = pcard => 
      {
        //si la carte a ete trouvé => message d'erreur
        if(pcard)
        {
          const toast = useToast();
          toast("Cette carte existe déjà", { type: TYPE.ERROR });
        }
        else 
        {
          this.g_updateCardFromApi(this.codeImportUnique, 
            //onUpdatedCard: 
            ppcard => 
            {
              const toast = useToast();

              if(!ppcard)
              {
                toast("Une erreur s'est produite lors de l'import de la carte", { type: TYPE.ERROR });
                return
              }

              if(this.g_isUnique(ppcard))
              {
                this.g_downloadImages([ppcard], 
                  //onDownloadingImage
                  pppcard => console.log("Téléchargement de l'image " + pppcard.imagePath),
                  //onDownloadedImages
                  pcards => this.importedUnique = pcards[0],
                  //onUpdatedImageS3
                  pppcard => console.log("maj base Card.imageS3 : " + pppcard.imageS3)                  
                )
              }
              else{
                toast("Cette carte n'est pas une unique", { type: TYPE.ERROR });
              }
            })
          }
        }

      this.g_fetchCard(this.codeImportUnique, onFetchedCard);
    },
    closeModalImportUnique()
    {
      this.showModalImportUnique = false;
    },
    affModalImportUnique()
    {
      this.importedUnique = null;
      this.codeImportUnique = '';
      this.showModalImportUnique = true;
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
      uiparams.filtreRarity = this.uiparams.filtreRarity;
      uiparams.filtreRecallCost = this.uiparams.filtreRecallCost;
      uiparams.filtreMainCost = this.uiparams.filtreMainCost;
      uiparams.filtreSort = this.uiparams.filtreSort;
      uiparams.filtreKeyword = this.uiparams.filtreKeyword;
      uiparams.filtreEdition = this.uiparams.filtreEdition;
      uiparams.filtreSubtype = this.uiparams.filtreSubtype;
      uiparams.filtreType = this.uiparams.filtreType;
      uiparams.filtrePower = this.uiparams.filtrePower;

      localStorage.setItem("uiparams", JSON.stringify(uiparams));
    },
    changeModeStats(){
      this.uiparams.afficherstats = !this.uiparams.afficherstats
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
    changeModeListe() {
      this.uiparams.modeliste = !this.uiparams.modeliste
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
    onFetchedDecks(pdecks, pidDft)
    {
      //alim de la combo:
      this.decks = pdecks.map(deck => {
        return { 
          value: deck.id, 
          label: deck.name 
      }});
      /*
      code pour le regroupement par héro
      :groups="true"

      var tmpoptions = {}
      pdecks.forEach(pdeck => 
      {
        var liste = tmpoptions[pdeck.hero.name]
        if(!liste) tmpoptions[pdeck.hero.name] = []
        tmpoptions[pdeck.hero.name].push({value: pdeck.id, label: pdeck.name })
      });
      
      this.decks = []
      for (let key in tmpoptions) 
      {
        this.decks.push({ options: tmpoptions[key], label: key});
      }
      this.decks.sort((a,b) => a.label.localeCompare(b.label))
      */

      if(pidDft)
      {
        this.currentSelectedDeck = null;
        this.currentDeck = null;
        localStorage.removeItem("currentDeck");

        var storedDeck = this.decks.find(deck => deck.id = pidDft);
        if(storedDeck)
        {
          this.g_fetchDeck(storedDeck.id, true, deck => 
          {
            this.currentSelectedDeck = deck.id;
            this.currentDeck = deck;
            this.saveCurrentDeckToLocalStorage();
            if (this.currentDeck.main_faction) 
            {
              this.setCurrentFaction($("#" + this.currentDeck.main_faction));
            }
          });
        }
      }
      else
      {        
        //on pre-charge avec le deck courant
        var storedDeck = JSON.parse(localStorage.getItem("currentDeck"));

        if (storedDeck) 
        {          
          if (!pdecks.some(zedeck => zedeck.id == storedDeck.id)) 
          {
            this.decks.push({ value: storedDeck.id, label: storedDeck.name });
          }
          this.currentSelectedDeck = storedDeck.id;
          this.currentDeck = storedDeck;

          if (this.currentDeck.main_faction) {
            this.setCurrentFaction($("#" + this.currentDeck.main_faction));
          }
          // si un héro est présent dans le deck, on récupère sa faction pour préselectionner le filtre faction
        }
        else {
          this.currentSelectedDeck = null;
        }
      }
    },
    loadDecks(pidDft, ondeconnect) 
    {
      this.deckModified = false;

      //sur un rechargement après deconnexion, si le currentdeck etait > 0, on le supprime
      if(ondeconnect)
      {
        if(this.currentSelectedDeck > 0)
        {
          this.currentSelectedDeck = null
          this.currentDeck = null
          localStorage.removeItem("currentDeck")
        }
      }

      this.g_fetchDecks({
        myonly: true,
        withhero: true,
        callback : pdecks => this.onFetchedDecks(pdecks, pidDft)
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
      this.g_saveDeck(this.currentDeck, deck => {
        this.updateCurrentDeck(deck);
        this.deckModified = false;

        const toast = useToast();
        if(deck) toast("Deck enregistré");
        else toast("Une erreur s'est produite lors de la sauvegarde du deck", { type: TYPE.ERROR });
      });  
    },
    deleteDeck() 
    {
      if(this.currentDeck.id > 0)
      {
        this.g_deleteDeck(this.currentDeck, (presponse) => 
        {
          localStorage.removeItem("currentDeck"); //le deck supprimé est forcément le current
          this.loadDecks();
        }); 
      }
      else{
        localStorage.removeItem("currentDeck"); //le deck supprimé est forcément le current
        this.loadDecks();
      }
    },
    saveCurrentDeckToLocalStorage() {
      localStorage.setItem("currentDeck", JSON.stringify(this.currentDeck));
    },
    mouseenterCard(card) {
      if(this.deckbuilder) 
      {
        if(this.uiparams.afficherstats != null) this.oldAfficherStats = this.uiparams.afficherstats;
        this.uiparams.afficherstats = null;
      }
      if(this.mousetimeout) clearTimeout(this.mousetimeout)
      this.imagePathFullsize = this.g_getImageCardPublicUrl(card);  //"/src/assets/img/altered_kojo.png",
    },
    mouseleaveCard(card) {
      
      this.mousetimeout = setTimeout(() => 
      {
        if(this.deckbuilder) this.uiparams.afficherstats = this.oldAfficherStats;
        this.imagePathFullsize = null
      }, 200);
    },
    onshowcarddetail(card) {
      this.currentCardDetail = card;
      this.afficherDetails = true;
    },
    removeCard(card) 
    {
      var indice = 0;
      for (var pcard of this.currentDeck.cards) 
      {
        if (pcard.reference == card.reference) 
        {
          this.deckModified = true;
          pcard.quantite--;

          if(this.g_isHero(card))
          {
            this.currentDeck.hero_id = null
            this.currentDeck.hero = null
          }

          if (pcard.quantite == 0) 
          {
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

      //tri
      persos.sort((a, b) => {
          if(this.g_isUnique(a) && !this.g_isUnique(b)) return -1;
          if(!this.g_isUnique(a) && this.g_isUnique(b)) return 1;

          if(a.mainCost != b.mainCost) return a.mainCost < b.mainCost ? -1 : 1
          if(a.recallCost != b.recallCost) return a.recallCost < b.recallCost ? -1 : 1
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
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
            this.deckModified = true;
          }
        }
      }
      else 
      {
        if(this.g_isHero(card))
        {
          this.currentDeck.hero_id = card.reference 
          this.currentDeck.main_faction = card.mainFaction
          this.currentDeck.hero = card
        }
        const addedCard = $.extend(card, { quantite: 1 });
        this.currentDeck.cards.push(addedCard);
        this.deckModified = true;
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
      if(this.deckModified && !this.showModalConfirmChangeDeck)
      {
        this.showModalConfirmChangeDeck = true;
        this.actionOriConfirmChangeDeck = "CHANGER";
        return;
      }

      if(this.currentSelectedDeck == 0)
      {
        //si on sélectionne un deck en cours de création c'est que les données ont déjà été perdues....
        //on reinit le current Deck
        var option = this.decks.find(daik => daik.value == 0);
        this.initEmptyNewDeck(option.label);
        return;
      }

      this.deckModified = false;
      this.g_fetchDeck(this.currentSelectedDeck, true, deck => 
      {
        if(deck)
        {
          if(!deck.cards) deck.cards = [];
          this.currentDeck = deck;
          this.saveCurrentDeckToLocalStorage();
        }
        
        this.currentDeck = JSON.parse(localStorage.getItem("currentDeck"));

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

        this.refreshStatComponent();
      });
    },
    getFormattedDescriptionCurrentDeck()
    {
      const markdown = new MarkdownIt();
      return markdown.render(this.currentDeck.description)
    },
    onClearCurrentDeck() 
    {
      if(this.deckModified && !this.showModalConfirmChangeDeck)
      {      
        this.actionOriConfirmChangeDeck = "CLEARSELECTEDDECK";  
        this.showModalConfirmChangeDeck = true;
        return;
      }
      
      this.deckModified = false;
      this.currentSelectedDeck = null;
      this.currentDeck = null;
      localStorage.removeItem("currentDeck");
    },
    isChangingDeck()
    {
      return this.actionOriConfirmChangeDeck == "CHANGER";
    },
    isCreatingDeck()
    {
      return this.actionOriConfirmChangeDeck == "CREER";
    },
    isImporting()
    {
      return this.actionOriConfirmChangeDeck == "IMPORTER";
    },
    isClearingSelectedDeck()
    {
      return this.actionOriConfirmChangeDeck == "CLEARSELECTEDDECK";
    },
    saveProprietesCurrentDeck()
    {
      this.currentDeck.name = this.newDeckName
      this.currentDeck.description = this.taDescDeck

      this.g_saveProprietesDeck(this.currentDeck, pdeck => 
      {
        const toast = useToast();

        if(!pdeck)
        {
          toast("Une erreur s'est produite lors de la sauvegarde des données", { type: TYPE.ERROR });
          return;
        }
        toast("Les propriétés ont été enregistrées", { type: TYPE.SUCCESS });
        this.decks.forEach(pdeck => 
        {
          if(pdeck.value == this.currentDeck.id) pdeck.label = this.currentDeck.name
        })
        this.saveCurrentDeckToLocalStorage();
        this.proprietingdeck = false
      })
    },
    checkCreateDeck() {
      const toast = useToast();

      if (!this.newDeckName || (this.isImporting() && !this.newDecklist)) {
        
        toast(this.isImporting() ? "Tous les champs sont obligatoires" : "Le nom du deck est obligatoire", { type: TYPE.ERROR });
        return;
      }

      if(this.proprietingdeck)
      {
        this.saveProprietesCurrentDeck()
        return
      }

      if(this.isImporting())
      {
        //vérification du format
        try {
          var decklist = this.newDecklist.trim().split('\n').map(ligne => 
          {
            var tab = ligne.split(' ');
            return {
                qte:parseInt(tab[0].trim()),
                ref:tab[1].trim(),
            }
          });

          //on enregistre directement en base et on reload tout
          this.g_importDeck({name: this.newDeckName, cards: decklist},
            //onImportedDeck: 
            pdeck => 
            {
              if(!pdeck) toast('Une erreur s\'est produite', { type: TYPE.ERROR });
              else {
                //reload des decks en se positionnant sur celui importé
                this.loadDecks(pdeck.id);
                this.creatingDeck = false;
              }
            })
        }
        catch (error) 
        {
          console.log(error);
          toast('Une erreur s\'est produite', { type: TYPE.ERROR });
        }
        return;
      }


      this.decks.push({ value: 0, label: this.newDeckName });

      this.initEmptyNewDeck(this.newDeckName);
    },
    initEmptyNewDeck(pname)
    {
      this.currentDeck = {
        id: 0,
        name: pname,
        description: '',
        public: true,
        main_faction: '',
        hero_id: null,
        cards: []
      };

      this.currentSelectedDeck = 0;
      this.saveCurrentDeckToLocalStorage();
      this.creatingDeck = false;
      this.deckModified = true;
    },
    cancelCreateDeck() {
      this.proprietingdeck = false
      this.creatingDeck = false
      this.actionOriConfirmChangeDeck = null
    },
    confirmChangeDeck()
    {
      if(this.isCreatingDeck() || this.isImporting())
      {
        this.createDeck();
      }
      else if(this.isChangingDeck())
      {
        this.onSelectCurrentDeck();
      }
      else if(this.isClearingSelectedDeck())
      {
        this.onClearCurrentDeck();
      }
      this.actionOriConfirmChangeDeck = null;
      this.showModalConfirmChangeDeck = false;
    },
    onShowProprietesDeck()
    {
      this.proprietingdeck = true
    },
    importDeck()
    {
      this.actionOriConfirmChangeDeck = "IMPORTER";

      if(this.deckModified && !this.showModalConfirmChangeDeck)
      {        
        this.showModalConfirmChangeDeck = true;
        return;
      }

      this.newDeckName = '';
      this.newDecklist = '';
      this.creatingDeck = true;
    },
    createDeck() 
    {
      this.actionOriConfirmChangeDeck = "CREER";

      if(this.deckModified && !this.showModalConfirmChangeDeck)
      {
        this.showModalConfirmChangeDeck = true;
        return;
      }
      this.newDeckName = '';
      this.newDecklist = '';
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
      if(pArrayView) this.itemsPerPage = 100000
      else this.itemsPerPage = this.deckbuilder ? 12 : 24
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

      var keywords = [];
      this.currentKeywords.forEach(kw => {
        var label = this.g_getKeywordLabel(kw);
        keywords.push('main_effect.ilike.%' + label + '%,echo_effect.ilike.%' + label + '%');
      });
      if(keywords.length > 0) req = req.or(keywords.join(','));
      
      this.currentSort.forEach(sortref => {
        var tab = sortref.split(',');
        req = req.order(tab[0] == 'translations.name' ? 'name' : tab[0], { ascending: tab.length == 1 })
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
    fetchCards() 
    {
      if (this.currentPage > 1 && !this.hasMore) return;
      
      this.loading = true;
      if (!this.currentSort || this.currentSort.length == 0) this.currentSort = [database ? 'name' : 'translations.name'];

      var calcparams = {
        currentFaction: this.currentFaction,
        currentName: this.currentName,
        calculatedrarity: this.calcRarities(),
        calculatedmaincost: this.calcMainCost(),
        calculatedrecallcost: this.calcReserveCost(),
        calculatedforest: this.calcForest(),
        calculatedmountain: this.calcMountain(),
        calculatedwater: this.calcWater(),
        calculatedtype: this.calcType(),
        currentEditions: this.currentEditions,
        currentSoustypes: this.currentSoustypes,
        currentKeywords: this.currentKeywords,
        currentSort: this.currentSort,
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      }

      if(this.database) this.fetchCardsFromDatabase(calcparams)
      else this.fetchCardsFromApi(calcparams)      
    },
    fetchCardsFromDatabase(calcparams)
    {
      this.g_fetchCardsFromDatabase(calcparams, pcards => 
        {
          this.currentPage++;
          this.hasMore = pcards.length > this.itemsPerPage;
          if(this.hasMore) pcards.pop(); //on vire le dernier élément qui ne sert qy'à savoir si il y a d'autres cartes à fetch
          
          pcards.forEach(card => 
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
        })
    },
    fetchCardsFromApi(calcparams)
    {
      this.gaa_fetchCards(calcparams, (pcards, phasMore) => 
      {
        pcards.forEach(pcard => 
        {
          this.g_upsertCard(
            {
              apicard: pcard,
              detail: false,
              forceupdate: true
            },
            //onUpdatedCard:
            ppcard => console.log("Carte mise à jour : " + ppcard.reference)
          )

          this.fetchedCards.push(pcard);
        });
        this.loading = false;
        this.hasMore = phasMore;

        if(pcards.length > 0) this.currentPage++;
        else this.currentPage = 1
      })
    }
  }
}
</script>

<style>
.aw-HERO .aw-herodelete
{
  color: white;
  position: relative;
  padding: 2px 10px;
  font-size: small;
}
.aw-HERO .aw-herodelete svg
{
  cursor: pointer;
}

.aw-HERO  .aw-heroname
{
  color: white;
  position: relative;
  background-color: #00000070;
  padding: 2px 10px;
  font-size: small;
}
.aw-HERO{
  height: 100px;
  position: relative;
  overflow: hidden;
  border-radius: 6px;
}
.aw-HERO::before 
{ 
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  transition: all 0.5s;
}
.aw-HERO:hover::before
{
  transform: scale(1.5);
}
.aw-HERO.aw-arjun::before
{
  background-image: url('@/assets/img/altered/heronotext-small-arjun.png');
}
.aw-HERO.aw-teija::before
{
  background-image: url('@/assets/img/altered/heronotext-small-teija.png');
}
.aw-HERO.aw-rin::before
{
  background-image: url('@/assets/img/altered/heronotext-small-rin.png');
}
.aw-HERO.aw-sierra::before
{
  background-image: url('@/assets/img/altered/heronotext-small-sierra.png');
}
.aw-HERO.aw-subhash::before
{
  background-image: url('@/assets/img/altered/heronotext-small-subhash.png');
}
.aw-HERO.aw-treyst::before
{
  background-image: url('@/assets/img/altered/heronotext-small-treyst.png');
}
.aw-HERO.aw-atsadi::before
{
  background-image: url('@/assets/img/altered/heronotext-small-atsadi.png');
}
.aw-HERO.aw-kojo::before
{
  background-image: url('@/assets/img/altered/heronotext-small-kojo.png');
}
.aw-HERO.aw-basira::before
{
  background-image: url('@/assets/img/altered/heronotext-small-basira.png');
}
.aw-HERO.aw-fen::before
{
  background-image: url('@/assets/img/altered/heronotext-small-fen.png');
}
.aw-HERO.aw-nevenka::before
{
  background-image: url('@/assets/img/altered/heronotext-small-nevenka.png');
}
.aw-HERO.aw-auraq::before
{
  background-image: url('@/assets/img/altered/heronotext-small-auraq.png');
}
.aw-HERO.aw-waru::before
{
  background-image: url('@/assets/img/altered/heronotext-small-waru.png');
}
.aw-HERO.aw-sigismar::before
{
  background-image: url('@/assets/img/altered/heronotext-small-sigismar.png');
}
.aw-HERO.aw-gulrang::before
{
  background-image: url('@/assets/img/altered/heronotext-small-gulrang.png');
}
.aw-HERO.aw-lindiwe::before
{
  background-image: url('@/assets/img/altered/heronotext-small-lindiwe.png');
}
.aw-HERO.aw-afanas::before
{
  background-image: url('@/assets/img/altered/heronotext-small-afanas.png');
}
.aw-HERO.aw-akesha::before
{
  background-image: url('@/assets/img/altered/heronotext-small-akesha.png');
}
.aw-imgmiddle
{
  max-width: 500px !important;
}
.aw-arrowcollapse
{
  width: 23px;
  cursor: pointer;
  transform: rotateZ(270deg);
  transition: all .3s;
}
.aw-arrowcollapse.collapsed
{
  transform: rotateZ(90deg);
}
.aw-imgimportunique
{
  display: flex;
    justify-content: center;
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
  background-image: url("https://fyqptmokmnymednlerpj.supabase.co/storage/v1/object/public/Altered/assets/fond1.png");
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
  margin-top: 0;
  width: calc(0.25 * 100vw);
}
.aw-deckbuilder .aw-imgapercu img {
  width: calc(0.31 * 100vw);
}

.aw-resultsearch {
  transition: opacity .5s ease-in;
}

.aw-resultsearch.aw-imageapon {
  opacity: 0.1;
}

.aw-decklist .card-body {
  min-height: 130px;
  background-image: url(/src/assets/img/bgarch.png);
  background-repeat: repeat;
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
    appearance: none;
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