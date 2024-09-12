import subtypes from '../rsc/subtypes.json'
import factions from '../rsc/factions.json'
import keywords from '../rsc/keywords.json'

const altered = {
    options: {
        subtypes: null,
        keywords: null,
    }
};

export default {
    install: (app, options) => 
    {
        app.config.globalProperties.g_getImageBanner = function(phero)
        {
            var heroname = phero.name.split('&')[0].trim().toLowerCase();
            return "https://fyqptmokmnymednlerpj.supabase.co/storage/v1/object/public/Altered/assets/banner-" + heroname + '.png';
        }

        app.config.globalProperties.g_getImageHeroNotext = function(phero)
        {
            var heroname = phero.name.split('&')[0].trim().toLowerCase();
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

        app.config.globalProperties.g_deconnecter = function(pcallback)
        {
            deconnectUser(pcallback);
        }

        app.config.globalProperties.g_getProbaMainDeDepart = function(k, pcard, pdeck)
        {
            const hero = this.g_getCardsOfTypeHero(pdeck);

            const N = this.g_getNombreTotalCartes(pdeck, false); // Taille de la population
            const K = pcard.quantite; // Nombre d'éléments de succès
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
            return keywords.find(kw => kw.reference == preference).name;
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
            var heros = this.g_getCardsOfTypeHero(pdeck);
      
            if(!heros || heros.length == 0) return false;
      
            return heros[0].mainFaction != pcard.mainFaction;
        };

        app.config.globalProperties.g_isHero = function (pcard) {
            return pcard.cardType == "HERO";
        };
        app.config.globalProperties.g_isPersonnage = function (pcard) {
            return pcard.cardType == "CHARACTER";
        };
        app.config.globalProperties.g_isSort = function (pcard) {
            return pcard.cardType == "SPELL";
        };
        app.config.globalProperties.g_isPermanent = function (pcard) {
            return pcard.cardType == "PERMANENT";
        };

        app.config.globalProperties.g_isCommon = function (pcard) {
            return pcard.rarity == "COMMON";
        };
        app.config.globalProperties.g_isRare = function (pcard) {
            return pcard.rarity == "RARE";
        };
        app.config.globalProperties.g_isUnique = function (pcard) {
            return pcard.rarity == "UNIQUE";
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

        app.config.globalProperties.g_canAddCardToDeck = function(pcard, pdeck)
        {
            if(!pdeck) return false;
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
            switch (pfaction) 
            {
                case "AX":
                    return "#6B4236";
                case "BR":
                    return "#982925";
                case "LY":
                    return "#A9365E";
                case "MU":
                    return "#3B6331";
                case "OR":
                    return "#0B5974";
                case "YZ":
                    return "#714A79";
                default:
                    return "#FFF";
            }
        }; 
        app.config.globalProperties.g_getFactionName = function (pfaction, plc)
        {
            var name = factions[pfaction].fr;
            return plc ? name.toLowerCase() : name;
        }
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
            return preference && preference.split('_').length == 7            
        }
    }
};