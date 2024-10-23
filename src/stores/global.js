// stores/counter.js
import { defineStore } from 'pinia';

export const useGlobalStore = defineStore('global', {
  state: () => ({
    modesombre: true,
    database: true,
    language: 'fr',
    lastVisitedPage: null,
    cardfilter: {
      faction: null,
      onlycollec: false,
      name: null,
      character: false,
      spell: false,
      permanent: false,
      hero: false,
      token: false,
      common: false,
      rare: false,
      unique: false,
      sorts: ['mainCost', 'recallCost', 'name'],
      editions: [],
      subtypes: [],
      keywords: [],
      maincost: 0,
      maincostormore: 'ouplus',
      recallcost: 0,
      recallcostormore: 'ouplus',
      forest: 0,
      forestormore: 'ouplus',
      mountain: 0,
      mountainormore: 'ouplus',
      ocean: 0,
      oceanormore: 'ouplus',
      notemptystatic: false,
      static: null,
      notemptyetb: false,
      etb: null,
      notemptyhand: false,
      hand: null,
      notemptyrecall: false,
      recall: null,
      notemptyexhaust: false,
      exhaust: null,
      notemptysupport: false,
      support: null,
      ui:{
        showtools: false,
        showrarity: true,
        showkeyword: true,
        showmaincost: true,
        showrecallcost: true,
        showsort: true,
        showedition: true,
        showsubtype: true,
        showtype: true,
        showpower: true,
      }
    }
  }),
  actions: 
  {
    isFrenchLanguage() {
      return this.language == 'fr';
    },
    clearCardFilter(pgstunique) {
      this.cardfilter.name = null
      this.cardfilter.subtypes = []
      this.cardfilter.keywords = []
      this.cardfilter.maincost = 0
      this.cardfilter.maincostormore = 'ouplus'
      this.cardfilter.recallcost = 0
      this.cardfilter.recallcostormore = 'ouplus'
      this.cardfilter.forest = 0
      this.cardfilter.forestormore = 'ouplus'
      this.cardfilter.mountain = 0
      this.cardfilter.mountainormore = 'ouplus'
      this.cardfilter.ocean = 0
      this.cardfilter.oceanormore = 'ouplus'
      this.cardfilter.notemptystatic = false
      this.cardfilter.static = null
      this.cardfilter.notemptyetb = false
      this.cardfilter.etb = null
      this.cardfilter.notemptyhand = false
      this.cardfilter.hand = null
      this.cardfilter.notemptyrecall = false
      this.cardfilter.recall = null
      this.cardfilter.notemptyexhaust = false
      this.cardfilter.exhaust = null
      this.cardfilter.notemptysupport = false
      this.cardfilter.support = null

      if(!pgstunique)
      {
        this.cardfilter.character = false
        this.cardfilter.spell = false
        this.cardfilter.permanent = false
        this.cardfilter.hero = false
        this.cardfilter.token = false
        this.cardfilter.common = false
        this.cardfilter.rare = false
        this.cardfilter.unique = false
      }
    },
    controlerFiltreUnique(pdeckbuilder)
    {
      if(this.cardfilter.unique)
      {
        this.cardfilter.character = true
        this.cardfilter.spell = false
        this.cardfilter.permanent = false
        this.cardfilter.hero = false
        this.cardfilter.token = false
        if(pdeckbuilder)
        {
          this.cardfilter.rare = false
          this.cardfilter.common = false
        }
      }
    },
    getNotEmptySorts()
    {
      if (this.cardfilter.sorts.length == 0) this.cardfilter.sorts.push('name')
      return this.cardfilter.sorts
    },
    getFilterTypes()
    {
      var types = []
      if (this.cardfilter.character) types.push("CHARACTER")
      if (this.cardfilter.spell) types.push("SPELL")
      if (this.cardfilter.permanent) types.push("PERMANENT")
      if (this.cardfilter.hero) types.push("HERO")
      if (this.cardfilter.token) types.push("TOKEN")
      return types
    },
    getFilterRarities()
    {
      var rarities = []
      if (this.cardfilter.common) rarities.push("COMMON")
      if (this.cardfilter.rare) rarities.push("RARE")
      if (this.cardfilter.unique) rarities.push("UNIQUE")
      return rarities
    },
    getFilterMainCost() {
      return this._getFilterCost(this.cardfilter.maincostormore, this.cardfilter.maincost);
    },
    getFilterRecallCost() {
      return this._getFilterCost(this.cardfilter.recallcostormore, this.cardfilter.recallcost);
    },
    _getFilterCost(pRangeType, pCostValue) 
    {
      var couts = []

      if (!pRangeType) return [Number(pCostValue)]
      if (pRangeType == "ouplus") {
        if (pCostValue == 0) return [] //0 ou plus : ne pas envoyer le param
        for (let cost = Number(pCostValue); cost <= 20; cost++) {
          couts.push(cost)
        }
      }
      else {
        if (pCostValue == 10) return [] //10 ou moins : ne pas envoyer le param
        for (let cost = Number(pCostValue); cost >= 0; cost--) {
          couts.push(cost)
        }
      }
      return couts
    },
    getFilterForest() {
      return this._getFilterPower(this.cardfilter.forestormore, this.cardfilter.forest);
    },
    getFilterMountain() {
      return this._getFilterPower(this.cardfilter.mountainormore, this.cardfilter.mountain);
    },
    getFilterOcean() {
      return this._getFilterPower(this.cardfilter.oceanormore, this.cardfilter.ocean);
    },
    _getFilterPower(pRangeType, pStatvalue) 
    {
      var powers = []
      
      if (!this.cardfilter.character) return powers //si pas type perso, power ne sert à rien
      if (!pRangeType) return [Number(pStatvalue)]
      
      if (pRangeType == "ouplus") 
      {
        if (pStatvalue == 0) return [] //0 ou plus : ne pas envoyer le param
        for (let power = Number(pStatvalue); power <= 10; power++)
        {
          powers.push(power)
        }
      }
      else 
      {
        if (pStatvalue == 10) return [] //10 ou moins : ne pas envoyer le param
        for (let power = Number(pStatvalue); power >= 1; power--) 
        {
          powers.push(power)
        }
      }
      return powers
    },
    getParamsForRequestCards()
    {
      return {
          calculatedrarity: this.getFilterRarities(),
          calculatedmaincost: this.getFilterMainCost(),
          calculatedrecallcost: this.getFilterRecallCost(),
          calculatedforest: this.getFilterForest(),
          calculatedmountain: this.getFilterMountain(),
          calculatedwater: this.getFilterOcean(),
          calculatedtype: this.getFilterTypes(),
          currentSort: this.getNotEmptySorts(),
          currentFaction: this.cardfilter.faction,
          onlycollec: this.cardfilter.onlycollec,
          currentName: this.cardfilter.name,
          currentEditions: this.cardfilter.editions,
          currentSoustypes: this.cardfilter.subtypes,
          currentKeywords: this.cardfilter.keywords,        
          capaStaticNonVide: this.cardfilter.notemptystatic,
          capaStatic: this.cardfilter.static,
          capaEtbNonVide: this.cardfilter.notemptyetb,
          capaEtb: this.cardfilter.etb,
          capaHandNonVide: this.cardfilter.notemptyhand,
          capaHand: this.cardfilter.hand,
          capaReserveNonVide: this.cardfilter.notemptyrecall,
          capaReserve: this.cardfilter.recall,
          capaSupportNonVide: this.cardfilter.notemptysupport,
          capaSupport: this.cardfilter.support,
          capaExhaustNonVide: this.cardfilter.notemptyexhaust,
          capaExhaust: this.cardfilter.exhaust,
      }
    }
  },
  persist: {
    enabled: true,
    // Customize storage options
    strategies: [
      {
        key: 'globalStore', // The key to store in localStorage
        storage: localStorage, // Use localStorage (default)
        paths: ['modesombre', 'database', 'language', 'lastVisitedPage', 'cardfilter'], // Optionally specify which part of the state to persist
      }
    ]
  }
});