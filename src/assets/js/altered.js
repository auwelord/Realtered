import subtypes from '../rsc/subtypes.json'
import factions from '../rsc/factions.json'
import formats from '../rsc/formats.json'
import heros from '../rsc/heros.json'
import keywords from '../rsc/keywords.json'
import types from '../rsc/types.json'
import { useGlobalStore } from '@/stores/global'

const altered = {
    options: {
        subtypes: null,
        keywords: null,
    }
};

export default {
    install: (app, options) => 
    {
        app.config.globalProperties.g_getLocale = function()
        {
            return useGlobalStore().language;
        }

        app.config.globalProperties.g_isLocaleFrench = function()
        {
            return useGlobalStore().isFrenchLanguage();
        }

        app.config.globalProperties.g_getHeroName = function(phero)
        {
            return phero.name.split('&')[0].trim().toLowerCase()
        }

        app.config.globalProperties.g_getImageLogo = function()
        {
            return 'https://fyqptmokmnymednlerpj.supabase.co/storage/v1/object/public/Altered/assets/logos/Realtered.png'
        }

        app.config.globalProperties.g_getImageBanner = function(phero)
        {
            var heroname = this.g_getHeroName(phero)
            return "https://fyqptmokmnymednlerpj.supabase.co/storage/v1/object/public/Altered/assets/banner-" + heroname + '.png';
        }

        app.config.globalProperties.g_getImageHeroNotext = function(phero)
        {
            var heroname = this.g_getHeroName(phero)
            return "https://fyqptmokmnymednlerpj.supabase.co/storage/v1/object/public/Altered/assets/heronotext-" + heroname + '.png';
        }

        function combinaison(a, b) {
            if (b > a) return 0; // Pas possible d'avoir plus de succès que de cartes disponibles
            if (b === 0 || b === a) return 1;
            let numerator = 1;
            let denominator = 1;
            for (let i = 0; i < b; i++) {
                numerator *= (a - i);
                denominator *= (i + 1);
            }
            return numerator / denominator;
        }

        function distributionHypergeometrique(N, K, n, k) {
            const comb1 = combinaison(K, k); // Nombre de façons de choisir k succès parmi K
            const comb2 = combinaison(N - K, n - k); // Nombre de façons de choisir les échecs parmi les autres cartes
            const combTotal = combinaison(N, n); // Nombre total de façons de choisir n cartes parmi N
        
            return (comb1 * comb2) / combTotal; // Probabilité hypergéométrique
        }

        app.config.globalProperties.g_formats = function()
        {
            return formats
        }

        app.config.globalProperties.g_formatsForCb = function()
        {
            return formats.map(format => {
                return {
                    value: format.code,
                    label: format.fr
                }
            })
        }

        app.config.globalProperties.g_deconnecter = function(pcallback)
        {
            deconnectUser(pcallback);
        }

        app.config.globalProperties.g_getProbaPersos = function(pqtedesiree, pdeck)
        {
            const qtepersos = this.g_getTotalPersosInDeck({deck: pdeck})
            return this.g_getProbaMainDeDepart(pqtedesiree, qtepersos, pdeck)
        }

        app.config.globalProperties.g_getProbaSorts = function(pqtedesiree, pdeck)
        {
            const qtesorts = this.g_getTotalSortsInDeck({deck: pdeck})
            return this.g_getProbaMainDeDepart(pqtedesiree, qtesorts, pdeck)
        }
        app.config.globalProperties.g_getProbaPermas = function(pqtedesiree, pdeck)
        {
            const qtepermas = this.g_getTotalPermasInDeck({deck: pdeck})
            return this.g_getProbaMainDeDepart(pqtedesiree, qtepermas, pdeck)
        }

        app.config.globalProperties.g_getProbaMainDeDepart = function(k, pquantite, pdeck)
        {
            const hero = this.g_getCardsOfTypeHero(pdeck);

            const N = this.g_getNombreTotalCartes(pdeck, false); // Taille de la population
            const K = pquantite; // Nombre d'éléments de succès
            const n = 6;  // Taille de l'échantillon : main de départ

            let probaNombreExacte = distributionHypergeometrique(N, K, n, k);
            probaNombreExacte = (probaNombreExacte * 100).toFixed(2) + "%";

            let probaNombreOuPlus = 0;
            // Boucle pour k allant de 2 à min(K, n)
            for (let kk = k; kk <= Math.min(K, n); kk++) {
                probaNombreOuPlus += distributionHypergeometrique(N, K, n, kk);
            }
            probaNombreOuPlus = (probaNombreOuPlus * 100).toFixed(2) + "%";

            let probaNombreOuMoins = 0;
            // Boucle pour k allant de 2 à min(K, n)
            for (let kk = 0; kk <= k; kk++) {
                probaNombreOuMoins += distributionHypergeometrique(N, K, n, kk);
            }
            probaNombreOuMoins = (probaNombreOuMoins * 100).toFixed(2) + "%";

            let probaZero = (distributionHypergeometrique(N, K, n, 0) * 100).toFixed(2) + "%";

            return [probaNombreOuMoins, probaNombreExacte, probaNombreOuPlus, probaZero];
        }

        app.config.globalProperties.g_getNombreTotalCartes = function(pdeck, pAvecHero)
        {
            var total = 0;
            pdeck.cards.forEach(card => {
                if (pAvecHero || !this.g_isHero(card) ) 
                {
                    total += card.quantite;
                }
            });
            return total;
        }

        app.config.globalProperties.g_getKeywordLabel = function (preference) 
        {
            var keyword = keywords.find(kw => kw.reference == preference)
            return keyword ? keyword.name : preference;
        }
        app.config.globalProperties.g_getKeywordsOptions = function () 
        {
            if(!altered.options.keywords)
            {
                const st = keywords.map(pkeyword => {
                    return {
                        value:pkeyword.reference,
                        label:pkeyword.name,
                    }
                });
                altered.options.keywords = st.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
                
            }
            return altered.options.keywords;
        };

        app.config.globalProperties.g_getSubtypesOptions = function () 
        {
            if(!altered.options.subtypes)
            {
                const st = [];
                for (let key in subtypes) {
                    if (subtypes.hasOwnProperty(key)) {
                        st.push({ value: key, label: subtypes[key].fr});
                    }
                }
                altered.options.subtypes = st.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
            }
            return altered.options.subtypes;
        };

        app.config.globalProperties.g_getCardsOfType = function (ptype, pdeck, pisdecklist) {
            if (!pdeck) return [];

            const cards = [];
            var liste = pisdecklist ? pdeck : pdeck.cards;

            liste.forEach(card => {
                if (card.cardType == ptype) {
                    cards.push(card);
                }
            });
            return cards;
        };

        app.config.globalProperties.g_getCardsOfTypeHero = function (pdeck) {
            return this.g_getCardsOfType("HERO", pdeck);
        }
        app.config.globalProperties.g_getCardsOfTypeHeroDecklist = function (pdeck) {
            return this.g_getCardsOfType("HERO", pdeck, true);
        }

        app.config.globalProperties.g_isOOF = function (pcard, pdeck)
        {
            if(!pdeck.main_faction) return false;
      
            return pdeck.main_faction != pcard.mainFaction;
        };

        app.config.globalProperties.g_containsOOF = function (pdeck)
        {
            if(!pdeck.main_faction) return false

            return pdeck.cards.some(pcard => this.g_isOOF(pcard, pdeck))
        }

        app.config.globalProperties.g_isHero = function (pcard) {
            return pcard && pcard.cardType == "HERO";
        };
        app.config.globalProperties.g_isPersonnage = function (pcard) {
            return pcard && pcard.cardType == "CHARACTER";
        };
        app.config.globalProperties.g_isSort = function (pcard) {
            return pcard && pcard.cardType == "SPELL";
        };
        app.config.globalProperties.g_isPermanent = function (pcard) {
            return pcard && pcard.cardType == "PERMANENT";
        };
        app.config.globalProperties.g_isToken = function (pcard) {
            return pcard && pcard.cardType == "TOKEN";
        };

        app.config.globalProperties.g_isCommon = function (pcard) {
            return pcard && pcard.rarity == "COMMON";
        };
        app.config.globalProperties.g_isRare = function (pcard) {
            return pcard && pcard.rarity == "RARE";
        };
        app.config.globalProperties.g_isUnique = function (pcard) {
            return pcard && pcard.rarity == "UNIQUE";
        };
        
        app.config.globalProperties.g_canHaveBoost = function (pcard) {
            return this.g_isPersonnage(pcard) || this.g_isToken(pcard);
        };
        app.config.globalProperties.g_canHaveMarker = function (pcard) {
            return this.g_isPermanent(pcard) || this.g_isHero(pcard);
        };

        app.config.globalProperties.g_getQuantiteInDeck = function (pcard, pdeck) {
            if(!pdeck || !pdeck.cards || !pcard) return 0;

            var card = this.g_getCardInDeck(pcard.reference, pdeck);
            return card ? card.quantite : 0;
        };

        app.config.globalProperties.g_getCardInDeck = function (pref, pdeck) {
            if(!pdeck || !pdeck.cards || !pref) return 0;

            var zecard = null;
            pdeck.cards.forEach(card => {
                if (card.reference == pref) {
                    zecard = card;
                    return;
                }
            });
            return zecard;
        };

        app.config.globalProperties.g_getImageApercu = function(purl)
        {
            if(purl) return purl
            return "/src/assets/img/altered/card-back.webp"
        }

        
        app.config.globalProperties.g_canAddCardToDeck = function(pcard, pdeck)
        {
            if(!pdeck) return false;
            if(this.g_isToken(pcard)) return false
            if(pcard.quantite == 3) return false;
            if(this.g_isOOF(pcard, pdeck)) return false;
            var ishero = this.g_isHero(pcard);
            if(pcard.quantite == 1 && (ishero || this.g_isUnique(pcard))) return false;

            if(ishero)
            {
                var hero = this.g_getCardsOfTypeHero(pdeck);
                if(hero && hero.length > 0) return false;
            }

            return true;
        }

        app.config.globalProperties.g_colorForest = () => "#B4BF4D";
        app.config.globalProperties.g_colorMountain = () => "#BE8049";
        app.config.globalProperties.g_colorWater = () => "#648AB9";

        app.config.globalProperties.g_getFactionColor = function (pfaction)
        {
            const faction = factions[pfaction]
            return faction ? faction.color : "#FFF"
        }; 

        app.config.globalProperties.g_getHeroColorByName = function (pname)
        {
            const hero = heros[pname]
            return hero ? hero.color : "#FFF"
        }

        app.config.globalProperties.g_isDeckAxiom = function (pdeck) {
            return pdeck && pdeck.main_faction && this.g_isCodeAxiom(pdeck.main_faction)
        };
        app.config.globalProperties.g_isDeckBravos = function (pdeck) {
            return pdeck && pdeck.main_faction && this.g_isCodeBravos(pdeck.main_faction)
        };
        app.config.globalProperties.g_isDeckLyra = function (pdeck) {
            return pdeck && pdeck.main_faction && this.g_isCodeLyra(pdeck.main_faction)
        };
        app.config.globalProperties.g_isDeckMuna = function (pdeck) {
            return pdeck && pdeck.main_faction && this.g_isCodeMuna(pdeck.main_faction)
        };
        app.config.globalProperties.g_isDeckOrdis = function (pdeck) {
            return pdeck && pdeck.main_faction && this.g_isCodeOrdis(pdeck.main_faction)
        };
        app.config.globalProperties.g_isDeckYzmir = function (pdeck) {
            return pdeck && pdeck.main_faction && this.g_isCodeYzmir(pdeck.main_faction)
        };

        app.config.globalProperties.g_isCodeAxiom = function (pcode) {
            return pcode == "AX"
        };
        app.config.globalProperties.g_isCodeBravos = function (pcode) {
            return pcode == "BR"
        };
        app.config.globalProperties.g_isCodeLyra = function (pcode) {
            return pcode == "LY"
        };
        app.config.globalProperties.g_isCodeMuna = function (pcode) {
            return pcode == "MU"
        };
        app.config.globalProperties.g_isCodeOrdis = function (pcode) {
            return pcode == "OR"
        };
        app.config.globalProperties.g_isCodeYzmir = function (pcode) {
            return pcode == "YZ"
        };

        app.config.globalProperties.g_getFaction = function (pcodefaction)
        {
            return factions[pcodefaction]
        }
        app.config.globalProperties.g_getFactionName = function (pfaction, plc)
        {
            var name = factions[pfaction].fr;
            return plc ? name.toLowerCase() : name;
        }
        app.config.globalProperties.g_getTypeName = function (ptype, plc)
        {
            var name = types[ptype].fr;
            return plc ? name.toLowerCase() : name;
        }
        app.config.globalProperties.g_isTypeCodeCharacter = function (ptype) {
            return ptype == 'CHARACTER'
        };
        app.config.globalProperties.g_getFactionColorFromDeck = function (pdeck)
        {
            return this.g_getFactionColor(this.g_getFactionFromDeck(pdeck));
        };
        app.config.globalProperties.g_getFactionFromDeck = function (pdeck)
        {
            //recup du hero  
            var card = this.g_getCardsOfTypeHero(pdeck);
      
            if((!card || card.length == 0) && pdeck.cards.length > 0)
            {
                card = [pdeck.cards[0]];
            }
            
            if(card && card.length > 0)
            {
                return card[0].mainFaction;
            }
            return null;
        }

        function getTotalTypesInDeck(params) 
        {
            if(!params || !params.deck) return 0

            var total = 0;
            for (var pcard of params.deck.cards) 
            {
                if (pcard.cardType == params.type)
                total += pcard.quantite;
            }
            return total
        }

        app.config.globalProperties.g_getTotalPersosInDeck = function (params) 
        {
            return getTotalTypesInDeck($.extend(params, {type: "CHARACTER"}))
        }

        app.config.globalProperties.g_getTotalSortsInDeck = function (params) 
        {
            return getTotalTypesInDeck($.extend(params, {type: "SPELL"}))
        }

        app.config.globalProperties.g_getTotalPermasInDeck = function (params)
        {
            return getTotalTypesInDeck($.extend(params, {type: "PERMANENT"}))
        }

        function getTotalRarityInDeck(params) 
        {
            var total = 0;
            for (var pcard of params.deck.cards) 
            {
              if (!params.rarity || (pcard.rarity == params.rarity && pcard.cardType != "HERO"))
                total += pcard.quantite;
            }
            return total;
        }

        app.config.globalProperties.g_getTotalCardsInDeck = function (params)
        {
            return getTotalRarityInDeck(params);
        }

        app.config.globalProperties.g_getTotalCommunesInDeck = function (params)
        {
            return getTotalRarityInDeck($.extend(params, {rarity: "COMMON"}));
        }

        app.config.globalProperties.g_getTotalRaresInDeck = function (params)
        {
            return getTotalRarityInDeck($.extend(params, {rarity: "RARE"}));
        }

        app.config.globalProperties.g_getTotalUniquesInDeck = function (params)
        {
            return getTotalRarityInDeck($.extend(params, {rarity: "UNIQUE"}));
        }

        /**
         * preference : reference de la carte à tester
         * @return true si la référence est associée à une unique, false sinon
         */
        
        app.config.globalProperties.g_isUniqueFromReference = function (preference)
        {
            return preference && preference.split('_').length == 7 && preference.split('_')[5] == 'U'
        }

        app.config.globalProperties.g_sortDeck = function (pdeck) {
            if(!pdeck || !pdeck.cards) return
            
            pdeck.cards.sort((a, b) => {
                if(this.g_isUnique(a) && !this.g_isUnique(b)) return -1;
                if(!this.g_isUnique(a) && this.g_isUnique(b)) return 1;

                //deja trié via la requete, si meme type, on garde le tri d'origine
                if (a.cardType == b.cardType)
                {
                    if(a.mainCost != b.mainCost) return a.mainCost < b.mainCost ? -1 : 1
                    if(a.recallCost != b.recallCost) return a.recallCost < b.recallCost ? -1 : 1
                    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                }

                if (this.g_isPersonnage(a)) return -1;
                if (this.g_isPermanent(a)) return 1;
                if (this.g_isPersonnage(b)) return 1;
                if (this.g_isPermanent(b)) return -1;
            });
        }

        app.config.globalProperties.g_decodeHTMLEntities = function(encodedStr)
        {
            const div = document.createElement('div');
            div.innerHTML = encodedStr;
            return div.innerText || div.textContent;
        }
    }
};