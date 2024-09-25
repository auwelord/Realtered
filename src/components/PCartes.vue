<template>
  <div :class="['aw-wrapper', deckbuilder ? 'aw-deckbuilder' : '']">
    <img src="@/assets/img/collectionfond.png" class="aw-fond" />

    <div class="container-fluid pt-2"> <!--begin::Row-->
      <div class="row">
        <div class="col-12 col-xl-3">
          <div :class="['aw-imgapercurech', imageRechPathFullsize ? 'aw-imageapon' : '']">
            <div class="sticky">
              <img :src="imageRechPathFullsize" class="img-fluid aw-alteredcard" />
            </div>
          </div>
          <div v-if="deckbuilder && !imageRechPathFullsize" class="card card-outline card-info mb-1">
            <div class="card-header">
              <h3 class="card-title">Mes decks</h3>
              <div class="card-tools d-flex">
                <BDropdown v-model="showDDCreateDeck" v-if="user && !creatingDeck && !proprietingdeck" size="sm" split variant="primary" class="me-2" @click="createDeck">
                  <template #button-content>
                    <font-awesome-icon :icon="['fas', 'circle-plus']" class="me-2"/>Créer
                  </template>
                  <BDropdownItem @click="copierDeck" v-if="currentSelectedDeck">
                    <font-awesome-icon :icon="['far', 'copy']" class="me-2" />Copier
                  </BDropdownItem>
                  <BDropdownItem @click="importDeck">
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
                  <BDropdownItem @click="onCopierLienDecklist()" v-if="user && currentDeck && currentSelectedDeck > 0">
                    <font-awesome-icon :icon="['fab', 'threads']" class="me-2"/>Copier le lien de la decklist
                  </BDropdownItem>             
                  <BDropdownDivider />  
                  <BDropdownItem  @click="e_showModalDeleteDeck()" variant="danger" v-if="user && currentDeck">
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
                :canDeselect="false"
                @select="onSelectCurrentDeck" 
                @clear="onClearCurrentDeck" />
              <div v-else>
                <div class="input-group mb-2" v-if="isImporting()">
                  <input type="text" class="form-control" placeholder="Id. / URL deck Altered (optionnel)" v-model="fIdAlteredDeck">
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
          <div v-if="!imageRechPathFullsize">
            <div class="card card-outline card-warning">
              <div class="card-header" v-if="currentFaction != ''">
                <div class="d-flex justify-content-end">
                  <div v-if="g_isAdmin(user) && currentFaction != ''" class="mt-2">
                    BDD
                    <label class="switch me-2">
                      <input type="checkbox" v-model="database">
                      <span class="slider round"></span>
                    </label>
                  </div>
                  <BButton @click="clearFilters" variant="light" size="sm" class="me-2" title="Supprimer tous les filtres (hors factions/éditions/tris)">
                    <font-awesome-icon :icon="['fas', 'eraser']" />
                  </BButton>
                  <BButton @click="searchCards(false, false, false)" variant="unique" size="sm">
                    <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="me-2" />Rechercher
                  </BButton>
                  <BButton @click="searchPlayset" variant="common" size="sm" class="ms-2" v-if="g_isBearer() && !deckbuilder">
                    <font-awesome-icon :icon="['fas', 'magnifying-glass-arrow-right']" class="me-2" />Playset
                  </BButton>
                </div>
              </div> <!-- /.card-header -->
              <div class="card-header" v-if="g_isAdmin(user)">
                <div v-if="!database && fetchedCards && currentFaction != ''">
                  <BButton @click="updateDetailFromApi" variant="secondary" size="sm" class="me-2">
                    <font-awesome-icon :icon="['fas', 'file-import']" class="me-2" />Details <span v-if="updatingname">{{  updatingname }}</span>
                  </BButton>
                  <BButton @click="onClickDownloadImages" variant="secondary" size="sm" class="me-2">
                    <font-awesome-icon :icon="['fas', 'file-import']" class="me-2" />Images <span v-if="updatingname">{{  updatingname }}</span>
                  </BButton>
                </div>
                <BButton @click="updateUniques" variant="secondary" size="sm" class="me-2" title="Mettre à jour les uniques" v-if="g_isAdmin(user) && database">
                  <font-awesome-icon :icon="['fas', 'pen-clip']" class="me-2" />Update uniques {{  updatingname }}
                </BButton>
              </div>
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
                  <div class="d-flex flex-column flex-fill align-items-center">
                    <input type="text" class="form-control" placeholder="Nom de carte..." 
                      v-model="currentName" 
                      @keyup.enter="searchCards(false, false, false)" />
                  </div>
                </div>

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  <div>
                    <BButton @click="searchCards(false, false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechRarete && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    Rareté
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtresrarity>
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
                  </div>
                </div>
                <BCollapse id="awid-filtresrarity" v-model="uiparams.filtreRarity" @hide="storeUiparams" @show="storeUiparams">
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
                  <div>
                    <BButton @click="searchCards(false, false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechType && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    Type
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtrestype>
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
                  </div>
                </div>
                <BCollapse id="awid-filtrestype" v-model="uiparams.filtreType" @hide="storeUiparams" @show="storeUiparams">
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
                  <div>
                    <BButton @click="searchCards(false, false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechMaincost && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    Coût de main
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtrescoutmain>
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
                  </div>
                </div>
                <BCollapse id="awid-filtrescoutmain" v-model="uiparams.filtreMainCost" @hide="storeUiparams" @show="storeUiparams">
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
                      value="1" @change="onChangeMaincost" />
                  </div>
                </div>
                </BCollapse>

                <hr>
                <div class="d-flex justify-content-between mt-3 mb-2">
                  <div>
                    <BButton @click="searchCards(false, false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechRecallcost && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    Coût de réserve
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtrescoutreserve>
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
                  </div>
                </div>
                <BCollapse id="awid-filtrescoutreserve" v-model="uiparams.filtreRecallCost" @hide="storeUiparams" @show="storeUiparams">
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
                      step="1" value="1" @change="onChangeRecallCost" />
                  </div>
                </div>
                </BCollapse>

                <div v-if="isSelectedCharacter">
                  <hr>
                  <div class="d-flex justify-content-between mt-3">
                    <div>
                      <BButton @click="searchCards(false, false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechPower && currentFaction">
                        <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                      </BButton>
                      Patates
                    </div>
                    <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtrespower>
                      <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
                    </div>
                  </div>
                  <BCollapse id="awid-filtrespower" v-model="uiparams.filtrePower" @hide="storeUiparams" @show="storeUiparams">
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
                          <BFormCheckbox v-model="waterOrMore" value="ouplus" @change="onChangeWaterOrMore">ou plus</BFormCheckbox>
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
                  <div class="mb-1">
                    <BButton @click="searchCards(false, false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechKeyword && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    Mots-clés / Capacités
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtreskeyword>
                    <font-awesome-icon v-b-toggle.awid-filtreskeyword :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
                  </div>
                </div>
                <BCollapse id="awid-filtreskeyword" v-model="uiparams.filtreKeyword" @hide="storeUiparams" @show="storeUiparams">
                  <Multiselect v-model="currentKeywords" mode="tags" class="mb-2"
                    :close-on-select="true" 
                    :create-option="true" 
                    :searchable="false"
                    :options="keywords" 
                    @change="onChangeKeywords" />


                  <BInputGroup class="mt-2 ms-5">
                    <BFormCheckbox v-model="cbCapaStatic">Capacité statique non vide</BFormCheckbox>
                  </BInputGroup>
                  <BInputGroup>
                    <template #prepend>
                      <BInputGroupText><font-awesome-icon :icon="['fas', 'ban']" /></BInputGroupText>
                    </template>
                    <BFormInput placeholder="Texte inclu dans la capacité sans trigger"
                        :disabled="cbCapaStatic"
                        v-model="fCapaStatic"
                        @keyup.enter="searchCards(false, false, false)" />
                  </BInputGroup>
                  <BInputGroup class="mt-2 ms-5">
                    <BFormCheckbox v-model="cbCapaEtb">Capacité <i class="altered-etb"></i> non vide</BFormCheckbox>
                  </BInputGroup>
                  <BInputGroup>
                    <template #prepend>
                      <BInputGroupText><i class="altered-etb"></i></BInputGroupText>
                    </template>
                    <BFormInput placeholder="Texte inclu dans la capacité"
                        :disabled="cbCapaEtb"
                        v-model="fCapaEtb"
                        @keyup.enter="searchCards(false, false, false)" />
                  </BInputGroup>
                  <BInputGroup class="mt-2 ms-5">
                    <BFormCheckbox v-model="cbCapaHand">Capacité <i class="altered-hand"></i> non vide</BFormCheckbox>
                  </BInputGroup>
                  <BInputGroup>
                    <template #prepend>
                      <BInputGroupText>	<i class="altered-hand"></i></BInputGroupText>
                    </template>
                    <BFormInput placeholder="Texte inclu dans la capacité"
                        :disabled="cbCapaHand"
                        v-model="fCapaHand"
                        @keyup.enter="searchCards(false, false, false)" />
                  </BInputGroup>
                  <BInputGroup class="mt-2 ms-5">
                    <BFormCheckbox v-model="cbCapaReserve">Capacité <i class="altered-reserve"></i> non vide</BFormCheckbox>
                  </BInputGroup>
                  <BInputGroup>
                    <template #prepend>
                      <BInputGroupText><i class="altered-reserve"></i></BInputGroupText>
                    </template>
                    <BFormInput placeholder="Texte inclu dans la capacité"
                        :disabled="cbCapaReserve"
                        v-model="fCapaReserve"
                        @keyup.enter="searchCards(false, false, false)" />
                  </BInputGroup>
                  <BInputGroup class="mt-2 ms-5">
                    <BFormCheckbox v-model="cbCapaExhaust">Capacité <i class="altered-exhaust"></i> non vide</BFormCheckbox>
                  </BInputGroup>
                  <BInputGroup>
                    <template #prepend>
                      <BInputGroupText><i class="altered-exhaust"></i></BInputGroupText>
                    </template>
                    <BFormInput placeholder="Texte inclu dans la capacité"
                        :disabled="cbCapaExhaust"
                        v-model="fCapaExhaust"
                        @keyup.enter="searchCards(false, false, false)" />
                  </BInputGroup>
                  <BInputGroup class="mt-2 ms-5">
                    <BFormCheckbox v-model="cbCapaSupport">Capacité <i class="altered-support"></i> non vide</BFormCheckbox>
                  </BInputGroup>
                  <BInputGroup>
                    <template #prepend>
                      <BInputGroupText><i class="altered-support"></i></BInputGroupText>
                    </template>
                    <BFormInput placeholder="Texte inclu dans la capacité de support"
                        :disabled="cbCapaSupport"
                        v-model="fCapaSupport"
                        @keyup.enter="searchCards(false, false, false)" />
                  </BInputGroup>                  
                </BCollapse>

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  <div class="mb-1">
                    <BButton @click="searchCards(false, false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechSubtype && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    Sous-types
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtressubtype>
                    <font-awesome-icon v-b-toggle.awid-filtressubtype :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
                  </div>
                </div>
                <BCollapse id="awid-filtressubtype" v-model="uiparams.filtreSubtype" @hide="storeUiparams" @show="storeUiparams">
                <Multiselect v-model="currentSoustypes" mode="tags" class="mb-2"
                  :close-on-select="true" 
                  :create-option="true" 
                  :searchable="true"
                  :options="soustypes" 
                  @change="onChangeSoustypes" />
                </BCollapse>

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  <div class="mb-1">
                    <BButton @click="searchCards(false, false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechEdition && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    Editions
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtresedition>
                    <font-awesome-icon v-b-toggle.awid-filtresedition :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
                  </div>
                </div>
                <BCollapse id="awid-filtresedition" v-model="uiparams.filtreEdition" @hide="storeUiparams" @show="storeUiparams"> 
                <Multiselect v-model="currentEditions" mode="tags" class="mb-2"
                  :close-on-select="true" 
                  :create-option="true" 
                  :options="editions" 
                  @change="onChangeEditions" />
                </BCollapse>

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  <div class="mb-1">
                    <BButton @click="searchCards(false, false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechSort && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    Trier par 
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtrestri>
                    <font-awesome-icon v-b-toggle.awid-filtrestri :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
                  </div>
                </div>
                <BCollapse id="awid-filtrestri" v-model="uiparams.filtreSort" @hide="storeUiparams" @show="storeUiparams">              
                  <Multiselect v-model="currentSort" mode="tags" :close-on-select="true" :create-option="true"
                    :options="sortingTypes" @change="onChangeSorting" class="mb-2"/>
                </BCollapse>

                <div class="mt-3" v-if="g_isBearer() && !deckbuilder">
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
              <div class="col-12 d-flex flex-column align-items-center">
                  <div class="fs-4">Sélectionnez une faction et paramétrez vos filtres pour lancer la recherche</div>
                  <img src="/src/assets/img/empty.png" alt="" class="mt-5" style="width: 300px" />
              </div>
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
            <div v-if="!uiparams.afficherstats && !imagePathFullsize">
              <div :class="['row aw-resultsearch', imagePathFullsize && deckbuilder ? 'aw-imageapon' : '']">
                <Card v-for="card in fetchedCards" 
                  :key="card.id" 
                  :card="card" 
                  :arrayview="arrayview"
                  :emptyplayset="emptyplayset" 
                  :deckbuilder="deckbuilder && currentSelectedDeck != null"
                  :collection="g_isBearer()" 
                  :currentDeck="currentDeck" 
                  @addcard="addCard" 
                  @removecard="removeCard"
                  @onshowcarddetail="onshowcarddetail" 
                  @mouseentercard="mouseenterCardRech" 
                  @mouseleavecard="mouseleaveCardRech" />
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
            <div class="card-header position-relative">
              <div class="d-flex justify-content-between">
                <div class="d-flex flex-column">
                  <h3 class="fs-5" v-if="currentDeck"><font-awesome-icon :icon="['fas', 'lock']" class="me-2" v-if="!currentDeck.public"/>{{ currentDeck.name }}</h3>
                  <div class="fs-7">Cartes: {{ g_getTotalCardsInDeck({deck: currentDeck}) }}</div>
                </div>
                <div class="d-flex align-items-end">
                  <div class="me-2" v-if="!showVersionsEvol">
                      <div class="input-group" v-if="user && currentSelectedDeck > 0">
                        <Multiselect class="m-0 me-2 aw-selectversion"
                          v-model="currentVersion" 
                          :close-on-select="true" 
                          :options="versions"
                          :canClear="false"
                          :canDeselect="false"
                          />
                        <span class="input-group-append">
                          
                          <BDropdown v-model="showVersionsOptions" start  variant="outline-secondary">
                            <template #button-content>
                              <font-awesome-icon :icon="['fas', 'code-branch']" />
                            </template>
                            
                            <BDropdownItem @click="e_onCreateVersion()">
                              <font-awesome-icon :icon="['far', 'square-plus']" class="me-2" />Créer une version
                            </BDropdownItem>
                            <BDropdownItem @click="e_onShowEvolVersion()" v-if="versions.length > 1">
                              <font-awesome-icon :icon="['fas', 'shuffle']" class="me-2" />Voir les évolutions
                            </BDropdownItem>
                            <BDropdownDivider v-if="versions.length > 1 && currentVersion > 1" />
                            <BDropdownItem @click="e_onDeleteVersion()" variant="danger" v-if="versions.length > 1 && currentVersion > 1">
                              <font-awesome-icon :icon="['far', 'fa-trash-can']" class="me-2" />Supprimer la version
                            </BDropdownItem>
                          </BDropdown>
                        </span>
                      </div>
                    </div>
                    <BButton @click="saveDeck()" variant="primary"  class="me-2" v-if="user && !showVersionsEvol">
                      <font-awesome-icon :icon="['far', 'floppy-disk']" class="me-2" /><span>Enregistrer</span>
                    </BButton>
                    
                                        
                    <BDropdown v-model="showDecklistoptions" start  variant="outline-secondary" v-if="!showVersionsEvol">
                      <template #button-content>
                        <font-awesome-icon :icon="['fas', 'gear']" />
                      </template>
                      <BDropdownItem @click="affModalImportUnique()" variant="unique">
                        <font-awesome-icon :icon="['fas', 'file-arrow-down']" class="me-2" />Importer une carte Unique
                      </BDropdownItem>
                      <BDropdownDivider />
                      <BDropdownItem @click="redirectToDecklist()" v-if="user && currentSelectedDeck > 0" >
                        <font-awesome-icon :icon="['far', 'eye']" class="me-2" />Afficher la DeckList
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
                    <BButton @click="e_hideVersionsEvol" variant="secondary" class="me-2" title="Retour à la decklist" v-if="showVersionsEvol">
                      <font-awesome-icon :icon="['far', 'square-caret-left']" class="me-2"/>Retour
                    </BButton>
                </div>
              </div>
            </div> <!-- /.card-header -->
            <div class="card-body position-relative">
              <div v-if="showVersionsEvol">
                <div class="row">
                  <div class="col-12" v-for="(diffs, index) in versionsDiffs">
                    <hr v-if="index > 0">
                    <div class="d-flex justify-content-center mb-1 mt-2">
                      Version {{diffs.vrsprev }} <i class="altered-etb mt-1 ms-2 me-2"></i> Version {{diffs.vrsnext }}
                    </div>
                    <div class="row">
                      <div class="col-2" v-for="diff in diffs.cards" v-if="diffs.cards.length > 0">
                        <div class="position-relative">
                          <div class="aw-quantitediff position-absolute w-100 h-25 fs-4 d-flex justify-content-center align-items-center">
                            {{ diff.quantite }}
                          </div>                            
                          <img :src="g_getImageCardPublicUrl(diff.card)" :title="diff.card.name" class="img-fluid aw-alteredcard" />
                        </div>
                      </div>
                      <div v-else class="d-flex justify-content-center">
                        Aucune différence
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="ribbon-wrapper ribbon-lg">
                  <div :class="['ribbon text-white', currentDeck.valide ? 'bg-success' : 'bg-danger']">
                  {{ currentDeck.valide ? 'Légal' : 'Non Légal'}}
                  </div>
                </div>
                <div>
                  <div class="row">
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
                          <div class="d-flex justify-content-end">
                            <div v-b-toggle.awid-descdeck class="aw-collapsible">Description <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse mt-1" /></div>
                            <div v-b-toggle.awid-probadeck class="aw-collapsible ms-3">Probas <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse mt-1" /></div>
                          </div>
                          <BCollapse id="awid-descdeck">
                            <div class="col-12 mt-4" v-html="getFormattedDescriptionCurrentDeck()"></div>
                          </BCollapse>
                          <BCollapse id="awid-probadeck">
                            <div class="col-12 mt-4 mb-3">
                              <div class="fs-7">
                                <div class="d-flex justify-content-center fs-6 mb-2 font-weight-bold">
                                  Probabilités en main de départ
                                </div>
                                <div class="row">
                                  <div class="col-4 ">
                                    <div class="font-weight-bold">Personnages</div>
                                    <br>
                                    <div>>= 1 : {{ getProbaPersos(1)[2] }}</div>
                                    <div>>= 2 : {{ getProbaPersos(2)[2] }}</div>
                                    <div>>= 3 : {{ getProbaPersos(3)[2] }}</div>
                                  </div>
                                  <div class="col-4 ">
                                    <div class="font-weight-bold">Sorts</div>
                                    <br>
                                    <div>>= 1 : {{ getProbaSorts(1)[2] }}</div>
                                    <div>>= 2 : {{ getProbaSorts(2)[2] }}</div>
                                    <div>>= 3 : {{ getProbaSorts(3)[2] }}</div>
                                  </div>
                                  <div class="col-4 ">
                                    <div class="font-weight-bold">Permanents</div>
                                    <br>
                                    <div>>= 1 : {{ getProbaPermas(1)[2] }}</div>
                                    <div>>= 2 : {{ getProbaPermas(2)[2] }}</div>
                                    <div>>= 3 : {{ getProbaPermas(3)[2] }}</div>
                                  </div>
                                </div>
                                <hr>
                                <div class="row">
                                  <div class="col-4 ">
                                    <div class="font-weight-bold">Carte en x3</div>
                                    <br>
                                    <div>0 : {{ getProba(1, 3)[3] }}</div>
                                    <hr>
                                    <div>>= 1 : {{ getProba(1, 3)[2] }}</div>
                                    <div>= 1 : {{ getProba(1, 3)[1] }}</div>
                                    <div><= 1 : {{ getProba(1, 3)[0] }}</div>                                
                                    <hr>
                                    <div>>= 2 : {{ getProba(2, 3)[2] }}</div>
                                    <div>= 2 : {{ getProba(2, 3)[1] }}</div>
                                    <div><= 2 : {{ getProba(2, 3)[0] }}</div>                                
                                    <hr>
                                    <div>= 3 : {{ getProba(3, 3)[1] }}</div>
                                  </div>
                                  <div class="col-4">
                                    <div class="font-weight-bold">Carte en x2</div>
                                    <br>
                                    <div>0 : {{ getProba(1, 2)[3] }}</div>
                                    <hr>
                                    <div>>= 1 : {{ getProba(1, 2)[2] }}</div>
                                    <div>= 1 : {{ getProba(1, 2)[1] }}</div>
                                    <div><= 1 : {{ getProba(1, 2)[0] }}</div>                                
                                    <hr>
                                    <div>>= 2 : {{ getProba(2, 2)[2] }}</div>
                                    <div>= 2 : {{ getProba(2, 2)[1] }}</div>                                
                                  </div>
                                  <div class="col-4">
                                    <div class="font-weight-bold">Carte en x1</div>
                                    <br>
                                    <div>0 : {{ getProba(1, 1)[3] }}</div>
                                    <hr>
                                    <div>>= 1 : {{ getProba(1, 1)[2] }}</div>
                                    <div>= 1 : {{ getProba(1, 1)[1] }}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
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
                      :currentDeck="currentDeck" />
                  </div>
                  <div class="row mt-2 pb-2 aw-decklistsorts">
                    <div class="col-12 fs-4 d-flex justify-content-center aw-titletypedecklist">Sorts</div>
                    <CardDecklist v-for="card in getSortsCurrentDeck()" :card="card" @addcard="addCard"
                      @removecard="removeCard" @mouseentercard="mouseenterCard" @mouseleavecard="mouseleaveCard"
                      @onshowcarddetail="onshowcarddetail" :modeliste="uiparams.modeliste"
                      :currentDeck="currentDeck"/>
                  </div>
                  <div class="row mt-2 pb-2 aw-decklistpermas">
                    <div class="col-12 fs-4 d-flex justify-content-center aw-titletypedecklist">Permanents</div>
                    <CardDecklist v-for="card in getPermanentsCurrentDeck()" :card="card" @addcard="addCard"
                      @removecard="removeCard" @mouseentercard="mouseenterCard" @mouseleavecard="mouseleaveCard"
                      @onshowcarddetail="onshowcarddetail" :modeliste="uiparams.modeliste"
                      :currentDeck="currentDeck"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <BModal v-model="modalDeleteDeck" @ok="e_confirmDeleteDeck" centered cancel-title="Annuler" ok-title="Supprimer"
    ok-variant="danger" title="Supprimer un deck">
    Etes-vous sûr de vouloir supprimer le deck ?
  </BModal>

  <BModal v-model="showModalDeleteVersion" @ok="e_confirmDeleteVersion" centered cancel-title="Annuler" ok-title="Supprimer"
    ok-variant="danger" title="Supprimer une version">
    <span v-if="currentDeck">Etes-vous sûr de vouloir supprimer la version {{ currentDeck.version }} du deck {{ currentDeck.name }} ?</span>
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
      <BButton variant="primary" @click="addUniqueToDeck" class="mt-2"  v-if="!g_isOOF(importedUnique, currentDeck)">
          <font-awesome-icon :icon="['fas', 'circle-plus']" class="me-2"/>Ajouter la carte au deck
      </BButton>
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
import { watch, getCurrentInstance } from 'vue'
import { useHead } from '@vueuse/head';
import '@/assets/css/animate.css';

