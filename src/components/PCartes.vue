<template>
  <div :class="['aw-wrapper', deckbuilder ? 'aw-deckbuilder' : '']">
    <img src="@/assets/img/collectionfond.png" class="aw-fond" />

    <div class="container-fluid pt-2"> <!--begin::Row-->
      <div class="row">
        <div class="col-12 col-xl-3">
          <div :class="['aw-imgapercu', showImageFullsize ? 'aw-imageapon' : '']">
            <div class="aw-imgapercustick">
              <img :src="g_getImageApercu(imagePathFullsize)" class="img-fluid aw-alteredcard" />
            </div>
          </div>
          <div v-if="deckbuilder" class="card card-outline card-info mb-1">
            <div class="card-header">
              <h3 class="card-title">{{$t('ui.lib.mesdecks')}}</h3>
              <div class="card-tools d-flex">
                <div v-if="g_isAdmin(user) && !creatingDeck && !proprietingdeck">
                  {{$t('ui.lib.tournois')}}
                  <label class="switch me-2">
                    <input type="checkbox" v-model="cbdeckstournois">
                    <span class="slider round"></span>
                  </label>
                </div>
                <BDropdown v-model="showDDCreateDeck" v-if="!creatingDeck && !proprietingdeck" size="sm" split variant="primary" class="me-2" @click="createDeck">
                  <template #button-content>
                    <font-awesome-icon :icon="['fas', 'circle-plus']" class="me-2"/>{{$t('ui.action.creer')}}
                  </template>
                  <BDropdownItem v-if="!user" @click="g_connectUser($route.path)">Connectez-vous pour importer un deck</BDropdownItem>

                  <BDropdownItem @click="copierDeck" v-if="user && currentSelectedDeck > 0">
                    <font-awesome-icon :icon="['far', 'copy']" class="me-2" />{{$t('ui.action.copier')}}
                  </BDropdownItem>
                  <BDropdownItem @click="importDeck" v-if="user">
                    <font-awesome-icon :icon="['fas', 'file-arrow-down']" class="me-2" />{{$t('ui.action.importer')}}
                  </BDropdownItem>
                </BDropdown>
                <BDropdown v-model="showDeckoptions" start size="md" variant="outline-secondary" v-if="currentDeck && !creatingDeck && !proprietingdeck">
                  <template #button-content>
                    <font-awesome-icon :icon="['fas', 'gear']" />
                  </template>
                  <BDropdownItem @click="onShowProprietesDeck" v-if="!creatingDeck && user && currentSelectedDeck > 0 && !proprietingdeck">
                    <font-awesome-icon :icon="['fas', 'gear']" class="me-2" />{{$t('ui.lib.proprietes')}}
                  </BDropdownItem>
                  <BDropdownItem @click="exporterCurrentDeck()">
                    <font-awesome-icon :icon="['fas', 'file-export']" class="me-2"/>{{$t('ui.action.exporter')}}
                  </BDropdownItem>
                  <BDropdownItem @click="onCopierLienDecklist()" v-if="user && currentSelectedDeck > 0">
                    <font-awesome-icon :icon="['fab', 'threads']" class="me-2"/>{{$t('ui.action.copierliendl')}}
                  </BDropdownItem>             
                  <BDropdownDivider />  
                  <BDropdownItem  @click="e_showModalDeleteDeck()" variant="danger">
                      <font-awesome-icon :icon="['far', 'trash-can']" class="me-2" />{{$t('ui.action.supprimer')}}
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
                <div class="input-group mb-2" v-if="isImporting() || proprietingdeck"> <!--v-if="isImporting()"-->
                  <input type="text" class="form-control" :placeholder="$t('ui.lib.deckidaltered')" v-model="fIdAlteredDeck">
                  <span class="input-group-append" v-if="!proprietingdeck">
                    <BButton variant="primary" @click="e_searchAlteredDeck"><font-awesome-icon :icon="['fas', 'magnifying-glass']" /></BButton>
                  </span>
                </div>

                <Multiselect class="me-2 aw-selecttournoi w-100 mb-2" v-if="tournois && g_isAdmin(user) && !proprietingdeck"
                          v-model="cbtournoi" 
                          :close-on-select="true" 
                          :options="tournois"
                          :canClear="true"
                          :canDeselect="true"
                          />
                <BFormInput placeholder="Classement du deck" v-model="fPosTournoi" v-if="tournois && cbtournoi && g_isAdmin(user)" class="mb-2" />

                <BInputGroup>
                  <BFormInput required id="awid-fdeckname" v-model="newDeckName" type="text" class="form-control" :placeholder="$t('ui.lib.nomdeck')" />
                </BInputGroup>
                <BInputGroup class="ms-1 mt-2" v-if="isImporting()">
                  <BFormCheckbox v-model="cbsetuniquefav">Ajouter les uniques en favori</BFormCheckbox>
                </BInputGroup>
                <BInputGroup class="mt-2">
                  <BFormInput required v-model="newDeckExturl" type="text" class="form-control" placeholder="Url article" />
                </BInputGroup>
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
                  <BButton @click="cancelCreateDeck" variant="light" size="sm" class="mt-2 me-2">
                    {{$t('ui.action.annuler')}}
                  </BButton>
                  <BButton @click="checkCreateDeck" variant="success" size="sm" class="mt-2">
                    {{$t('ui.action.valider')}}
                  </BButton>
                </div>
              </div>
            </div> <!-- /.card-body -->
          </div>
          <div v-if="!imageRechPathFullsize">
            <div class="card card-outline card-warning">
              <div class="card-header">
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
                  <BDropdown v-model="showDDOptionsCardSearch" v-if="!deckbuilder && g_isBearer()" variant="secondary" class="me-2 aw-cardssearchoptions">
                    <template #button-content>
                      <font-awesome-icon :icon="['fas', 'gear']" />
                    </template>
                    <BDropdownItem id="awid-affmissingcollection" @click="e_showMissingCollection" v-if="!affmissingcollection">
                      <font-awesome-icon :icon="['far', 'eye']" class="me-2" />Indiquer les cartes manquantes
                    </BDropdownItem>
                    <BDropdownItem id="awid-affmissingtrade" @click="e_showMissingTrade" v-if="!affmissingtrade">
                      <font-awesome-icon :icon="['far', 'eye']" class="me-2" />Indiquer les trades manquants
                    </BDropdownItem>
                    <BDropdownItem id="awid-affmissingwant" @click="e_showMissingWant" v-if="!affmissingwant">
                      <font-awesome-icon :icon="['far', 'eye']" class="me-2" />Indiquer les wants manquants
                    </BDropdownItem>
                  </BDropdown>
                  <BButton @click="searchCardsBtnRechercher()" variant="unique" size="sm">
                    <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="me-2" />{{$t('ui.action.rechercher')}}
                  </BButton>
                </div>
              </div> <!-- /.card-header -->
              <div class="card-header" v-if="g_isAdmin(user)">
                <div v-if="!database && fetchedCards && currentFaction != ''">
                  <BButton @click="updateDetailFromApi" variant="secondary" size="sm" class="me-2" v-if="g_isLocaleFrench()">
                    <font-awesome-icon :icon="['fas', 'file-import']" class="me-2" />Details <span v-if="cptupdatecard > 0">{{  cptupdatecard }} / {{fetchedCards.length}}</span>
                  </BButton>
                </div>
                <BButton @click="onClickDownloadImages" variant="secondary" size="sm" class="me-2">
                  <font-awesome-icon :icon="['fas', 'file-import']" class="me-2" />Images <span v-if="cptupdatecard > 0">{{  cptupdatecard }} / {{fetchedCards.length}}</span>
                </BButton>
                <BButton @click="updateDetailFromApi" variant="secondary" size="sm" class="me-2" title="Mettre à jour les uniques" v-if="g_isAdmin(user) && database">
                  <font-awesome-icon :icon="['fas', 'pen-clip']" class="me-2" />Update uniques <span v-if="cptupdatecard > 0">{{  cptupdatecard }} / {{fetchedCards.length}}</span>
                </BButton>
              </div>
              <div class="card-body">
                <div class="card-group justify-content-between aw-factionsel mb-4">
                  <a href="#" id="AX" :title="canSelectFaction() ? 'Sélection de la faction Axiom' : 'La sélection des factions n\'est pas possible tant que le héro du deck a été choisi'"
                      :class="['mb-2 aw-axiom', isCurrentAxiom() ? 'aw-selected' : '', canSelectFaction() ? '' : 'aw-opacity25 aw-cursor-notallowed']"
                      @click="changeFaction">
                        <img src="@/assets/img/altered/factions/axiom.webp" class="aw-faction" />
                  </a>
                  <a href="#" id="BR" :title="canSelectFaction() ? 'Sélection de la faction Bravos' : 'La sélection des factions n\'est pas possible tant que le héro du deck a été choisi'"
                      :class="['mb-2 aw-bravos', isCurrentBravos() ? 'aw-selected' : '', canSelectFaction() ? '' : 'aw-opacity25 aw-cursor-notallowed']"
                      @click="changeFaction">
                        <img src="@/assets/img/altered/factions/bravos.webp" class="aw-faction" />
                  </a>
                  <a href="#" id="LY" :title="canSelectFaction() ? 'Sélection de la faction Lyra' : 'La sélection des factions n\'est pas possible tant que le héro du deck a été choisi'"
                      :class="['mb-2 aw-lyra', isCurrentLyra() ? 'aw-selected' : '', canSelectFaction() ? '' : 'aw-opacity25 aw-cursor-notallowed']"
                      @click="changeFaction">
                        <img src="@/assets/img/altered/factions/lyra.webp" class="aw-faction" />
                  </a>
                  <a href="#" id="MU" :title="canSelectFaction() ? 'Sélection de la faction Muna' : 'La sélection des factions n\'est pas possible tant que le héro du deck a été choisi'"
                      :class="['mb-2 aw-muna', isCurrentMuna() ? 'aw-selected' : '', canSelectFaction() ? '' : 'aw-opacity25 aw-cursor-notallowed']"
                      @click="changeFaction">
                        <img src="@/assets/img/altered/factions/muna.webp" class="aw-faction" />
                  </a>
                  <a href="#" id="OR" :title="canSelectFaction() ? 'Sélection de la faction Ordis' : 'La sélection des factions n\'est pas possible tant que le héro du deck a été choisi'"
                      :class="['mb-2 aw-ordis', isCurrentOrdis() ? 'aw-selected' : '', canSelectFaction() ? '' : 'aw-opacity25 aw-cursor-notallowed']"
                      @click="changeFaction">
                        <img src="@/assets/img/altered/factions/ordis.webp" class="aw-faction" />
                  </a>
                  <a href="#" id="YZ" :title="canSelectFaction() ? 'Sélection de la faction Yzmir' : 'La sélection des factions n\'est pas possible tant que le héro du deck a été choisi'"
                      :class="['mb-2 aw-yzmir', isCurrentYzmir() ? 'aw-selected' : '', canSelectFaction() ? '' : 'aw-opacity25 aw-cursor-notallowed']"
                      @click="changeFaction">
                        <img src="@/assets/img/altered/factions/yzmir.webp" class="aw-faction" />
                  </a>
                </div>
                <div class="input-group">
                  <div class="d-flex flex-column flex-fill align-items-center">
                    <input type="text" class="form-control" :placeholder="$t('ui.lib.nomcarte')" 
                      v-model="currentName" 
                      @keyup.enter="searchCards(false, false)" />
                  </div>
                </div>

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  <div>
                    <BButton @click="searchCards(false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechRarete && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    {{$t('ui.lib.rarete')}}
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtresrarity>
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
                  </div>
                </div>
                <BCollapse id="awid-filtresrarity" v-model="uiparams.filtreRarity" @hide="storeUiparams" @show="storeUiparams">
                  <div class="d-flex justify-content-evenly aw-raritysel mt-2">
                    <a href="javascript:" id="COMMON" :class="['aw-common', isSelectedCommon ? 'aw-selected' : '']"
                      @click="selectCommon"><Common :width="40" class="aw-rarity" /></a>
                    <a href="javascript:" id="RARE" :class="['aw-rare', isSelectedRare ? 'aw-selected' : '']"
                      @click="selectRare"><Rare :width="40" class="aw-rarity" /></a>

                    <a href="javascript:" id="UNIQUE" v-if="user"
                      :class="['aw-unique', isSelectedUnique ? 'aw-selected' : '']" 
                      @click="selectUnique"><Unique :width="40" class="aw-rarity" /></a>
                    <img v-else class="aw-cursor-notallowed" src="@/assets/img/altered/rarities/unique.png" title="Connectez-vous pour rechercher vos uniques ajoutées à vos favoris"/>
                  </div>

                </BCollapse>

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  <div>
                    <BButton @click="searchCards(false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechType && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    Type
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtrestype>
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
                  </div>
                </div>
                <BCollapse id="awid-filtrestype" v-model="uiparams.filtreType" @hide="storeUiparams" @show="storeUiparams">
                  <div class="card-group justify-content-between aw-type mt-2">
                    <a href="javascript:" id="CHARACTER" title="Sélection du type Personnage"
                        :class="['aw-character d-flex flex-column align-items-center mb-3', isSelectedCharacter ? 'aw-selected' : '']"
                        @click="selectCharacter">
                          <font-awesome-icon :icon="['fas', 'person-walking']" class="fs-4" /><span>{{$t('ui.lib.personnage')}}</span>
                    </a>
                    <a href="javascript:" id="SPELL" :title="isSelectedUnique ? 'Le type Sort ne peut pas être activé pour une rareté Unique' : 'Sélection du type Sort'"
                        :class="['aw-spell d-flex flex-column align-items-center mb-3', isSelectedSpell ? 'aw-selected' : '', isSelectedUnique ? 'aw-opacity25 aw-cursor-notallowed': '']"
                        @click="selectSpell">
                          <font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" class="fs-4" /><span>{{$t('ui.lib.sort')}}</span>
                    </a>
                    <a href="javascript:" id="PERMANENT" :title="isSelectedUnique ? 'Le type Permanent ne peut pas être activé pour une rareté Unique' : 'Sélection du type Permanent'"
                        :class="['aw-permanent d-flex flex-column align-items-center mb-3', isSelectedPermanent ? 'aw-selected' : '', isSelectedUnique ? 'aw-opacity25 aw-cursor-notallowed': '']"
                        @click="selectPermanent">
                          <font-awesome-icon :icon="['fas', 'building-shield']" class="fs-4" /><span>{{$t('ui.lib.permanent')}}</span>
                    </a>
                    <a href="javascript:" id="HERO" :title="isSelectedUnique ? 'Le type Héro ne peut pas être activé pour une rareté Unique' : 'Sélection du type Héro'"
                        :class="['aw-hero d-flex flex-column align-items-center mb-3', isSelectedHero ? 'aw-selected' : '', isSelectedUnique ? 'aw-opacity25 aw-cursor-notallowed': '']"
                        @click="selectHero">
                          <font-awesome-icon :icon="['fas', 'mask']" class="fs-4" /><span>{{$t('ui.lib.hero')}}</span>
                    </a>
                    <a href="javascript:" v-if="g_isAdmin(user)" id="TOKEN" :title="isSelectedUnique ? 'Le type Token ne peut pas être activé pour une rareté Unique' : 'Sélection du type Token'"
                        :class="['aw-token d-flex flex-column align-items-center mb-3', isSelectedToken ? 'aw-selected' : '', isSelectedUnique ? 'aw-opacity25 aw-cursor-notallowed': '']"
                        @click="selectToken">
                          <font-awesome-icon :icon="['fas', 'robot']" class="fs-4" /><span>{{$t('ui.lib.token')}}</span>
                    </a>
                  </div>
                </BCollapse>
                
                <hr>
                <div class="d-flex justify-content-between mt-3">
                  <div>
                    <BButton @click="searchCards(false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechMaincost && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    {{$t('ui.lib.maincost')}}
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
                      <BFormCheckbox v-model="handCostOrMore" value="ouplus" @change="onChangeMainCostOrMore">{{$t('ui.lib.etplus')}}
                      </BFormCheckbox>
                    </div>
                    <div>
                      <BFormCheckbox v-model="handCostOrMore" value="oumoins" @change="onChangeMainCostOrMore">{{$t('ui.lib.etmoins')}}
                      </BFormCheckbox>
                    </div>
                  </div>
                  <div class="aw-slider aw-handcost">
                    <input type="range" id="handCost" v-model="handCost" class="w-100 mt-0" min="0" max="10" step="1"
                      value="1" @change="onChangeMaincost" />
                  </div>
                </div>
                </BCollapse>

                <hr>
                <div class="d-flex justify-content-between mt-3 mb-2">
                  <div>
                    <BButton @click="searchCards(false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechRecallcost && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    {{$t('ui.lib.recallcost')}}
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
                      <BFormCheckbox v-model="reserveCostOrMore" value="ouplus" @change="onChangeRecallCostOrMore">{{$t('ui.lib.etplus')}}</BFormCheckbox>
                    </div>
                    <div>
                      <BFormCheckbox v-model="reserveCostOrMore" value="oumoins" @change="onChangeRecallCostOrMore">{{$t('ui.lib.etmoins')}}</BFormCheckbox>
                    </div>
                  </div>
                  <div class="aw-slider aw-reservecost">
                    <input type="range" id="reserveCost" v-model="reserveCost" class="w-100 mt-0" min="0" max="10"
                      step="1" value="1" @change="onChangeRecallCost" />
                  </div>
                </div>
                </BCollapse>

                <div v-if="isSelectedCharacter">
                  <hr>
                  <div class="d-flex justify-content-between mt-3">
                    <div>
                      <BButton @click="searchCards(false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechPower && currentFaction">
                        <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                      </BButton>
                      {{$t('ui.lib.patates')}}
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
                          <BFormCheckbox v-model="forestOrMore" value="ouplus" @change="onChangeForestOrMore">{{$t('ui.lib.etplus')}}</BFormCheckbox>
                        </div>
                        <div>
                          <BFormCheckbox v-model="forestOrMore" value="oumoins" @change="onChangeForestOrMore">{{$t('ui.lib.etmoins')}}</BFormCheckbox>
                        </div>
                      </div>
                      <div class="aw-slider">
                        <input type="range" id="forest" v-model="forest" class="w-100" min="0" max="10" step="1" value="0"
                          @change="onChangeStat" />
                      </div>
                      <div class="card-group justify-content-between align-items-center mt-2">
                        <div><i class="altered-mountain fs-5 me-2"></i><span class="fs-3">{{ mountain }}</span></div>
                        <div>
                          <BFormCheckbox v-model="mountainOrMore" value="ouplus" @change="onChangeMountainOrMore">{{$t('ui.lib.etplus')}}</BFormCheckbox>
                        </div>
                        <div>
                          <BFormCheckbox v-model="mountainOrMore" value="oumoins" @change="onChangeMountainOrMore">{{$t('ui.lib.etmoins')}}</BFormCheckbox>
                        </div>
                      </div>
                      <div class="aw-slider">
                        <input type="range" id="mountain" v-model="mountain" class="w-100" min="0" max="10" step="1"
                          value="0" @change="onChangeStat" />
                      </div>
                      <div class="card-group justify-content-between align-items-center mt-2">
                        <div><i class="altered-ocean fs-5 me-2"></i><span class="fs-3">{{ water }}</span></div>
                        <div>
                          <BFormCheckbox v-model="waterOrMore" value="ouplus" @change="onChangeWaterOrMore">{{$t('ui.lib.etplus')}}</BFormCheckbox>
                        </div>
                        <div>
                          <BFormCheckbox v-model="waterOrMore" value="oumoins" @change="onChangeWaterOrMore">{{$t('ui.lib.etmoins')}}</BFormCheckbox>
                        </div>
                      </div>
                      <div class="aw-slider">
                        <input type="range" id="ocean" v-model="water" class="w-100" min="0" max="10" step="1" value="0"
                          @change="onChangeStat" />
                      </div>
                    </div>
                  </BCollapse>
                </div>

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  <div class="mb-1">
                    <BButton @click="searchCards(false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechKeyword && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    {{$t('ui.lib.motscles')}} / {{$t('ui.lib.capacites')}}
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtreskeyword>
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
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
                    <BFormCheckbox v-model="cbCapaStatic">{{$t('ui.lib.staticabilnotempty')}}</BFormCheckbox>
                  </BInputGroup>
                  <BInputGroup>
                    <template #prepend>
                      <BInputGroupText><font-awesome-icon :icon="['fas', 'ban']" /></BInputGroupText>
                    </template>
                    <BFormInput :placeholder="$t('ui.lib.textedanscapa')"
                        :disabled="cbCapaStatic"
                        v-model="fCapaStatic"
                        @keyup.enter="searchCards(false, false)" />
                  </BInputGroup>
                  <BInputGroup class="mt-2 ms-5">
                    <BFormCheckbox v-model="cbCapaEtb">{{$t('ui.lib.capacite')}} <i class="altered-etb"></i> {{$t('ui.lib.nonvide')}}</BFormCheckbox>
                  </BInputGroup>
                  <BInputGroup>
                    <template #prepend>
                      <BInputGroupText><i class="altered-etb"></i></BInputGroupText>
                    </template>
                    <BFormInput :placeholder="$t('ui.lib.textedanscapa')"
                        :disabled="cbCapaEtb"
                        v-model="fCapaEtb"
                        @keyup.enter="searchCards(false, false)" />
                  </BInputGroup>
                  <BInputGroup class="mt-2 ms-5">
                    <BFormCheckbox v-model="cbCapaHand">{{$t('ui.lib.capacite')}} <i class="altered-hand"></i> {{$t('ui.lib.nonvide')}}</BFormCheckbox>
                  </BInputGroup>
                  <BInputGroup>
                    <template #prepend>
                      <BInputGroupText>	<i class="altered-hand"></i></BInputGroupText>
                    </template>
                    <BFormInput :placeholder="$t('ui.lib.textedanscapa')"
                        :disabled="cbCapaHand"
                        v-model="fCapaHand"
                        @keyup.enter="searchCards(false, false)" />
                  </BInputGroup>
                  <BInputGroup class="mt-2 ms-5">
                    <BFormCheckbox v-model="cbCapaReserve">{{$t('ui.lib.capacite')}} <i class="altered-reserve"></i> {{$t('ui.lib.nonvide')}}</BFormCheckbox>
                  </BInputGroup>
                  <BInputGroup>
                    <template #prepend>
                      <BInputGroupText><i class="altered-reserve"></i></BInputGroupText>
                    </template>
                    <BFormInput :placeholder="$t('ui.lib.textedanscapa')"
                        :disabled="cbCapaReserve"
                        v-model="fCapaReserve"
                        @keyup.enter="searchCards(false, false)" />
                  </BInputGroup>
                  <BInputGroup class="mt-2 ms-5">
                    <BFormCheckbox v-model="cbCapaExhaust">{{$t('ui.lib.capacite')}} <i class="altered-exhaust"></i> {{$t('ui.lib.nonvide')}}</BFormCheckbox>
                  </BInputGroup>
                  <BInputGroup>
                    <template #prepend>
                      <BInputGroupText><i class="altered-exhaust"></i></BInputGroupText>
                    </template>
                    <BFormInput :placeholder="$t('ui.lib.textedanscapa')"
                        :disabled="cbCapaExhaust"
                        v-model="fCapaExhaust"
                        @keyup.enter="searchCards(false, false)" />
                  </BInputGroup>
                  <BInputGroup class="mt-2 ms-5">
                    <BFormCheckbox v-model="cbCapaSupport">{{$t('ui.lib.capacite')}} <i class="altered-support"></i> {{$t('ui.lib.nonvide')}}</BFormCheckbox>
                  </BInputGroup>
                  <BInputGroup>
                    <template #prepend>
                      <BInputGroupText><i class="altered-support"></i></BInputGroupText>
                    </template>
                    <BFormInput :placeholder="$t('ui.lib.textedanscapa')"
                        :disabled="cbCapaSupport"
                        v-model="fCapaSupport"
                        @keyup.enter="searchCards(false, false)" />
                  </BInputGroup>                  
                </BCollapse>

                <hr>
                <div class="d-flex justify-content-between mt-3">
                  <div class="mb-1">
                    <BButton @click="searchCards(false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechSubtype && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    {{$t('ui.lib.soustypes')}}
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtressubtype>
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
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
                    <BButton @click="searchCards(false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechEdition && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    Editions
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtresedition>
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
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
                    <BButton @click="searchCards(false, false)" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechSort && currentFaction">
                      <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </BButton>
                    {{$t('ui.lib.trierpar')}}
                  </div>
                  <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtrestri>
                    <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
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
            <div class="row" v-if="!hasResult() && !loading && !uiparams.afficherstats">
              <div class="col-12 d-flex flex-column align-items-center">
                  <div class="fs-4">{{$t('ui.alert.selectfaction')}}</div>
                  <img src="/src/assets/img/empty.png" alt="" class="mt-5" style="width: 300px" />
              </div>
            </div>
            <div v-if="currentDeck && deckbuilder && currentSelectedDeck != null && uiparams.afficherstats">
              <DeckStats :currentDeck="currentDeck" v-if="renderStatComponent"/>
            </div>
            <div v-if="!uiparams.afficherstats">
              <div class="row aw-resultsearch">
                <Card v-for="card in fetchedCards" 
                  :key="card.id" 
                  :card="card" 
                  :emptyplayset="emptyplayset" 
                  :deckbuilder="deckbuilder && currentSelectedDeck != null"
                  :user="user"
                  :currentDeck="currentDeck" 
                  :affmissingcollection='affmissingcollection'
                  :affmissingtrade='affmissingtrade'
                  :affmissingwant='affmissingwant'
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
            </div>
          </div>
        </div>
        <div class="col-12 col-xl-5" v-if="deckbuilder && currentDeck">
          <div class="card card-outline card-primary mb-1 aw-decklist">
            <div class="card-header position-relative">
              <div class="d-flex justify-content-between">
                <div class="d-flex flex-column">
                  <h3 class="fs-5" v-if="currentDeck"><font-awesome-icon :icon="['fas', 'lock']" class="me-2" v-if="!currentDeck.public"/>{{ currentDeck.name }}</h3>
                  <div class="fs-7">{{$t('ui.lib.cartes')}}: {{ g_getTotalCardsInDeck({deck: currentDeck}) }}</div>
                </div>
                <div class="d-flex align-items-center">
                  <div class="me-2" v-if="!showVersionsEvol">
                      <div class="input-group flex-nowrap" v-if="user && currentSelectedDeck > 0 && !currentDeck.tournoiId">
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
                              <font-awesome-icon :icon="['far', 'square-plus']" class="me-2" />{{$t('ui.action.createversion')}}
                            </BDropdownItem>
                            <BDropdownItem @click="e_onShowEvolVersion()" v-if="versions.length > 1">
                              <font-awesome-icon :icon="['fas', 'shuffle']" class="me-2" />{{$t('ui.action.showversionevol')}}
                            </BDropdownItem>
                            <BDropdownDivider v-if="versions.length > 1 && currentVersion > 1" />
                            <BDropdownItem @click="e_onDeleteVersion()" variant="danger" v-if="versions.length > 1 && currentVersion > 1">
                              <font-awesome-icon :icon="['far', 'fa-trash-can']" class="me-2" />{{$t('ui.action.deleteversion')}}
                            </BDropdownItem>
                          </BDropdown>
                        </span>
                      </div>
                    </div>
                    <BButton @click="saveDeck()" variant="primary"  class="me-2 text-nowrap" v-if="user && !showVersionsEvol && currentDeck.hero">
                      <font-awesome-icon :icon="['far', 'floppy-disk']" class="me-2" />{{$t('ui.action.enregistrer')}}
                    </BButton>
                      <Multiselect class="me-2 aw-selecttournoi" v-if="tournois && !currentDeck.userId && g_isAdmin(user)"
                          v-model="currentDeck.tournoiId" 
                          :close-on-select="true" 
                          :options="tournois"
                          :canClear="true"
                          :canDeselect="true"
                          />
                    <BFormInput v-model="currentDeck.tournoiPos" placeholder="Position" class="me-2 aw-ftournoipos" type="number" min="1" v-if="currentDeck.tournoiId && g_isAdmin(user)" />
                          
                                        
                    <BDropdown v-model="showDecklistoptions" start  variant="outline-secondary" v-if="!showVersionsEvol">
                      <template #button-content>
                        <font-awesome-icon :icon="['fas', 'gear']" />
                      </template>
                      <div v-if="user">
                        <BDropdownItem @click="affModalImportUnique()" variant="unique">
                          <font-awesome-icon :icon="['fas', 'file-arrow-down']" class="me-2" />{{$t('ui.action.importunique')}}
                        </BDropdownItem>
                        <BDropdownDivider />
                      </div>
                      <BDropdownItem @click="e_testerDeck()" v-if="user && currentSelectedDeck > 0" >
                        <font-awesome-icon :icon="['fas', 'vial']"  class="me-2" />{{$t('ui.action.testdeck')}}
                      </BDropdownItem>
                      <BDropdownItem @click="redirectToDecklist()" v-if="user && currentSelectedDeck > 0" >
                        <font-awesome-icon :icon="['far', 'eye']" class="me-2" />{{$t('ui.action.affdl')}}
                      </BDropdownItem>
                      <BDropdownItem @click="changeModeListe()">
                        <span v-if="uiparams.modeliste">
                          <font-awesome-icon :icon="['far', 'image']" class="me-2" />{{$t('ui.action.affvisualmode')}}
                        </span>
                        <span v-else>
                          <font-awesome-icon :icon="['fas', 'list']" class="me-2" />{{$t('ui.action.afflistmode')}}
                        </span>
                      </BDropdownItem>
                      <BDropdownItem @click="changeModeStats()">
                          <font-awesome-icon :icon="['fas', 'chart-column']" class="me-2" />
                          <span v-if="!uiparams.afficherstats">{{$t('ui.action.affstat')}}</span>
                          <span v-else>{{$t('ui.action.cacherstat')}}</span>
                      </BDropdownItem>
                    </BDropdown>
                    <BButton @click="e_hideVersionsEvol" variant="secondary" class="me-2" :title="$t('ui.lib.backtodl')" v-if="showVersionsEvol">
                      <font-awesome-icon :icon="['far', 'square-caret-left']" class="me-2"/>{{$t('ui.lib.back')}}
                    </BButton>
                    <BButton @click="e_updateFromIdAltered" variant="info" class="me-2" :title="$t('ui.action.updatealtid')" v-if="currentDeck.idaltered">
                      <font-awesome-icon :icon="['fas', 'rotate-right']" />
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
                        {{$t('ui.lib.nodiff')}}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="ribbon-wrapper ribbon-lg">
                  <div :class="['ribbon text-white', currentDeck.valide ? 'bg-success' : 'bg-danger']">
                  {{ currentDeck.valide ? $t('ui.lib.legal') : $t('ui.lib.illegal')}}
                  </div>
                </div>
                <div>
                  <div class="row">
                    <div class="col-12 color-white">
                      <div class="aw-herodeck d-flex flex-column justify-content-start">
                        <div class="d-flex mb-2 ps-1 pe-1">
                          <div class="d-flex flex-column align-items-center">
                            {{ g_getTotalCommunesInDeck({deck: currentDeck}) }}
                            <Common :width="40" />
                          </div>
                          <div class="d-flex flex-column align-items-center">
                            {{ g_getTotalRaresInDeck({deck: currentDeck}) }}
                            <Rare :width="40" />
                          </div>
                          <div class="d-flex flex-column align-items-center">
                            {{ g_getTotalUniquesInDeck({deck: currentDeck}) }}
                            <Unique :width="40" />
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
                            <div class="col-12 mt-4 mb-2" v-if="!currentDeck.description"><i class="fs-7"><font-awesome-icon :icon="['fas', 'ban']" class="me-2"/>{{ $t('ui.title.decknodesc') }}</i></div>
                            <div class="col-12 mt-4" v-else v-html="getFormattedDescriptionCurrentDeck()"></div>
                          </BCollapse>
                          <BCollapse id="awid-probadeck">
                            <div class="col-12 mt-4 mb-3">
                              <DeckProba :deck="currentDeck"/>
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
                    <div class="col-12 fs-4 d-flex justify-content-center aw-titletypedecklist color-white">{{ $t('ui.lib.personnages')}}</div>
                    <CardDecklist v-for="card in getPersosCurrentDeck()" :card="card" @addcard="addCard"
                      @removecard="removeCard" @mouseentercard="mouseenterCard" @mouseleavecard="mouseleaveCard"
                      @onshowcarddetail="onshowcarddetail" :modeliste="uiparams.modeliste"
                      :currentDeck="currentDeck" />
                  </div>
                  <div class="row mt-2 pb-2 aw-decklistsorts">
                    <div class="col-12 fs-4 d-flex justify-content-center aw-titletypedecklist color-white">{{ $t('ui.lib.sorts')}}</div>
                    <CardDecklist v-for="card in getSortsCurrentDeck()" :card="card" @addcard="addCard"
                      @removecard="removeCard" @mouseentercard="mouseenterCard" @mouseleavecard="mouseleaveCard"
                      @onshowcarddetail="onshowcarddetail" :modeliste="uiparams.modeliste"
                      :currentDeck="currentDeck"/>
                  </div>
                  <div class="row mt-2 pb-2 aw-decklistpermas">
                    <div class="col-12 fs-4 d-flex justify-content-center aw-titletypedecklist color-white">{{ $t('ui.lib.permanents')}}</div>
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

  <BModal v-model="modalDeleteDeck" @ok="e_confirmDeleteDeck" centered :cancel-title="$t('ui.action.annuler')" :ok-title="$t('ui.action.supprimer')"
    ok-variant="danger" :title="$t('ui.title.deletedeck')">
    Etes-vous sûr de vouloir supprimer le deck ?
  </BModal>

  <BModal v-model="showModalDeleteVersion" @ok="e_confirmDeleteVersion" centered :cancel-title="$t('ui.action.annuler')" :ok-title="$t('ui.action.supprimer')"
    ok-variant="danger" :title="$t('ui.title.deleteversion')">
    <span v-if="currentDeck">Etes-vous sûr de vouloir supprimer la version {{ currentDeck.version }} du deck {{ currentDeck.name }} ?</span>
  </BModal>

  <BModal v-model="afficherDetails" size="fullscreen" hide-footer id="awid-carddetail" @hidden="onHideModalDetail" class="aw-modalecarddet">
    <CardDetail 
      :card="currentCardDetail" 
      :currentDeck="currentDeck" 
      :deckbuilder="deckbuilder"
      v-if="currentCardDetail"
      @addcard="addCard" @removecard="removeCard" />
  </BModal>
  <BModal v-model="showModalImportUnique" size="md" hide-footer @cancel="closeModalImportUnique" @ok="importerUnique" :title="$t('ui.action.importunique')" cancel-title="Annnuler" ok-title="Importer" ok-variant="unique">
    <BInputGroup>
      <BFormInput v-model="codeImportUnique" placeholder="Code" />
      
      <BButton variant="primary" @click="importerUnique"><font-awesome-icon :icon="['fas', 'magnifying-glass']" /></BButton>
    </BInputGroup>

    <div  v-if="importedUnique" class="d-flex flex-column justify-content-center mt-2">
      <div class="text-center fs-5 p-2">{{$t('ui.title.uniquefound')}}</div>
      <img :src="g_getImageCardPublicUrl(importedUnique)" class="img-fluid"/>
      <BButton variant="primary" @click="addUniqueToDeck" class="mt-2"  v-if="!g_isOOF(importedUnique, currentDeck)">
          <font-awesome-icon :icon="['fas', 'circle-plus']" class="me-2"/>{{ $t('ui.action.addcardtodeck')}}
      </BButton>
    </div>
  </BModal>

  <BModal v-if="currentDeck" v-model="showModalConfirmChangeDeck" @ok="confirmChangeDeck" @cancel="dontChangeDeck" centered :cancel-title="$t('ui.action.annuler')" ok-title="Continuer"
    ok-variant="primary" title="Modifications en cours">
    <div v-if="currentDeck.id == 0">Attention ! Le deck actuel est un deck temporaire, et va être supprimé. </div>
    <div v-else>Attention ! Le deck contient des modifications qui n'ont pas été enregistrées.</div>
    <br />
    Si vous continuez, les changements seront perdus. 
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
  deckbuilder: { type: Boolean, required: false, default: false },
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
import { useGlobalStore } from '@/stores/global'

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
      isSelectedToken: false,
      isSelectedCommon: false,
      isSelectedRare: false,
      isSelectedUnique: false,
      currentName: '',
      currentSort: ["mainCost", "recallCost", "name"],
      fetchedCards: [],
      itemsPerPage: 12,
      loading: false,
      currentPage: 1,
      hasMore: true,
      handCost: 0,
      handCostOrMore: "ouplus",
      reserveCost: 0,
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
      newDeckExturl: null,
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
      showImageFullsize: false,
      tournois: null,
      cbdeckstournois: false,
      cbtournoi: null,
      fPosTournoi: 0,
      cbsetuniquefav: true,
      cptupdatecard: 0,
      showDDOptionsCardSearch: false,
      affmissingcollection: true,
      affmissingtrade: false,
      affmissingwant: false,
    };
  },
  mounted() 
  { 
    const globalStore = useGlobalStore();
    this.router = useRouter();

    this.tournois = []
    this.g_fetchTournois({}, ptournois =>
    {
      this.tournois = ptournois.map(tournoi => {
        return { 
          value: tournoi.id, 
          label: tournoi.libelle 
      }});
    })

    const storeduiparams = localStorage.getItem('uiparams');
    if(storeduiparams) this.uiparams = JSON.parse(storeduiparams);
    
    this.database = globalStore.database
    var filters = JSON.parse(localStorage.getItem('filters.db' + this.deckbuilder));
    if (!filters) 
    {
      filters = this.getInitialFilters()
      localStorage.setItem('filters.db' + this.deckbuilder, JSON.stringify(filters));
    }

    this.currentName = filters.currentName
    this.isSelectedCharacter = filters.isSelectedCharacter
    this.isSelectedPermanent = filters.isSelectedPermanent
    this.isSelectedSpell = filters.isSelectedSpell
    this.isSelectedHero = filters.isSelectedHero
    this.isSelectedToken = filters.isSelectedToken
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

    if(!this.deckbuilder) this.currentFaction = filters.currentFaction
    else this.loadDecks();

    setTimeout(() => this.starting = false, 300)
    //this.loadMore(); // Charger les premiers éléments
    //window.addEventListener('scroll', this.handleScroll); // Ajouter l'écouteur d'événements pour le scroll
  },
  watch:{
    currentFaction(newValue, oldValue){
      this.onChangeFilter()
    },
    proprietingdeck(newValue, oldValue) {
        if(newValue)
        {
          this.newDeckName = this.currentDeck.name
          this.taDescDeck = this.currentDeck.description
          this.newDeckExturl = this.currentDeck.exturl
          this.fIdAlteredDeck = this.currentDeck.idaltered

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
    },
    cbdeckstournois(newValue, oldValue){
      this.onClearCurrentDeck()
      this.loadDecks();
    }
  },
  inject: ['callShowWaitingScreen', 'callHideWaitingScreen'], // Injecter la méthode de App.vue
  methods: {
    e_showMissingCollection()
    {
      this.affmissingcollection = true
      this.affmissingtrade = false
      this.affmissingwant = false
    },
    e_showMissingTrade()
    {
      this.affmissingcollection = false
      this.affmissingtrade = true
      this.affmissingwant = false
    },
    e_showMissingWant()
    {
      this.affmissingcollection = false
      this.affmissingtrade = false
      this.affmissingwant = true
    },
    canSelectFaction()
    {
      return !this.deckbuilder || !this.currentDeck || !this.currentDeck.hero_id
    },
    getInitialFilters()
    {
      return {
        isSelectedCharacter: false,
        isSelectedPermanent: false,
        isSelectedSpell: false,
        isSelectedHero: false,
        isSelectedToken: false,
        isSelectedCommon: false,
        isSelectedRare: false,
        isSelectedUnique: false,
        currentFaction: '',
        currentName: '',
        currentSort: ["translations.name"],
        currentEditions: ["COREKS"],
        currentSoustypes: [],
        currentKeywords: [],
        handCost: 0,
        handCostOrMore: "ouplus",
        reserveCost: 0,
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
    extractIdAltered(purlorid)
    {
      var tab = purlorid.split('/')
      return tab[tab.length - 1]
    },
    e_searchAlteredDeck()
    {
      if(this.fIdAlteredDeck)
      {
        this.fIdAlteredDeck = this.extractIdAltered(this.fIdAlteredDeck)
        this.searchAlteredDeck(this.fIdAlteredDeck, pdeck => 
        {
          this.newDeckName = pdeck.name

          var cards = []
          if(pdeck.cardIndexes) for (let key in pdeck.cardIndexes) 
          {
            cards.push(pdeck.cardIndexes[key] + ' ' + key.split('/').pop());
          }

          this.newDecklist = ''
          if(pdeck.alterator) //corresponda au héro
          {
            this.newDecklist = '1 ' + pdeck.alterator.reference + '\n'
          }
          this.newDecklist += cards.join('\n')
        })
      }
    },
    searchAlteredDeck(pidaltered, pcallback)
    {
        this.gaa_fetchDeck(pidaltered, pdeck => 
        {
          if(!pdeck)
          {
            toast("Une erreur s'est produite lors de la récupération du deck", { type: TYPE.ERROR })    
            return
          }

          toast("Le deck a été trouvé", { type: TYPE.SUCCESS })    
          pcallback(pdeck)
        })
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
    e_testerDeck()
    {
        const route = this.$router.resolve('/decktest/' + this.currentDeck.id);

        // Open the route in a new tab
        window.open(route.href, '_blank');
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
      this.cptupdatecard = 0

      this.g_updateCardsFromApi(this.fetchedCards,
        //onUpdatingCard: 
        pcard => {
          this.cptupdatecard++
          this.updatingname = pcard.reference
        },
        //onUpdatedCard: 
        null,
        //onUpdatedCards: 
        () => {
          this.updatingname = null
          this.cptupdatecard = 0
        }
      )
    },
    onClickDownloadImages()
    {
      this.cptupdatecard = 0

      this.g_downloadImages(this.fetchedCards, null,
        //onDownloadingImage
        pcard => {
          this.cptupdatecard++
          this.updatingname = pcard.reference
        },
        //onDownloadedImages
        () => {
          this.cptupdatecard = 0
          this.updatingname = null
        },
        //onUpdatedImageS3
        pcard => console.log(pcard.imageS3)
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
          this.g_updateCardFromApi(this.codeImportUnique, true,
            //onUpdatedCard: 
            (ppcard, palreadyexists, pforcedlocale) => 
            {
              if(!ppcard)
              {
                if(!pforcedlocale) this.callHideWaitingScreen()
                toast("Une erreur s'est produite lors de l'import de la carte", { type: TYPE.ERROR })
                return
              }

              if(this.g_isUnique(ppcard))
              {
                this.g_downloadImages([ppcard], pforcedlocale,
                  //onDownloadingImage
                  pppcard => console.log("Téléchargement de l'image " + pppcard.imagePath),
                  //onDownloadedImages
                  pcards => 
                  {
                    if(!pforcedlocale) {
                      this.callHideWaitingScreen()
                      this.importedUnique = pcards[0]
                    }
                  },
                  //onUpdatedImageS3
                  (pppcard, palreadyexists, pref, ppforcedlocale) => 
                  {
                    if(!pppcard && !ppforcedlocale) toast("La carte a été importée mais l'upload de l'image a échoué", { type: TYPE.ERROR })
                    else console.log("maj base Card.imageS3 : " + pppcard.imageS3)
                  }
                )
              }
              else if(!pforcedlocale) 
              {
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
      var filters = JSON.parse(localStorage.getItem('filters.db' + this.deckbuilder))
      filters.water = this.water
      filters.mountain = this.mountain
      filters.forest = this.forest
      filters.handCost = this.handCost
      filters.reserveCost = this.reserveCost
      filters.isSelectedCharacter = this.isSelectedCharacter
      filters.isSelectedSpell = this.isSelectedSpell
      filters.isSelectedPermanent = this.isSelectedPermanent
      filters.isSelectedHero = this.isSelectedHero
      filters.isSelectedToken = this.isSelectedToken
      filters.handCostOrMore = this.handCostOrMore
      filters.reserveCostOrMore = this.reserveCostOrMore
      filters.forestOrMore = this.forestOrMore
      filters.mountainOrMore = this.mountainOrMore
      filters.waterOrMore = this.waterOrMore
      filters.currentSort = this.currentSort
      filters.currentFaction = this.currentFaction
      filters.currentKeywords = this.currentKeywords
      filters.currentEditions = this.currentEditions
      filters.currentSoustypes = this.currentSoustypes
      filters.isSelectedCommon = this.isSelectedCommon
      filters.isSelectedRare = this.isSelectedRare
      filters.isSelectedUnique = this.isSelectedUnique
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
      
      localStorage.setItem('filters.db' + this.deckbuilder, JSON.stringify(filters))
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
      this.isSelectedToken = filters.isSelectedToken
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
      var uiparams = JSON.parse(localStorage.getItem('uiparams'));
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

      localStorage.setItem('uiparams', JSON.stringify(uiparams));
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
    onFetchedDecks(pdecks, pidDft, pvrsdft)
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

        var storedDeck = pdecks.find(deck => deck.id == pidDft);

        if(storedDeck)
        {
          const params = {
            id: storedDeck.id, 
            withcards:true, 
            withfavs: false,
            withversions: true,
          }

          if(pvrsdft) {
            params.version = pvrsdft
            params.lastversion = false
          }

          this.g_fetchDeck(params, deck => 
          {
            this.currentSelectedDeck = deck.refid > 0 ? deck.refid : deck.id
            this.currentDeck = deck
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
          const storedDeckrefid = storedDeck.refid > 0 ? storedDeck.refid : storedDeck.id
          
          if (!pdecks.some(zedeck => zedeck.id == storedDeckrefid)) 
          {
            this.decks.unshift({ value: storedDeckrefid, label: storedDeck.name })
          }
          this.currentSelectedDeck = storedDeckrefid
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
    loadDecks(pidDft, ondeconnect, pvrsdft) 
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
        tournois: this.cbdeckstournois,
        callback : pdecks => this.onFetchedDecks(pdecks, pidDft, pvrsdft)
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
    mouseenterCard(card) 
    {
      if(this.mousetimeout) clearTimeout(this.mousetimeout)
      this.imagePathFullsize = this.g_getImageCardPublicUrl(card)
      this.showImageFullsize = true
    },
    mouseleaveCard(card)
    {
      this.mousetimeout = setTimeout(() => 
      {
        if(this.mousetimeout) this.showImageFullsize = false
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
            //reset la recherche
            this.fetchedCards = []
          }

          if (pcard.quantite == 0) 
          {
            this.currentDeck.cards.splice(indice, 1);
          }

          if(this.currentDeck.cards.length == 0 || (this.currentDeck.cards.length == 1 && this.currentDeck.hero_id)) this.imagePathFullsize = null
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
    e_updateFromIdAltered()
    {
      if(!this.currentDeck.idaltered) return

      this.searchAlteredDeck(this.currentDeck.idaltered, pdeck => 
      {
        if(!pdeck) return
          
        const newcards = []
        if(pdeck.alterator) //corresponda au héro
        {
          newcards.push({
            deckId: this.currentDeck.id,
            cardRef: pdeck.alterator.reference,
            quantity: 1,
          })
        }
        if(pdeck.cardIndexes) for (let key in pdeck.cardIndexes) 
        {
          const qte = pdeck.cardIndexes[key]
          const ref = key.split('/').pop()
          newcards.push({
            deckId: this.currentDeck.id,
            cardRef: ref,
            quantity: qte,
          })
        }

        this.g_updateDeckFromAltered(this.currentDeck, newcards, ppdeck => {
          if(ppdeck) this.loadDecks(ppdeck.refid > 0 ? ppdeck.refid : ppdeck.id, false, this.currentVersion) 
        })
      })
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
        pdecks.sort((deckA, deckB) => deckB.version - deckA.version)

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
              this.searchCards(true, true); //faction différente -> on reset le résultat de la recherche
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
      this.fIdAlteredDeck = this.extractIdAltered(this.fIdAlteredDeck)

      this.currentDeck.name = this.newDeckName
      this.currentDeck.description = this.taDescDeck
      this.currentDeck.exturl = this.newDeckExturl
      this.currentDeck.idaltered = this.fIdAlteredDeck

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
          var params = {
            name: this.newDeckName,
            cards: decklist,
            tournoi: this.cbtournoi,
            postournoi: this.fPosTournoi,
            setuniquefav: this.cbsetuniquefav,
            idaltered: this.fIdAlteredDeck,
          }
          this.g_importDeck(params,
            //onImportedDeck: 
            (pdeck, pfaileduniques) => 
            {
              this.callHideWaitingScreen()
              if(!pdeck) toast('Une erreur s\'est produite', { type: TYPE.ERROR });
              else {
                if(pfaileduniques && pfaileduniques.length > 0)
                {
                  toast('Une ou plusieurs uniques n\'ont pas pu être importées : ' + pfaileduniques.join(', '), { type: TYPE.WARNING });
                }
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

      this.initEmptyNewDeck(this.newDeckName, this.cbtournoi, this.fPosTournoi);
    },
    initEmptyNewDeck(pname, ptournoi, ppostournoi)
    {
      this.currentDeck = {
        id: 0,
        name: pname,
        description: '',
        public: true,
        main_faction: '',
        hero_id: null,
        cards: [],
      };

      if(ptournoi)
      {
        this.currentDeck.tournoiId = ptournoi
        this.currentDeck.tournoiPos = ppostournoi
      }

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
      //si le deck actuel est temporaire, on le supprime de la liste déroulante
      if(this.currentDeck.id == 0)
      {
        this.decks = this.decks.filter(option => option.value != 0)
      }

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
      else if ($(event.target).attr("id") == "ocean") rangePercent = this.water;
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
      this.isSelectedCharacter = !this.isSelectedCharacter;
      this.setTimeoutRechType()
      this.onChangeFilter();
    },
    selectSpell() 
    {
      if(this.isSelectedUnique) return
      this.isSelectedSpell = !this.isSelectedSpell;
      this.setTimeoutRechType()      
      this.onChangeFilter();
    },
    selectPermanent() 
    {
      if(this.isSelectedUnique) return
      this.isSelectedPermanent = !this.isSelectedPermanent;
      this.setTimeoutRechType()      
      this.onChangeFilter();
    },
    selectHero() 
    {
      if(this.isSelectedUnique) return
      this.setTimeoutRechType()
      this.isSelectedHero = !this.isSelectedHero;
      this.onChangeFilter();
    },
    selectToken()
    {
      if(this.isSelectedUnique) return
      this.setTimeoutRechType()
      this.isSelectedToken = !this.isSelectedToken;
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
    searchCardsBtnRechercher()
    {
      if(!this.currentFaction)
      {
        toast('Veuillez sélectionner une faction pour pouvoir lancer la recherche', { type: TYPE.ERROR }) 
        return
      }
      this.searchCards(false, false)
    },
    searchCards(pdontfetch, pshowstat) {
      this.fetchedCards = [];
      this.hasMore = true;
      this.currentPage = 1;
      this.itemsPerPage = this.deckbuilder ? 12 : 24
      this.uiparams.afficherstats = pshowstat;

      if(this.deckbuilder)
      {
        this.storeUiparams();
      }
      if (!pdontfetch) {
        this.fetchCards();
      }
    },
    changeFaction(event) 
    {
      if(!this.canSelectFaction()) return

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
      this.isSelectedCommon = !this.isSelectedCommon
      if(this.deckbuilder)
      {
        this.isSelectedUnique = false
      }
      this.setTimeoutRechRarete()
      this.onChangeFilter()
    },
    selectRare() 
    {
      this.isSelectedRare = !this.isSelectedRare
      if(this.deckbuilder)
      {
        this.isSelectedUnique = false
      }
      this.setTimeoutRechRarete()
      this.onChangeFilter()
    },
    selectUnique() 
    {
      this.isSelectedUnique = !this.isSelectedUnique
      if(this.deckbuilder && this.isSelectedUnique)
      {
        this.isSelectedCharacter = true;
        this.isSelectedSpell = false;
        this.isSelectedPermanent = false;
        this.isSelectedHero = false;
        this.isSelectedToken = false;

        this.isSelectedRare = false
        this.isSelectedCommon = false
      }
      this.setTimeoutRechRarete()
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
        if (costValue == 0) return []; //0 ou plus : ne pas envoyer le param
        for (let cost = Number(costValue); cost <= 20; cost++) {
          couts.push(cost);
        }
      }
      else {
        if (costValue == 10) return []; //10 ou moins : ne pas envoyer le param
        for (let cost = Number(costValue); cost >= 0; cost--) {
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
      if (this.isSelectedToken) types.push("TOKEN");
      return types;
    },
    calcRarities() {
      var rarities = [];
      if (this.isSelectedCommon) rarities.push("COMMON");
      if (this.isSelectedRare) rarities.push("RARE");
      if (this.isSelectedUnique) rarities.push("UNIQUE");
      return rarities;
    },
    fetchCards() 
    {
      if (this.currentPage > 1 && !this.hasMore) return;
      
      this.loading = true;
      if (!this.currentSort || this.currentSort.length == 0) this.currentSort = [database ? 'name' : 'translations.name'];

      var calcparams = {
        deckbuilder: this.deckbuilder,
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
        if(pcards)
        {
          this.currentPage++;
          this.hasMore = pcards.length > this.itemsPerPage;
          if(this.hasMore) pcards.pop(); //on vire le dernier élément qui ne sert qu'à savoir si il y a d'autres cartes à fetch
          
          pcards.forEach(card => 
          {
              var zecard = this.deckbuilder ? this.g_getCardInDeck(card.reference, this.currentDeck) : card;
              if (zecard) this.fetchedCards.push(zecard);
              else 
              {
                  card.quantite = 0;
                  this.fetchedCards.push(card);
              }
          });

          //récup des quantités
          if(this.g_isBearer())
          {
            this.g_getCollection(pcards, (ppcards, perror) => {

              if(perror)
              {
                toast(perror.response.data.message, { type: TYPE.ERROR })    
              }
              this.fetchedCards.forEach(pcard => {
                const cardstat = ppcards.find(pcardstat => pcardstat.reference == pcard.reference)
                if(cardstat)
                {
                  $.extend(pcard, cardstat)
                }
              })

              this.fetchedCards.forEach(pcard => 
              {
                pcard.inMyCollectionTotal = 0
                pcard.inMyTradelistTotal = 0
                const ext = pcard.reference.split('_')[1]
                const otherext = this.getAllSetsOtherCodes(ext)

                if(otherext)
                {
                  const otherref = pcard.reference.replace(ext, otherext)
                  const cardstat = this.fetchedCards.find(pcardstat => pcardstat.reference == otherref)
                  if(cardstat)
                  {
                    pcard.inMyCollectionTotal = pcard.inMyCollection + cardstat.inMyCollection
                    pcard.inMyTradelistTotal = pcard.inMyTradelist + cardstat.inMyTradelist
                  }
                }
              })
            })
          }
        }
        else toast("Une erreur s'est produite lors de la recherche de cartes", { type: TYPE.ERROR })    

        this.loading = false;
      })
    },
    getAllSetsOtherCodes(psetcode)
    {
      if(psetcode == 'CORE') return 'COREKS'
      if(psetcode == 'COREKS') return 'CORE'
      return null
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
            ppcard => {
              console.log("Carte mise à jour : " + ppcard.reference)
            }
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
.aw-ftournoipos
{
  width: 75px !important;
}
.multiselect.aw-selectversion .multiselect-wrapper,
.multiselect.aw-selecttournoi .multiselect-wrapper
{
  min-height: auto;
}
</style>

<style scoped>
.multiselect.aw-selectversion
{
  width: 160px;
}
.multiselect.aw-selecttournoi
{
  width: 260px;
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
  background-image: url(/src/assets/img/bg.webp);
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
    box-shadow: -330px 0 0 320px var(--c-ocean), inset 0 0 0 25px var(--c-ocean);
  }
}

.aw-stats .altered-forest {
  color: var(--c-forest);
}

.aw-stats .altered-mountain {
  color: var(--c-mountain);
}

.aw-stats .altered-ocean {
  color: var(--c-ocean);
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
  color: var(--c-ocean);
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

.aw-type a.aw-token:hover,
.aw-type a.aw-token:hover span,
.aw-type a.aw-token.aw-selected {
  color: var(--c-rare);
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