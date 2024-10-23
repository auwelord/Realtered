<template>
<div class="card card-outline card-warning">
  <div class="card-header">
    <div class="d-flex justify-content-end">
      <div v-if="!gstunique && g_isAdmin(user) && globalStore.cardfilter.faction" class="mt-2 me-2">
        <BFormCheckbox v-model="globalStore.database">BDD</BFormCheckbox>
      </div>
      <BButton @click="globalStore.clearCardFilter(gstunique)" variant="light" size="sm" class="me-2" title="Supprimer tous les filtres (hors factions/éditions/tris)">
        <font-awesome-icon :icon="['fas', 'eraser']" />
      </BButton>
      <BDropdown v-model="showDDOptionsCardSearch" size="sm" v-if="!gstunique && !deckbuilder" variant="secondary" class="me-2">
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
      <BButton @click="e_searchCards" variant="unique" size="sm">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="me-2" />{{$t('ui.action.rechercher')}}
      </BButton>
      <BButton @click="e_showAddUnique" variant="success" size="sm" class="ms-2" title="Ajouter une Unique" v-if="gstunique">
        <font-awesome-icon :icon="['fas', 'circle-plus']" />
      </BButton>
      <div class="aw-collapsible ms-3" v-b-toggle.awid-filtrestools  v-if="g_isBearer()">
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
      </div>
    </div>
    <BCollapse id="awid-filtrestools" v-model="globalStore.cardfilter.ui.showtools" v-if="g_isBearer()">
      <BButton @click="e_updateCollection" variant="secondary" size="sm" class="me-2" v-if="user">
        <font-awesome-icon :icon="['fas', 'database']" class="me-2" />Update Collection
      </BButton>
    </BCollapse>
  </div> <!-- /.card-header -->
  <div class="card-header" v-if="!gstunique && g_isAdmin(user)">
    <div v-if="!globalStore.database && globalStore.cardfilter.faction"> <!--&& fetchedCards -->
      <BButton @click="e_updateDetailFromApi" variant="secondary" size="sm" class="me-2" v-if="g_isLocaleFrench()">
        <font-awesome-icon :icon="['fas', 'file-import']" class="me-2" />Details <span v-if="cptupdatecard > 0">{{  cptupdatecard }} / {{fetchedCards.length}}</span>
      </BButton>
    </div>
    <BButton @click="e_downloadImages" variant="secondary" size="sm" class="me-2">
      <font-awesome-icon :icon="['fas', 'file-import']" class="me-2" />Images <span v-if="cptupdatecard > 0">{{  cptupdatecard }} / {{fetchedCards.length}}</span>
    </BButton>
    <BButton @click="e_updateDetailFromApi" variant="secondary" size="sm" class="me-2" title="Mettre à jour les uniques" v-if="g_isAdmin(user) && globalStore.database">
      <font-awesome-icon :icon="['fas', 'pen-clip']" class="me-2" />Update uniques <span v-if="cptupdatecard > 0">{{  cptupdatecard }} / {{fetchedCards.length}}</span>
    </BButton>
  </div>
  <div class="card-body">
    <div class="card-group justify-content-between aw-factionsel mb-4">
      <a href="#" id="AX" :title="getTitleFaction('AX')" :class="['mb-2', getClassFaction('AX')]" @click="e_changeFaction">
            <img src="@/assets/img/altered/factions/axiom.webp" class="aw-faction" />
      </a>
      <a href="#" id="BR" :title="getTitleFaction('BR')" :class="['mb-2', getClassFaction('BR')]" @click="e_changeFaction">
            <img src="@/assets/img/altered/factions/bravos.webp" class="aw-faction" />
      </a>
      <a href="#" id="LY" :title="getTitleFaction('LY')" :class="['mb-2', getClassFaction('LY')]" @click="e_changeFaction">
            <img src="@/assets/img/altered/factions/lyra.webp" class="aw-faction" />
      </a>
      <a href="#" id="MU" :title="getTitleFaction('MU')" :class="['mb-2', getClassFaction('MU')]" @click="e_changeFaction">
            <img src="@/assets/img/altered/factions/muna.webp" class="aw-faction" />
      </a>
      <a href="#" id="OR" :title="getTitleFaction('OR')" :class="['mb-2', getClassFaction('OR')]" @click="e_changeFaction">
            <img src="@/assets/img/altered/factions/ordis.webp" class="aw-faction" />
      </a>
      <a href="#" id="YZ" :title="getTitleFaction('YZ')" :class="['mb-2', getClassFaction('YZ')]" @click="e_changeFaction">
            <img src="@/assets/img/altered/factions/yzmir.webp" class="aw-faction" />
      </a>
    </div>
    
    <BInputGroup class="ms-1 mb-2">
      <BFormCheckbox v-model="globalStore.cardfilter.onlycollec">Uniquement dans ma collection</BFormCheckbox>
    </BInputGroup>
    <BInputGroup class="ms-1 mb-2" v-if="!deckbuilder">
      <BFormCheckbox v-model="globalStore.cardfilter.onlyechangeable">Uniquement mes cartes échangeables</BFormCheckbox>
    </BInputGroup>
    <BInputGroup class="ms-1 mb-2" v-if="!deckbuilder"> <!--&& !globalStore.cardfilter.onlycollec && !globalStore.cardfilter.onlyechangeable--><!--à voir si c mieux niveau ergo de cacher les zones ou non-->
      <BFormCheckbox v-model="globalStore.cardfilter.onlywant">Uniquement mes cartes manquantes</BFormCheckbox>
    </BInputGroup>
    <BInputGroup>
      <BFormInput v-model="globalStore.cardfilter.name" type="text" class="form-control" :placeholder="$t('ui.lib.nomcarte')" @keyup.enter="e_searchCards" />
    </BInputGroup>
    
    <div v-if="!gstunique">
      <hr>
      <div class="d-flex justify-content-between mt-3">
        <div>
          <BButton @click="e_searchCards" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechRarete && globalStore.cardfilter.faction">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </BButton>
          {{$t('ui.lib.rarete')}}
        </div>
        <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtresrarity>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
        </div>
      </div>
      <BCollapse id="awid-filtresrarity" v-model="globalStore.cardfilter.ui.showrarity">
        <div class="d-flex justify-content-evenly aw-raritysel mt-2">
          <a href="javascript:" id="COMMON" :class="getClassRarity('COMMON')" @click="e_selectCommon"><Common :width="40" /></a>
          <a href="javascript:" id="RARE" :class="getClassRarity('RARE')" @click="e_selectRare"><Rare :width="40" /></a>
          <a href="javascript:" id="UNIQUE" v-if="user" :class="getClassRarity('UNIQUE')" @click="e_selectUnique"><Unique :width="40" /></a>
          <img v-else class="aw-cursor-notallowed" src="@/assets/img/altered/rarities/unique.png" title="Connectez-vous pour rechercher vos uniques ajoutées à vos favoris"/>
        </div>

      </BCollapse>

      <hr v-if="!gstunique">
      <div class="d-flex justify-content-between mt-3">
        <div>
          <BButton @click="e_searchCards" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechType && globalStore.cardfilter.faction">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </BButton>
          Type
        </div>
        <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtrestype>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
        </div>
      </div>
      <BCollapse id="awid-filtrestype" v-model="globalStore.cardfilter.ui.showtype">
        <div class="card-group justify-content-between aw-type mt-2">
          <a href="javascript:" id="CHARACTER" :title="getTitleType('CHARACTER')"
              :class="['d-flex flex-column align-items-center mb-3', getClassType('CHARACTER')]"
              @click="e_selectCharacter">
                <font-awesome-icon :icon="['fas', 'person-walking']" class="fs-4" /><span>{{$t('ui.lib.personnage')}}</span>
          </a>
          <a href="javascript:" id="SPELL" :title="getTitleType('SPELL')"
              :class="['d-flex flex-column align-items-center mb-3', getClassType('SPELL')]"
              @click="e_selectSpell">
                <font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" class="fs-4" /><span>{{$t('ui.lib.sort')}}</span>
          </a>
          <a href="javascript:" id="PERMANENT" :title="getTitleType('PERMANENT')"
              :class="['d-flex flex-column align-items-center mb-3', getClassType('PERMANENT')]"
              @click="e_selectPermanent">
                <font-awesome-icon :icon="['fas', 'building-shield']" class="fs-4" /><span>{{$t('ui.lib.permanent')}}</span>
          </a>
          <a href="javascript:" id="HERO" :title="getTitleType('HERO')"
              :class="['d-flex flex-column align-items-center mb-3', getClassType('HERO')]"
              @click="e_selectHero">
                <font-awesome-icon :icon="['fas', 'mask']" class="fs-4" /><span>{{$t('ui.lib.hero')}}</span>
          </a>
          <a href="javascript:" v-if="g_isAdmin(user)" id="TOKEN" :title="getTitleType('TOKEN')"
              :class="['d-flex flex-column align-items-center mb-3', getClassType('TOKEN')]"
              @click="e_selectToken">
                <font-awesome-icon :icon="['fas', 'robot']" class="fs-4" /><span>{{$t('ui.lib.token')}}</span>
          </a>
        </div>
      </BCollapse>
    </div>
    
    <hr>
    <div class="d-flex justify-content-between mt-3">
      <div>
        <BButton @click="e_searchCards" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechMaincost && globalStore.cardfilter.faction">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
        </BButton>
        {{$t('ui.lib.maincost')}}
      </div>
      <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtrescoutmain>
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
      </div>
    </div>
    <BCollapse id="awid-filtrescoutmain" v-model="globalStore.cardfilter.ui.showmaincost">
      <div class="d-flex flex-column ">
        <div class="d-flex justify-content-between align-items-center">
          <div class="fs-3">{{ globalStore.cardfilter.maincost }}</div>
          <div>
            <BFormCheckbox v-model="globalStore.cardfilter.maincostormore" value="ouplus">{{$t('ui.lib.etplus')}}</BFormCheckbox>
          </div>
          <div>
            <BFormCheckbox v-model="globalStore.cardfilter.maincostormore" value="oumoins">{{$t('ui.lib.etmoins')}}</BFormCheckbox>
          </div>
        </div>
        <div class="aw-slider aw-handcost">
          <input type="range" id="awid-fmaincost" v-model="globalStore.cardfilter.maincost" class="w-100 mt-0" min="0" max="10" step="1" value="1" />
        </div>
      </div>
    </BCollapse>

    <hr>
    <div class="d-flex justify-content-between mt-3 mb-2">
      <div>
        <BButton @click="e_searchCards" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechRecallcost && globalStore.cardfilter.faction">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
        </BButton>
        {{$t('ui.lib.recallcost')}}
      </div>
      <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtrescoutreserve>
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
      </div>
    </div>
    <BCollapse id="awid-filtrescoutreserve" v-model="globalStore.cardfilter.ui.showrecallcost">
      <div class="d-flex flex-column ">
        <div class="d-flex justify-content-between align-items-center">
          <div class="fs-3">{{ globalStore.cardfilter.recallcost }}</div>
          <div>
            <BFormCheckbox v-model="globalStore.cardfilter.recallcostormore" value="ouplus">{{$t('ui.lib.etplus')}}</BFormCheckbox>
          </div>
          <div>
            <BFormCheckbox v-model="globalStore.cardfilter.recallcostormore" value="oumoins">{{$t('ui.lib.etmoins')}}</BFormCheckbox>
          </div>
        </div>
        <div class="aw-slider aw-reservecost">
          <input type="range" id="awid-frecallcost" v-model="globalStore.cardfilter.recallcost" class="w-100 mt-0" min="0" max="10" step="1" value="1" />
        </div>
      </div>
    </BCollapse>

    <div v-if="globalStore.cardfilter.character">
      <hr>
      <div class="d-flex justify-content-between mt-3">
        <div>
          <BButton @click="e_searchCards" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechPower && globalStore.cardfilter.faction">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </BButton>
          {{$t('ui.lib.patates')}}
        </div>
        <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtrespower>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
        </div>
      </div>
      <BCollapse id="awid-filtrespower" v-model="globalStore.cardfilter.ui.showpower">
        <div class="d-flex flex-column aw-stats">
          <div class="card-group justify-content-between align-items-center">
            <div><i class="altered-forest fs-5 me-2"></i><span class="fs-3">{{ globalStore.cardfilter.forest }}</span></div>
            <div>
              <BFormCheckbox v-model="globalStore.cardfilter.forestormore" value="ouplus">{{$t('ui.lib.etplus')}}</BFormCheckbox>
            </div>
            <div>
              <BFormCheckbox v-model="globalStore.cardfilter.forestormore" value="oumoins">{{$t('ui.lib.etmoins')}}</BFormCheckbox>
            </div>
          </div>
          <div class="aw-slider">
            <input type="range" id="awid-forest" v-model="globalStore.cardfilter.forest" class="w-100" min="0" max="10" step="1" value="0" />
          </div>
          <div class="card-group justify-content-between align-items-center mt-2">
            <div><i class="altered-mountain fs-5 me-2"></i><span class="fs-3">{{ globalStore.cardfilter.mountain }}</span></div>
            <div>
              <BFormCheckbox v-model="globalStore.cardfilter.mountainormore" value="ouplus">{{$t('ui.lib.etplus')}}</BFormCheckbox>
            </div>
            <div>
              <BFormCheckbox v-model="globalStore.cardfilter.mountainormore" value="oumoins">{{$t('ui.lib.etmoins')}}</BFormCheckbox>
            </div>
          </div>
          <div class="aw-slider">
            <input type="range" id="awid-mountain" v-model="globalStore.cardfilter.mountain" class="w-100" min="0" max="10" step="1" value="0" />
          </div>
          <div class="card-group justify-content-between align-items-center mt-2">
            <div><i class="altered-ocean fs-5 me-2"></i><span class="fs-3">{{ globalStore.cardfilter.ocean }}</span></div>
            <div>
              <BFormCheckbox v-model="globalStore.cardfilter.oceanormore" value="ouplus">{{$t('ui.lib.etplus')}}</BFormCheckbox>
            </div>
            <div>
              <BFormCheckbox v-model="globalStore.cardfilter.oceanormore" value="oumoins">{{$t('ui.lib.etmoins')}}</BFormCheckbox>
            </div>
          </div>
          <div class="aw-slider">
            <input type="range" id="awid-ocean" v-model="globalStore.cardfilter.ocean" class="w-100" min="0" max="10" step="1" value="0" />
          </div>
        </div>
      </BCollapse>
    </div>

    <hr>
    <div class="d-flex justify-content-between mt-3">
      <div class="mb-1">
        <BButton @click="e_searchCards" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechKeyword && globalStore.cardfilter.faction">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
        </BButton>
        {{$t('ui.lib.motscles')}} / {{$t('ui.lib.capacites')}}
      </div>
      <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtreskeyword>
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
      </div>
    </div>
    <BCollapse id="awid-filtreskeyword" v-model="globalStore.cardfilter.ui.showkeyword">
      <Multiselect mode="tags" class="mb-2"
          v-model="globalStore.cardfilter.keywords"
          :close-on-select="true" 
          :create-option="true" 
          :searchable="false"
          :options="keywords" />


      <BInputGroup class="mt-2 ms-5">
        <BFormCheckbox v-model="globalStore.notemptystatic">{{$t('ui.lib.staticabilnotempty')}}</BFormCheckbox>
      </BInputGroup>
      <BInputGroup>
        <template #prepend>
          <BInputGroupText><font-awesome-icon :icon="['fas', 'ban']" /></BInputGroupText>
        </template>
        <BFormInput :placeholder="$t('ui.lib.textedanscapa')"
            :disabled="globalStore.notemptystatic"
            v-model="globalStore.static"
            @keyup.enter="e_searchCards" />
      </BInputGroup>
      <BInputGroup class="mt-2 ms-5">
        <BFormCheckbox v-model="globalStore.notemptyetb">{{$t('ui.lib.capacite')}} <i class="altered-etb"></i> {{$t('ui.lib.nonvide')}}</BFormCheckbox>
      </BInputGroup>
      <BInputGroup>
        <template #prepend>
          <BInputGroupText><i class="altered-etb"></i></BInputGroupText>
        </template>
        <BFormInput :placeholder="$t('ui.lib.textedanscapa')"
            :disabled="globalStore.notemptyetb"
            v-model="globalStore.etb"
            @keyup.enter="e_searchCards" />
      </BInputGroup>
      <BInputGroup class="mt-2 ms-5">
        <BFormCheckbox v-model="globalStore.notemptyhand">{{$t('ui.lib.capacite')}} <i class="altered-hand"></i> {{$t('ui.lib.nonvide')}}</BFormCheckbox>
      </BInputGroup>
      <BInputGroup>
        <template #prepend>
          <BInputGroupText>	<i class="altered-hand"></i></BInputGroupText>
        </template>
        <BFormInput :placeholder="$t('ui.lib.textedanscapa')"
            :disabled="globalStore.notemptyhand"
            v-model="globalStore.hand"
            @keyup.enter="e_searchCards" />
      </BInputGroup>
      <BInputGroup class="mt-2 ms-5">
        <BFormCheckbox v-model="globalStore.notemptyrecall">{{$t('ui.lib.capacite')}} <i class="altered-reserve"></i> {{$t('ui.lib.nonvide')}}</BFormCheckbox>
      </BInputGroup>
      <BInputGroup>
        <template #prepend>
          <BInputGroupText><i class="altered-reserve"></i></BInputGroupText>
        </template>
        <BFormInput :placeholder="$t('ui.lib.textedanscapa')"
            :disabled="globalStore.notemptyrecall"
            v-model="globalStore.recall"
            @keyup.enter="e_searchCards" />
      </BInputGroup>
      <BInputGroup class="mt-2 ms-5">
        <BFormCheckbox v-model="globalStore.notemptyexhaust">{{$t('ui.lib.capacite')}} <i class="altered-exhaust"></i> {{$t('ui.lib.nonvide')}}</BFormCheckbox>
      </BInputGroup>
      <BInputGroup>
        <template #prepend>
          <BInputGroupText><i class="altered-exhaust"></i></BInputGroupText>
        </template>
        <BFormInput :placeholder="$t('ui.lib.textedanscapa')"
            :disabled="globalStore.notemptyexhaust"
            v-model="globalStore.exhaust"
            @keyup.enter="e_searchCards" />
      </BInputGroup>
      <BInputGroup class="mt-2 ms-5">
        <BFormCheckbox v-model="globalStore.notemptysupport">{{$t('ui.lib.capacite')}} <i class="altered-support"></i> {{$t('ui.lib.nonvide')}}</BFormCheckbox>
      </BInputGroup>
      <BInputGroup>
        <template #prepend>
          <BInputGroupText><i class="altered-support"></i></BInputGroupText>
        </template>
        <BFormInput :placeholder="$t('ui.lib.textedanscapa')"
            :disabled="globalStore.notemptysupport"
            v-model="globalStore.support"
            @keyup.enter="e_searchCards" />
      </BInputGroup>                  
    </BCollapse>

    <hr>
    <div class="d-flex justify-content-between mt-3">
      <div class="mb-1">
        <BButton @click="e_searchCards" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechSubtype && globalStore.cardfilter.faction">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
        </BButton>
        {{$t('ui.lib.soustypes')}}
      </div>
      <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtressubtype>
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
      </div>
    </div>
    <BCollapse id="awid-filtressubtype" v-model="globalStore.cardfilter.ui.showsubtype">
    <Multiselect mode="tags" class="mb-2"
        v-model="globalStore.cardfilter.subtypes"
        :close-on-select="true" 
        :create-option="true" 
        :searchable="true"
        :options="soustypes" />
    </BCollapse>

    <hr>
    <div class="d-flex justify-content-between mt-3">
      <div class="mb-1">
        <BButton @click="e_searchCards" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechEdition && globalStore.cardfilter.faction">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
        </BButton>
        Editions
      </div>
      <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtresedition>
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
      </div>
    </div>
    <BCollapse id="awid-filtresedition" v-model="globalStore.cardfilter.ui.showedition"> 
    <Multiselect mode="tags" class="mb-2"
        v-model="globalStore.cardfilter.editions"
        :close-on-select="true" 
        :create-option="true" 
        :options="editions" />
    </BCollapse>

    <hr>
    <div class="d-flex justify-content-between mt-3">
      <div class="mb-1">
        <BButton @click="e_searchCards" variant="unique" size="xs" title="Rechercher" class="pulse animated infinite" v-if="showRechSort && globalStore.cardfilter.faction">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
        </BButton>
        {{$t('ui.lib.trierpar')}}
      </div>
      <div class="aw-collapsible flex-fill d-flex justify-content-end" v-b-toggle.awid-filtrestri>
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="aw-arrowcollapse" />
      </div>
    </div>
    <BCollapse id="awid-filtrestri" v-model="globalStore.cardfilter.ui.showsort">
      <Multiselect class="mb-2" mode="tags" 
          v-model="globalStore.cardfilter.sorts" 
          :close-on-select="true" 
          :create-option="true"
          :options="sortingTypes"/>
    </BCollapse>
  </div>