const props = defineProps({
  user: { type: Object},
  deckbuilder: false,
});

useHead({
    title: 'Realtered',
    meta: [
        { property: 'og:title', content: 'Realtered' },
        { property: 'og:description', content: 'Realtered: deckbuilder by Auwelord' },
        { property: 'og:image', content: 'https://fyqptmokmnymednlerpj.supabase.co/storage/v1/object/public/Altered/assets/logos/Realtered.png' },
        { property: 'og:url', content: window.location.href },
        { property: 'og:type', content: 'article' }
    ]
})

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
import { useRouter } from 'vue-router';

const toast = useToast();

export default {
  name: 'Collection',
  data() {
    return {
      cbTriggerCapa: null,
      optTriggers: [
        {value: 'etb', label: 'More space battles!', ico: 'altered-etb'},
        {value: 'hand', label: 'PROFIT!', ico: 'altered-hand'},
        {value: 'reserve', label: 'Discovering new species!', ico: 'altered-reserve'},
        {value: 'exhaust', label: 'We need to go deeper!', ico: 'altered-exhaust'}
      ],
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
      currentSort: ["mainCost", "recallCost", "name"],
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
      imageRechPathFullsize: null,
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
      versions :[
        { value: '1', label: 'Version 1' },
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
      mouserechtimeout: null,
      showDeckoptions: false,
      showDecklistoptions: false,
      showDDCreateDeck: false,
      router: null,
      dureeTimeoutRech: 4000,
      showRechRarete: false,
      timeoutRechRarete: null,
      showRechType: false,
      timeoutRechType: null,
      showRechMaincost: false,
      timeoutRechMaincost: null,
      showRechRecallcost: false,
      timeoutRechRecallcost: null,
      showRechPower: false,
      timeoutRechPower: null,
      showRechKeyword: false,
      timeoutRechKeyword: null,
      showRechSubtype: false,
      timeoutRechSubtype: null,
      showRechEdition: false,
      timeoutRechEdition: null,
      showRechSort: false,
      timeoutRechSort: null,
      cbCapaStatic: false,
      fCapaStatic: null,
      cbCapaEtb: false,
      fCapaEtb: null,
      cbCapaHand: false,
      fCapaHand: null,
      cbCapaReserve: false,
      fCapaReserve: null,
      cbCapaExhaust: false,
      fCapaExhaust: null,
      cbCapaSupport: false,
      fCapaSupport: null,
      starting: true,
      currentVersion: undefined,
      showVersionsOptions: false,
      showModalDeleteVersion: false,
      showVersionsEvol: false,
      versionsDiffs: null,
    };
  },
  mounted() 
  { 
    this.router = useRouter();
    const storeduiparams = localStorage.getItem("uiparams");
    if(storeduiparams) this.uiparams = JSON.parse(storeduiparams);
    
    this.database = localStorage.getItem('database') != null ? localStorage.getItem('database') : true
    var filters = JSON.parse(localStorage.getItem("filters"));
    if (!filters) 
    {
      filters = this.getInitialFilters()
      localStorage.setItem("filters", JSON.stringify(filters));
    }

    this.currentName = filters.currentName
    this.isSelectedCharacter = filters.isSelectedCharacter
    this.isSelectedPermanent = filters.isSelectedPermanent
    this.isSelectedSpell = filters.isSelectedSpell
    this.isSelectedHero = filters.isSelectedHero
    this.isSelectedCommon = filters.isSelectedCommon
    this.isSelectedRare = filters.isSelectedRare
    this.isSelectedUnique = filters.isSelectedUnique
    this.currentSort = filters.currentSort
    this.currentKeywords = filters.currentKeywords
    this.currentEditions = filters.currentEditions
    this.currentSoustypes = filters.currentSoustypes
    this.handCost = filters.handCost
    this.handCostOrMore = filters.handCostOrMore
    this.reserveCost = filters.reserveCost
    this.reserveCostOrMore = filters.reserveCostOrMore
    this.forest = filters.forest
    this.forestOrMore = filters.forestOrMore
    this.water = filters.water
    this.waterOrMore = filters.waterOrMore
    this.mountain = filters.mountain
    this.mountainOrMore = filters.mountainOrMore
    this.cbCapaStatic = filters.cbCapaStatic
    this.cbCapaEtb = filters.cbCapaEtb
    this.cbCapaHand = filters.cbCapaHand
    this.cbCapaReserve = filters.cbCapaReserve
    this.cbCapaExhaust = filters.cbCapaExhaust
    this.cbCapaSupport = filters.cbCapaSupport
    
    this.loadDecks();
    setTimeout(() => this.starting = false, 300)
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
    database(newValue, oldValue){localStorage.setItem('database', newValue)},
    cbCapaStatic(newValue, oldValue){
      if(newValue) this.fCapaStatic = ''
      this.onChangeFilter()
      if(!this.starting) this.setTimeoutRechKeyword()
    },
    cbCapaEtb(newValue, oldValue){
      if(newValue) this.fCapaEtb = ''
      this.onChangeFilter()
      if(!this.starting) this.setTimeoutRechKeyword()
    },
    cbCapaHand(newValue, oldValue){
      if(newValue) this.fCapaHand = ''
      this.onChangeFilter()
      if(!this.starting) this.setTimeoutRechKeyword()
    },
    cbCapaReserve(newValue, oldValue){
      if(newValue) this.fCapaReserve = ''
      this.onChangeFilter()
      if(!this.starting) this.setTimeoutRechKeyword()
    },
    cbCapaExhaust(newValue, oldValue){
      if(newValue) this.fCapaExhaust = ''
      this.onChangeFilter()
      if(!this.starting) this.setTimeoutRechKeyword()
    },
    cbCapaSupport(newValue, oldValue){
      if(newValue) this.fCapaSupport = ''
      this.onChangeFilter()
      if(!this.starting) this.setTimeoutRechKeyword()
    },
    currentVersion(newValue, oldValue){
      if(!oldValue) return //chargement de la page
      if(!this.canTestChangeVersion)
      {
        this.canTestChangeVersion = true
        return
      }
      this.m_setCurrentDeck(newValue)
    }
  },
  inject: ['callShowWaitingScreen', 'callHideWaitingScreen'], // Injecter la méthode de App.vue
  methods: {
    getInitialFilters()
    {
      return {
        isSelectedCharacter: false,
        isSelectedPermanent: false,
        isSelectedSpell: false,
        isSelectedHero: false,
        isSelectedCommon: false,
        isSelectedRare: false,
        isSelectedUnique: false,
        currentNme: '',
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
        cbCapaStatic: false,
        capaStatic: '',
        cbCapaEtb: false,
        capaEtb: '',
        cbCapaHand: false,
        capaHand: '',
        cbCapaReserve: false,
        capaReserve: '',
        cbCapaExhaust: false,
        capaExhaust: '',
        cbCapaSupport: false,
        capaSupport: '',        
      }
    },
    searchAlteredDeck()
    {
      if(this.fIdAlteredDeck)
      {
        var tab = this.fIdAlteredDeck.split('/')
        var id = tab[tab.length - 1]
        this.fIdAlteredDeck = id
        
        this.gaa_fetchDeck(this.fIdAlteredDeck, pdeck => 
        {
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
    onCopierLienDecklist()
    {
      const baseUrl = window.location.origin; 
      const { href: decklisturl } = this.router.resolve({ name: 'DeckList' });
      navigator.clipboard.writeText(baseUrl + decklisturl + '/' + this.currentDeck.id)
      toast("Le lien vers ce deck a été copié dans le presse-papier", { type: TYPE.SUCCESS });
    },
    exporterCurrentDeck()
    {
      
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
    updateUniques()
    {
      this.g_updateCardsFromApi(this.fetchedCards,
        //onUpdatingCard: 
        pcard => this.updatingname = pcard.reference,
        //onUpdatedCards: 
        () => this.updatingname = null
      )
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
      this.currentSelectedDeck = this.currentDeck.refid > 0 ? this.currentDeck.refid : this.currentDeck.id; 
      this.actionOriConfirmChangeDeck = null;
    },
    addUniqueToDeck()
    {
      this.addCard(this.importedUnique)
      this.closeModalImportUnique()
    },
    importerUnique()
    {
      if(!this.codeImportUnique)
      {
        return;
      }

      var tab = this.codeImportUnique.split('/')
      var id = tab[tab.length - 1]
      this.codeImportUnique = id

      const onFetchedCard = pcard => 
      {
        //si la carte a ete trouvé => message d'erreur
        if(pcard)
        {
          this.callHideWaitingScreen()
          this.importedUnique = pcard
          toast("Cette carte existe déjà", { type: TYPE.ERROR })
        }
        else 
        {
          this.g_updateCardFromApi(this.codeImportUnique, 
            //onUpdatedCard: 
            ppcard => 
            {
              if(!ppcard)
              {
                this.callHideWaitingScreen()
                toast("Une erreur s'est produite lors de l'import de la carte", { type: TYPE.ERROR })
                return
              }

              if(this.g_isUnique(ppcard))
              {
                this.g_downloadImages([ppcard], 
                  //onDownloadingImage
                  pppcard => console.log("Téléchargement de l'image " + pppcard.imagePath),
                  //onDownloadedImages
                  pcards => {
                    this.callHideWaitingScreen()
                    this.importedUnique = pcards[0]
                  },
                  //onUpdatedImageS3
                  pppcard => 
                  {
                    if(!pppcard) toast("La carte a été importée mais l'upload de l'image a échoué", { type: TYPE.ERROR })
                    else console.log("maj base Card.imageS3 : " + pppcard.imageS3)
                  }
                )
              }
              else{
                this.callHideWaitingScreen()
                toast("Cette carte n'est pas une unique", { type: TYPE.ERROR });
              }
            })
          }
        }

      this.callShowWaitingScreen(500)
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
      filters.cbCapaStatic = this.cbCapaStatic
      filters.capaStatic = this.fCapaStatic
      filters.cbCapaEtb = this.cbCapaEtb
      filters.capaEtb = this.fCapaEtb
      filters.cbCapaHand = this.cbCapaHand
      filters.capaHand = this.fCapaHand
      filters.cbCapaReserve = this.cbCapaReserve
      filters.capaReserve = this.fCapaReserve
      filters.cbCapaExhaust = this.cbCapaExhaust
      filters.capaExhaust = this.fCapaExhaust
      filters.cbCapaSupport = this.cbCapaSupport
      filters.capaSupport = this.fCapaSupport      
      
      localStorage.setItem("filters", JSON.stringify(filters));
    },
    getProba(pqtedesiree, pqtesuccess)
    {
      return this.g_getProbaMainDeDepart(pqtedesiree, pqtesuccess, this.currentDeck)
    },
    getProbaPersos(pqtedesiree)
    {
      const qtepersos = this.g_getTotalPersosInDeck({deck: this.currentDeck})
      return this.g_getProbaMainDeDepart(pqtedesiree, qtepersos, this.currentDeck)
    },
    getProbaSorts(pqtedesiree)
    {
      const qtesorts = this.g_getTotalSortsInDeck({deck: this.currentDeck})
      return this.g_getProbaMainDeDepart(pqtedesiree, qtesorts, this.currentDeck)
    },
    getProbaPermas(pqtedesiree)
    {
      const qtepermas = this.g_getTotalPermasInDeck({deck: this.currentDeck})
      return this.g_getProbaMainDeDepart(pqtedesiree, qtepermas, this.currentDeck)
    },
    async refreshStatComponent()
    {
      this.renderStatComponent = false;
      // Then, wait for the change to get flushed to the DOM
      await this.$nextTick();
      // Add MyComponent back in
      this.renderStatComponent = true;
    },
    clearFilters()
    {
      var filters = this.getInitialFilters()

      this.currentName = 
      this.isSelectedCharacter = filters.isSelectedCharacter
      this.isSelectedPermanent = filters.isSelectedPermanent
      this.isSelectedSpell = filters.isSelectedSpell
      this.isSelectedHero = filters.isSelectedHero
      this.isSelectedCommon = filters.isSelectedCommon
      this.isSelectedRare = filters.isSelectedRare
      this.isSelectedUnique = filters.isSelectedUnique
      this.currentName = filters.currentName
      //this.currentSort = filters.currentSort
      this.currentKeywords = filters.currentKeywords
      //this.currentEditions = filters.currentEditions
      this.currentSoustypes = filters.currentSoustypes
      this.handCost = filters.handCost
      this.handCostOrMore = filters.handCostOrMore
      this.reserveCost = filters.reserveCost
      this.reserveCostOrMore = filters.reserveCostOrMore
      this.forest = filters.forest
      this.forestOrMore = filters.forestOrMore
      this.water = filters.water
      this.waterOrMore = filters.waterOrMore
      this.mountain = filters.mountain
      this.mountainOrMore = filters.mountainOrMore
      this.cbCapaStatic = filters.cbCapaStatic
      this.fCapaStatic = filters.capaStatic
      this.cbCapaEtb = filters.cbCapaEtb
      this.fCapaEtb = filters.capaEtb
      this.cbCapaHand = filters.cbCapaHand
      this.fCapaHand = filters.capaHand
      this.cbCapaReserve = filters.cbCapaReserve
      this.fCapaReserve = filters.capaReserve
      this.cbCapaSupport = filters.cbCapaSupport
      this.fCapaSupport = filters.capaSupport
      this.cbCapaExhaust = filters.cbCapaExhaust
      this.fCapaExhaust = filters.capaExhaust      

      this.onChangeFilter()
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
    onChangeMainCostOrMore() 
    {
      this.setTimeoutRechMaincost()
      this.onChangeFilter()
    },
    onChangeRecallCostOrMore() 
    {
      this.setTimeoutRechRecallcost()
      this.onChangeFilter()
    },
    onChangeForestOrMore() 
    {
      this.setTimeoutRechPower()
      this.onChangeFilter()
    },
    onChangeMountainOrMore() 
    {
      this.setTimeoutRechPower()
      this.onChangeFilter()
    },
    onChangeWaterOrMore() 
    {
      this.setTimeoutRechPower()
      this.onChangeFilter()
    },
    changeModeListe() {
      this.uiparams.modeliste = !this.uiparams.modeliste
      this.storeUiparams();
    },
    e_showModalDeleteDeck() {
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
          const params = {
            id: storedDeck.id, 
            withcards:true, 
            withfavs: false,
          }

          this.g_fetchDeck(params, deck => 
          {
            this.currentSelectedDeck = deck.id;
            this.currentDeck = deck;
            this.versions = deck.versions.map(version => {
              return {
                  value: version,
                  label: "Version " + version,
              }
            })
            this.currentVersion = this.currentDeck.version

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
        var storedDeck = JSON.parse(localStorage.getItem("currentDeck"))

        if (storedDeck) 
        {          
          if (!pdecks.some(zedeck => zedeck.id == storedDeck.id)) 
          {
            this.decks.push({ value: storedDeck.id, label: storedDeck.name })
          }
          this.currentSelectedDeck = storedDeck.refid > 0 ? storedDeck.refid : storedDeck.id
          this.currentDeck = storedDeck

          if(!storedDeck.versions) storedDeck.versions = [1]

          this.versions = storedDeck.versions.map(version => {
            return {
                value: version,
                label: "Version " + version,
            }
          })
          this.canTestChangeVersion = false
          this.currentVersion = this.currentDeck.version

          if (this.currentDeck.main_faction) {
            this.setCurrentFaction($("#" + this.currentDeck.main_faction));
          }
          // si un héro est présent dans le deck, on récupère sa faction pour préselectionner le filtre faction
        }
        else {
          this.currentDeck = null
          this.currentSelectedDeck = null
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
        mainonly: true,
        myonly: true,
        withhero: true,
        withfavs: false,
        callback : pdecks => this.onFetchedDecks(pdecks, pidDft)
      });
    },
    updateCurrentDeck(pdeck)
    {
      if(pdeck)
      {
        $.extend(this.currentDeck, pdeck) //récup du created, userId, et id
        this.saveCurrentDeckToLocalStorage()
      }
    },
    saveDeck() 
    {
      this.callShowWaitingScreen(500)
      this.g_saveDeck(this.currentDeck, deck =>
      {
        this.updateCurrentDeck(deck)
        this.deckModified = false
        this.callHideWaitingScreen()

        if(deck) toast("Deck enregistré")
        else toast("Une erreur s'est produite lors de la sauvegarde du deck", { type: TYPE.ERROR })
      });  
    },
    e_confirmDeleteDeck() 
    {
      if(this.currentSelectedDeck > 0)
      {
        this.g_deleteDeck(this.currentSelectedDeck, presponse => 
        {
          localStorage.removeItem("currentDeck") //le deck supprimé est forcément le current
          this.loadDecks()
          toast("Le deck a été supprimé", { type: TYPE.SUCCESS })
        }); 
      }
      else
      {
        localStorage.removeItem("currentDeck") //le deck supprimé est forcément le current
        this.loadDecks()
        toast("Le deck a été supprimé", { type: TYPE.SUCCESS })
      }
    },
    saveCurrentDeckToLocalStorage() 
    {
      localStorage.setItem("currentDeck", JSON.stringify(this.currentDeck))
    },
    mouseenterCardRech(card) 
    {
      if(this.mouserechtimeout) clearTimeout(this.mouserechtimeout)
      this.imageRechPathFullsize = this.g_getImageCardPublicUrl(card)  //"/src/assets/img/altered_kojo.png",
    },
    mouseleaveCardRech(card)
    {
      this.mouserechtimeout = setTimeout(() => 
      {
        this.imageRechPathFullsize = null
      }, 200)
    },
    mouseenterCard(card) 
    {
      if(this.deckbuilder) 
      {
        if(this.uiparams.afficherstats != null) this.oldAfficherStats = this.uiparams.afficherstats
        this.uiparams.afficherstats = null
      }
      if(this.mousetimeout) clearTimeout(this.mousetimeout)
      this.imagePathFullsize = this.g_getImageCardPublicUrl(card);  //"/src/assets/img/altered_kojo.png",
    },
    mouseleaveCard(card)
    {      
      this.mousetimeout = setTimeout(() => 
      {
        if(this.deckbuilder) this.uiparams.afficherstats = this.oldAfficherStats;
        this.imagePathFullsize = null
      }, 200)
    },
    onshowcarddetail(card) 
    {
      this.currentCardDetail = card
      this.afficherDetails = true
    },
    removeCard(card) 
    {
      var indice = 0
      for (var pcard of this.currentDeck.cards) 
      {
        if (pcard.reference == card.reference) 
        {
          this.deckModified = true
          pcard.quantite--

          if(this.g_isHero(card))
          {
            this.currentDeck.hero_id = null
            this.currentDeck.hero = null
          }

          if (pcard.quantite == 0) 
          {
            this.currentDeck.cards.splice(indice, 1);
          }
          this.onChangedDeck()
          return
        }
        indice++
      }      
    },
    getXXXsCurrentDeck(ptype) 
    {
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
      this.onChangedDeck()
    },
    onChangedDeck()
    {
      if(!this.currentDeck) return

      //calcul de la validité du deck
      if(!this.currentDeck.main_faction || 
        !this.currentDeck.hero_id ||
        this.g_getTotalCardsInDeck({deck: this.currentDeck}) != 40 || 
        this.g_getTotalRaresInDeck({deck: this.currentDeck}) > 15 ||
        this.g_getTotalUniquesInDeck({deck: this.currentDeck}) > 3 || 
        this.g_containsOOF(this.currentDeck)
      ){
        this.currentDeck.valide = false
      }
      else this.currentDeck.valide = true
      
      this.saveCurrentDeckToLocalStorage()
      this.refreshStatComponent()
    },
    onChangeSorting()
    {
      this.setTimeoutRechSort()
      setTimeout(() => this.onChangeFilter(), 500)
    },
    onChangeKeywords()
    {
      this.setTimeoutRechKeyword()
      setTimeout(() => this.onChangeFilter(), 500)
    },
    onChangeEditions()
    {
      this.setTimeoutRechEdition()
      setTimeout(() => this.onChangeFilter(), 500)
    },
    onChangeSoustypes()
    {
      this.setTimeoutRechSubtype()
      setTimeout(() => this.onChangeFilter(), 500)
    },
    onSelectCurrentDeck() 
    {
      this.m_setCurrentDeck(0)
    },
    e_onDeleteVersion()
    {
      this.showModalDeleteVersion = true
    },
    e_confirmDeleteVersion()
    {
      this.callShowWaitingScreen(500)
      this.g_deleteVersion(this.currentDeck, plastversion => 
      {
        this.m_setCurrentDeck(plastversion) //repositionnement sur la dernière version ?
        this.callHideWaitingScreen()
      })
    },
    e_hideVersionsEvol()
    {
      this.versionsDiffs = null
      this.showVersionsEvol = false
    },
    e_onShowEvolVersion()
    {
      this.callShowWaitingScreen(500)
      this.g_fetchVersionnedDeck(this.currentSelectedDeck, pdecks => 
      {
        //replacement de l'un des deck par le current deck 
        const decks = []
        pdecks.forEach(deck => 
        {
          if (deck.version == this.currentVersion) decks.push(this.currentDeck)
          else decks.push(deck)
        })

        this.versionsDiffs = []
        for(let index = decks.length - 1; index > 0; index--)
        {
          //comparaison decks[index] VS decks[index + 1]
          var deckNext = decks[index - 1]
          var deckPrev = decks[index]

          var compare = {
            vrsprev: deckPrev.version,
            vrsnext: deckNext.version,
            cards: []
          }

          //carte ajoutées
          deckNext.cards.forEach(cardNext => 
          {
            var card = deckPrev.cards.find(cardPrev => cardPrev.id == cardNext.id)
            if(!card)
            {
              //nouvelle carte ajoutée 
              compare.cards.push({
                card: cardNext,
                quantite: cardNext.quantite
              })
            }
            else if(card.quantite != cardNext.quantite)
            {
              //carte avec quantité modifiée
              compare.cards.push({
                card: cardNext,
                quantite: cardNext.quantite - card.quantite
              })
            }
          })

          //cartes retirées
          deckPrev.cards.forEach(cardPrev => 
          {
            var card = deckNext.cards.find(cardNext => cardPrev.id == cardNext.id)
            if(!card)
            {
              compare.cards.push({
                card: cardPrev,
                quantite: cardPrev.quantite * -1
              })
            }
          })

          compare.cards.sort((cardA, cardB) => {
            if(cardA.quantite != cardB.quantite) return cardA.quantite - cardB.quantite
            return cardA.card.name.localeCompare(cardB.card.name)
          })
          this.versionsDiffs.unshift(compare)
        }

        this.showVersionsEvol = true
        this.callHideWaitingScreen()
      })      
    },
    e_onCreateVersion()
    {
      this.callShowWaitingScreen(500)
      this.g_createVersion(this.currentDeck, pdeck => 
      {
        this.m_setCurrentDeck(pdeck.version)
        this.callHideWaitingScreen()
      })
    },
    m_setCurrentDeck(pversion) 
    {
      if(this.deckModified && !this.showModalConfirmChangeDeck)
      {
        this.showModalConfirmChangeDeck = true
        this.actionOriConfirmChangeDeck = "CHANGER"
        return
      }

      if(this.currentSelectedDeck == 0)
      {
        //si on sélectionne un deck en cours de création c'est que les données ont déjà été perdues....
        //on reinit le current Deck
        var option = this.decks.find(daik => daik.value == 0)
        this.initEmptyNewDeck(option.label)
        return
      }

      this.deckModified = false;

      const params = {
        id: this.currentSelectedDeck, 
        version: pversion,
        withcards: true, 
        withversions: true,
        lastversion: pversion == 0, //la sélection du currentdeck par la combo est forcément positionné sur la version 1
        withfavs: false,
      }

      this.g_fetchDeck(params, deck => 
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
          this.currentSelectedDeck = this.currentDeck.refid > 0 ? this.currentDeck.refid : this.currentDeck.id;
          
          //on reinit la combo car on peut venir de la creation de version
          this.versions = this.currentDeck.versions.map(version => {
            return {
                value: version,
                label: "Version " + version,
            }
          })
          this.currentVersion = this.currentDeck.version
          
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

      this.callShowWaitingScreen(500)
      this.g_saveProprietesDeck(this.currentDeck, pdeck => 
      {
        this.callHideWaitingScreen()
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
          this.callShowWaitingScreen(500)
          this.g_importDeck({name: this.newDeckName, cards: decklist},
            //onImportedDeck: 
            pdeck => 
            {
              this.callHideWaitingScreen()
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
          this.callHideWaitingScreen()
          console.log(error);
          toast('Une erreur s\'est produite', { type: TYPE.ERROR });
        }
        return;
      }

      this.decks.unshift({ value: 0, label: this.newDeckName });

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
    copierDeck()
    {
      //NB: on n'enregistre pas en base le deck
      const newdeck = $.extend({}, this.currentDeck);
      newdeck.id = 0
      newdeck.refid = 0
      newdeck.name += ' (copie)'
      newdeck.versions = [1]
      newdeck.version = 1

      this.currentDeck = newdeck
      this.saveCurrentDeckToLocalStorage()
      this.loadDecks(0)
      this.deckModified = true
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
    onChangeStat(event) 
    {
      var rangePercent = this.forest;

      if ($(event.target).attr("id") == "mountain") rangePercent = this.mountain;
      // : this.forest);
      $(event.target).css('filter', 'grayscale(' + (50 - (5 * rangePercent)) + '%)');

      this.setTimeoutRechPower()
      this.onChangeFilter();
    },
    onChangeMaincost(event)
    {
      var rangePercent = this.handCost * 10;
      $(event.target).css('filter', 'hue-rotate(-' + rangePercent + 'deg)');

      this.setTimeoutRechMaincost()
      this.onChangeFilter();
    },
    onChangeRecallCost(event) 
    {
      var rangePercent = this.reserveCost * 10;
      $(event.target).css('filter', 'hue-rotate(-' + rangePercent + 'deg)');

      this.setTimeoutRechRecallcost()
      this.onChangeFilter();
    },
    selectCharacter() 
    {
      this.setTimeoutRechType()
      this.isSelectedCharacter = !this.isSelectedCharacter;
      this.onChangeFilter();
    },
    selectSpell() 
    {
      this.setTimeoutRechType()
      this.isSelectedSpell = !this.isSelectedSpell;
      this.onChangeFilter();
    },
    selectPermanent() 
    {
      this.setTimeoutRechType()
      this.isSelectedPermanent = !this.isSelectedPermanent;
      this.onChangeFilter();
    },
    selectHero() 
    {
      this.setTimeoutRechType()
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
    selectCommon() 
    {
      this.setTimeoutRechRarete()
      this.isSelectedCommon = !this.isSelectedCommon
      this.onChangeFilter()
    },
    selectRare() 
    {
      this.setTimeoutRechRarete()
      this.isSelectedRare = !this.isSelectedRare
      this.onChangeFilter()
    },
    selectUnique() 
    {
      this.setTimeoutRechRarete()
      this.isSelectedUnique = !this.isSelectedUnique
      this.onChangeFilter()
    },
    setTimeoutRechRarete()
    {
      this.showRechRarete = true
      clearTimeout(this.timeoutRechRarete)

      this.timeoutRechRarete = setTimeout(() => {
        this.showRechRarete = false
      }, this.dureeTimeoutRech)
    },
    setTimeoutRechType()
    {
      this.showRechType = true
      clearTimeout(this.timeoutRechType)

      this.timeoutRechType = setTimeout(() => {
        this.showRechType = false
      }, this.dureeTimeoutRech)
    },
    setTimeoutRechMaincost()
    {
      this.showRechMaincost = true
      clearTimeout(this.timeoutRechMaincost)

      this.timeoutRechMaincost = setTimeout(() => {
        this.showRechMaincost = false
      }, this.dureeTimeoutRech)
    },
    setTimeoutRechRecallcost()
    {
      this.showRechRecallcost = true
      clearTimeout(this.timeoutRechRecallcost)

      this.timeoutRechRecallcost = setTimeout(() => {
        this.showRechRecallcost = false
      }, this.dureeTimeoutRech)
    },
    setTimeoutRechPower()
    {
      this.showRechPower = true
      clearTimeout(this.timeoutRechPower)

      this.timeoutRechPower = setTimeout(() => {
        this.showRechPower = false
      }, this.dureeTimeoutRech)
    },
    setTimeoutRechKeyword()
    {
      this.showRechKeyword = true
      clearTimeout(this.timeoutRechKeyword)

      this.timeoutRechKeyword = setTimeout(() => {
        this.showRechKeyword = false
      }, this.dureeTimeoutRech)
    },
    setTimeoutRechSubtype()
    {
      this.showRechSubtype = true
      clearTimeout(this.timeoutRechSubtype)

      this.timeoutRechSubtype = setTimeout(() => {
        this.showRechSubtype = false
      }, this.dureeTimeoutRech)
    },
    setTimeoutRechEdition()
    {
      this.showRechEdition = true
      clearTimeout(this.timeoutRechEdition)

      this.timeoutRechEdition = setTimeout(() => {
        this.showRechEdition = false
      }, this.dureeTimeoutRech)
    },
    setTimeoutRechSort()
    {
      this.showRechSort = true
      clearTimeout(this.timeoutRechSort)

      this.timeoutRechSort = setTimeout(() => {
        this.showRechSort = false
      }, this.dureeTimeoutRech)
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
        capaStaticNonVide: this.cbCapaStatic,
        capaStatic: this.fCapaStatic,
        capaEtbNonVide: this.cbCapaEtb,
        capaEtb: this.fCapaEtb,
        capaHandNonVide: this.cbCapaHand,
        capaHand: this.fCapaHand,
        capaReserveNonVide: this.cbCapaReserve,
        capaReserve: this.fCapaReserve,
        capaSupportNonVide: this.cbCapaSupport,
        capaSupport: this.fCapaSupport,
        capaExhaustNonVide: this.cbCapaExhaust,
        capaExhaust: this.fCapaExhaust,
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
.multiselect.aw-selectversion .multiselect-wrapper
{
  min-height: auto;
}
</style>

<style scoped>
.multiselect.aw-selectversion
{
  width: 160px;
  min-height: auto;
}

.aw-quantitediff
{
  background-color: #00000096;
  color: white;
  bottom: 0;
}

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

.aw-herodeck {
  min-height: 210px;
}

.aw-decklist .card-body {
  min-height: 130px;
  background-image: url(/src/assets/img/bgarch.png);
  background-repeat: repeat;
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
</style>