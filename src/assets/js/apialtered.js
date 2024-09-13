import axios from 'axios';

const bearer = null
const API_CARDS_ENDPOINT = 'https://api.altered.gg/cards'
const API_DECK_ENDPOINT = 'https://api.altered.gg/deck_user_lists/'

export default {
    install: (app, options) => 
    {
        app.config.globalProperties.gaa_isBearer = function()
        {
            return bearer != null
        }

        async function fetchCards (params, pcallback)
        {
            var apiparams = {
                itemsPerPage: params.itemsPerPage,
                page: params.currentPage,
                factions: params.currentFaction
            }

            params.currentSort.forEach((sortingType) => {
                var tabs = sortingType.split(',');
                apiparams["order[" + (tabs[0] == 'name' ? 'translations.name' : tabs[0]) + "]"] = (tabs.length == 1 ? "ASC" : "DESC");
            });
    
            if (bearer) $.extend(apiparams, { collection: true });
            if (params.currentName != '') $.extend(apiparams, { "translations.name": params.currentName });
            if (params.calculatedforest.length > 0) $.extend(apiparams, { forestPower: params.calculatedforest });
            if (params.calculatedmountain.length > 0) $.extend(apiparams, { mountainPower: params.calculatedmountain });
            if (params.calculatedwater.length > 0) $.extend(apiparams, { oceanPower: params.calculatedwater });
            if (params.calculatedmaincost.length > 0) $.extend(apiparams, { mainCost: params.calculatedmaincost });
            if (params.calculatedrecallcost.length > 0) $.extend(apiparams, { recallCost: params.calculatedrecallcost });
            if (params.calculatedtype.length > 0) $.extend(apiparams, { cardType: params.calculatedtype });
            if (params.calculatedrarity.length > 0) $.extend(apiparams, { rarity: params.calculatedrarity });
            if (params.currentKeywords.length > 0) $.extend(apiparams, { keyword: params.currentKeywords });
            if (params.currentEditions.length > 0) $.extend(apiparams, { cardSet: params.currentEditions });
            if (params.currentSoustypes.length > 0) $.extend(apiparams, { cardSubTypes: params.currentSoustypes });
    
            var headers = {
                "Accept-Language": "fr-fr"
            };
            if (bearer) {
                $.extend(headers, { Authorization: "Bearer " + bearer });
            }
    

            axios.get(API_CARDS_ENDPOINT, {headers: headers, params: apiparams})
                .then((response) => 
                {
                    var hasMore = response.data["hydra:view"]["hydra:next"] != undefined
                    var pcards = response.data["hydra:member"]

                    pcallback(pcards, hasMore)      
                })
                .catch(error => 
                {
                    console.error('Erreur lors de la récupération des cartes via l\'api : ', error);
                    pcallback([], hasMore)
                })
        }

        app.config.globalProperties.gaa_fetchCards = function(params, pcallback)
        {
            fetchCards(params, pcallback)
        }

        app.config.globalProperties.gaa_fetchDeck = function(pid, pcallback)
        {
            fetchDeck(pid, pcallback)
        }

        async function fetchDeck (pid, pcallback)
        {
            try{
                const { data, error} = await axios.get(API_DECK_ENDPOINT + pid)
                
                if(error) console.error(error)
                pcallback(error ? null : data)
            }
            catch(error)
            {
                console.error(error)
                pcallback(null)
            }
            
        }

    }
}