</div>

<BModal v-model="showModalImportUnique" size="md" hide-footer @cancel="showModalImportUnique = false" :title="$t('ui.action.importunique')" cancel-title="Annnuler" ok-title="Importer" ok-variant="unique">
    <BInputGroup>
      <BFormInput v-model="fCodeImportUnique" placeholder="Code" id="awid-fCodeImportUnique" />
      
      <BButton variant="primary" @click="e_importerUnique"><font-awesome-icon :icon="['fas', 'magnifying-glass']" /></BButton>
    </BInputGroup>

    <div v-if="importedUnique" class="d-flex flex-column justify-content-center mt-2">
      <div class="text-center fs-5 p-2">{{$t('ui.title.uniquefound')}}</div>
      <img :src="g_getImageCardPublicUrl(importedUnique)" class="img-fluid"/>
    </div>
  </BModal>
</template>

<script setup>
const emit = defineEmits(['searchcards', 'updatemissing']);
</script>

<script>
import { useGlobalStore } from '@/stores/global'
import { useToast, TYPE } from 'vue-toastification'

const toast = useToast();

export default {
  props: {
    user: {
      type: Object,
      //required: true
    },
    deckbuilder: {
      type: Boolean,
      default: false
    },
    canselectfaction: {
      type: Boolean,
      default: true
    },
    fetchedCards: null,
    affmissingcollection: true,
    affmissingtrade: false,
    affmissingwant: false,
    gstunique: false,
  },
  data() {
    return {
      starting: true,
      globalStore: useGlobalStore(),
      cptupdatecard: 0,
      updatingname: null,
      showDDOptionsCardSearch: false,
      showModalImportUnique: false,
      fCodeImportUnique: null,
      importedUnique:null,
      //bouton... loupe par type de recherche (pour eviter le scroll jusqu'au bouton Rechercher)
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
      //...bouton
      //listes deroulantes...
      sortingTypes: [
        { value: 'name', label: 'Nom Asc.' },
        { value: 'mainCost', label: 'Mana Asc.' },
        { value: 'recallCost', label: 'Réserve Asc.' },
        { value: 'name,0', label: 'Nom Desc.' },
        { value: 'mainCost,0', label: 'Mana Desc.' },
        { value: 'recallCost,0', label: 'Réserve Desc.' },
      ],
      editions :[
        { value: 'COREKS', label: 'Au-delà des portes - KS' },
        { value: 'CORE', label: 'Au-delà des portes' },
      ],
      soustypes : this.g_getSubtypesOptions(),
      keywords :this.g_getKeywordsOptions(),
      //...listes deroulantes
    }
  },
  mounted() 
  {
      $('#awid-fmaincost').css('filter', 'hue-rotate(-' + (this.globalStore.cardfilter.maincost  * 10) + 'deg)')
      $('#awid-frecallcost').css('filter', 'hue-rotate(-' + (this.globalStore.cardfilter.recallcost * 10) + 'deg)')
      this.changeColorSlider('forest', this.globalStore.cardfilter.forest)

      if(this.gstunique)
      {
        this.globalStore.cardfilter.unique = true
        this.globalStore.controlerFiltreUnique(true) //true pour forcer rare et common à false
      }
      if(this.deckbuilder)
      {
        this.globalStore.cardfilter.onlyechangeable = false
        this.globalStore.cardfilter.onlywant = false
      }
      setTimeout(() => this.starting = false, 300)
  },
  watch:{
    'globalStore.notemptystatic'(newval, oldval){
        if(newval) this.globalStore.static = null
        if(!this.starting) this.setTimeoutRechKeyword()
    },
    'globalStore.notemptyetb'(newval, oldval){
        if(newval) this.globalStore.etb = null
        if(!this.starting) this.setTimeoutRechKeyword()
    },
    'globalStore.notemptyhand'(newval, oldval){
        if(newval) this.globalStore.hand = null
        if(!this.starting) this.setTimeoutRechKeyword()
    },
    'globalStore.notemptyrecall'(newval, oldval){
        if(newval) this.globalStore.recall = null
        if(!this.starting) this.setTimeoutRechKeyword()
    },
    'globalStore.notemptyexhaust'(newval, oldval){
        if(newval) this.globalStore.exhaust = null
        if(!this.starting) this.setTimeoutRechKeyword()
    },
    'globalStore.notemptysupport'(newval, oldval){
        if(newval) this.globalStore.support = null
        if(!this.starting) this.setTimeoutRechKeyword()
    },
    'globalStore.cardfilter.forest'(newval, oldval){
        this.changeColorSlider('forest', newval)
        if(!this.starting) this.setTimeoutRechPower()
    },
    'globalStore.cardfilter.forestormore'(newval, oldval){
        if(!this.starting) this.setTimeoutRechPower()
    },
    'globalStore.cardfilter.mountain'(newval, oldval){
        this.changeColorSlider('mountain', newval)
        if(!this.starting) this.setTimeoutRechPower()
    },
    'globalStore.cardfilter.mountainormore'(newval, oldval){
        if(!this.starting) this.setTimeoutRechPower()
    },
    'globalStore.cardfilter.ocean'(newval, oldval){
        this.changeColorSlider('ocean', newval)
        if(!this.starting) this.setTimeoutRechPower()
    },
    'globalStore.cardfilter.oceanormore'(newval, oldval){
        if(!this.starting) this.setTimeoutRechPower()
    },
    'globalStore.cardfilter.recallcostormore'(newval, oldval){
        if(!this.starting) this.setTimeoutRechRecallcost()
    },
    'globalStore.cardfilter.maincostormore'(newval, oldval){
        if(!this.starting) this.setTimeoutRechMaincost()
    },
    'globalStore.cardfilter.maincost'(newval, oldval){
      var rangePercent = newval * 10
      $('#awid-fmaincost').css('filter', 'hue-rotate(-' + rangePercent + 'deg)')

      if(!this.starting) this.setTimeoutRechMaincost()
    },
    'globalStore.cardfilter.recallcost'(newval, oldval){
      var rangePercent = newval * 10
      $('#awid-frecallcost').css('filter', 'hue-rotate(-' + rangePercent + 'deg)')

      if(!this.starting) this.setTimeoutRechRecallcost()
    },
    'globalStore.cardfilter.sorts'(newval, oldval){
      if(!this.starting) this.setTimeoutRechSort()
    },
    'globalStore.cardfilter.editions'(newval, oldval){
      if(!this.starting) this.setTimeoutRechEdition()
    },
    'globalStore.cardfilter.subtypes'(newval, oldval){
      if(!this.starting) this.setTimeoutRechSubtype()
    },
    'globalStore.cardfilter.keywords'(newval, oldval){
      if(!this.starting) this.setTimeoutRechKeyword()
    },
    'globalStore.cardfilter.onlycollec'(newval, oldval){
      if(newval) this.globalStore.cardfilter.onlywant = false
    },
    'globalStore.cardfilter.onlyechangeable'(newval, oldval){
      if(newval) this.globalStore.cardfilter.onlywant = false
    },
    'globalStore.cardfilter.onlywant'(newval, oldval){
      if(newval){
          this.globalStore.cardfilter.onlyechangeable = false
          this.globalStore.cardfilter.onlycollec = false
      }
    },
  },
  inject: ['callShowWaitingScreen', 'callHideWaitingScreen'], // Injecter la méthode de App.vue
  methods: {
    e_showAddUnique()
    {
      this.showModalImportUnique = true
      this.fCodeImportUnique = null
      this.importedUnique = null

      setTimeout(() => $('#awid-fCodeImportUnique').trigger('focus'), 250)
    },
    e_importerUnique()
    {
      if(!this.fCodeImportUnique) return

      var tab = this.fCodeImportUnique.split('/')
      var id = tab[tab.length - 1]
      this.fCodeImportUnique = id

      const onFetchedCard = pcard => 
      {
        //si la carte a ete trouvé => message d'erreur
        if(pcard)
        {
          this.callHideWaitingScreen()
          this.importedUnique = pcard
          toast("Cette carte existe déjà", { type: TYPE.ERROR })
          return
        }
        
        this.g_updateCardFromApi(this.fCodeImportUnique, false,
          //onUpdatedCard: 
          (ppcard, palreadyexists, pforcedlocale) => 
          {
            if(!ppcard)
            {
              if(!pforcedlocale) this.callHideWaitingScreen()
              toast("Une erreur s'est produite lors de l'import de la carte", { type: TYPE.ERROR })
              return
            }

            if(!this.g_isUnique(ppcard))
            {
              this.callHideWaitingScreen()
              toast("Cette carte n'est pas une unique", { type: TYPE.ERROR });
              return
            }

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
        )
      }

      this.callShowWaitingScreen(500)
      this.g_fetchCard(this.fCodeImportUnique, onFetchedCard);
    },
    e_updateCollection()
    {
      if(this.fetchedCards.length == 0) return

      this.g_updateCollection(this.fetchedCards, (pdata, perror) => 
      {
        if(perror) 
        {
          toast(perror.message, { type: TYPE.ERROR }) 
          return
        }
        toast("Cartes mises à jour : " + pdata.nbupdates, { type: TYPE.SUCCESS }) 
      })
    },
    e_searchCards()
    {
      if(!this.globalStore.cardfilter.faction)
      {
        toast('Veuillez sélectionner une faction pour pouvoir lancer la recherche', { type: TYPE.ERROR }) 
        return
      }

      this.$emit('searchcards')
    },
    e_showMissingCollection()
    {
      this.$emit('updatemissing', true, false, false)
    },
    e_showMissingTrade()
    {
      this.$emit('updatemissing', false, true, false)
    },
    e_showMissingWant()
    {
      this.$emit('updatemissing', false, false, true)
    },
    e_changeFaction(event) 
    {
      if(!this.canselectfaction) return

      var $target = $(event.target)
      var $a = $target.is("a") ? $target : $target.parents("a:first")

      this.globalStore.cardfilter.faction = $a.attr("id")
    },
    e_selectCharacter() 
    {
      this.globalStore.cardfilter.character = !this.globalStore.cardfilter.character
      this.setTimeoutRechType()
    },
    e_selectSpell() 
    {
      if(this.globalStore.cardfilter.unique) return
      this.globalStore.cardfilter.spell = !this.globalStore.cardfilter.spell
      this.setTimeoutRechType()      
    },
    e_selectPermanent() 
    {
      if(this.globalStore.cardfilter.unique) return
      this.globalStore.cardfilter.permanent = !this.globalStore.cardfilter.permanent
      this.setTimeoutRechType()      
    },
    e_selectHero() 
    {
      if(this.globalStore.cardfilter.unique) return
      this.globalStore.cardfilter.hero = !this.globalStore.cardfilter.hero
      this.setTimeoutRechType()
    },
    e_selectToken()
    {
      if(this.globalStore.cardfilter.unique) return
      this.globalStore.cardfilter.token = !this.globalStore.cardfilter.token
      this.setTimeoutRechType()
    },
    e_selectCommon() 
    {
      this.globalStore.cardfilter.common = !this.globalStore.cardfilter.common
      if(this.deckbuilder)
      {
        this.globalStore.cardfilter.unique = false
      }
      this.setTimeoutRechRarete()
    },
    e_selectRare() 
    {
      this.globalStore.cardfilter.rare = !this.globalStore.cardfilter.rare
      if(this.deckbuilder)
      {
        this.globalStore.cardfilter.unique = false
      }
      this.setTimeoutRechRarete()
    },
    e_selectUnique() 
    {
      this.globalStore.cardfilter.unique = !this.globalStore.cardfilter.unique
      this.globalStore.controlerFiltreUnique(this.deckbuilder)
      this.setTimeoutRechRarete()
    },
    e_downloadImages()
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
    e_updateDetailFromApi()
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
    changeColorSlider(pbiome, pvalue)
    {
      $("#awid-" + pbiome).css('filter', 'grayscale(' + (50 - (5 * pvalue)) + '%)');
    },
    getClassFaction(pfaction)
    {
      var classe = 'aw-' + this.g_getFactionName(pfaction, true)

      if(pfaction == this.globalStore.cardfilter.faction)
      {
        classe += ' aw-selected'
      }

      if(!this.canselectfaction)
      {
        classe += ' aw-opacity25 aw-cursor-notallowed'
      }
      return classe
    },
    getTitleFaction(pfaction)
    {
      if(!this.canselectfaction)
      {
        return 'La sélection des factions n\'est pas possible tant que le héro du deck a été choisi'
      }
      return 'Sélection de la faction ' + this.g_getFactionName(pfaction)
    },
    getTitleType(ptype)
    {
      const name = this.g_getTypeName(ptype)
      return !this.g_isTypeCodeCharacter(ptype) && this.globalStore.cardfilter.unique ? 'Le type ' + name + ' ne peut pas être activé pour une rareté Unique' : 'Sélection du type ' + name
    },
    getClassType(ptype)
    {
      var classe = 'aw-' + ptype.toLowerCase()
      var isselected = false
      switch(ptype)
      {
        case 'CHARACTER': isselected = this.globalStore.cardfilter.character
          break
        case 'SPELL': isselected = this.globalStore.cardfilter.spell
          break
        case 'PERMANENT': isselected = this.globalStore.cardfilter.permanent
          break
        case 'HERO': isselected = this.globalStore.cardfilter.hero
          break
        case 'TOKEN': isselected = this.globalStore.cardfilter.token
          break
        default: isselected = false
          break
      }
      
      if(isselected) {
        classe += ' aw-selected'
      }
      
      if(!this.g_isTypeCodeCharacter(ptype) && this.globalStore.cardfilter.unique){
        classe += ' aw-opacity25 aw-cursor-notallowed'
      }
      return classe
    },
    getClassRarity(prarity)
    {
      var classe = 'aw-' + prarity.toLowerCase()
      var isselected = false
      switch(prarity)
      {
        case 'COMMON': isselected = this.globalStore.cardfilter.common
          break
        case 'RARE': isselected = this.globalStore.cardfilter.rare
          break
        case 'UNIQUE': isselected = this.globalStore.cardfilter.unique
          break
        default: isselected = false
          break
      }
      
      if(isselected) {
        classe += ' aw-selected'
      }
      return classe
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
  }
};
</script>

<style scoped>
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

  .aw-stats .aw-slider input#awid-forest[type=range]::-webkit-slider-thumb {
    box-shadow: -330px 0 0 320px var(--c-forest), inset 0 0 0 25px var(--c-forest);
  }

  .aw-stats .aw-slider input#awid-mountain[type=range]::-webkit-slider-thumb {
    box-shadow: -330px 0 0 320px var(--c-mountain), inset 0 0 0 25px var(--c-mountain);
  }

  .aw-stats .aw-slider input#awid-water[type=range]::-webkit-slider-thumb {
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

</style>