
import { anonCreateClient } from '@/assets/js/supabase'
import axios from 'axios';
import Cookies from 'js-cookie';

const anonSupabase = anonCreateClient()

const API_BASEURL = import.meta.env.VITE_API_BASE_URL
const PROXY_BASEURL = import.meta.env.VITE_PROXY_BASE_URL

/*
axios.interceptors.request.use(config => 
{
    const supabaseSession = JSON.parse(localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_DOMAIN + '-auth-token'))
    if (supabaseSession && supabaseSession.access_token)
    {
        config.headers['authorization'] = `Bearer ${supabaseSession.access_token}`;  // Attach the token to the request headers
    }
    return config;
},
(error) => {
    return Promise.reject(error);
});
*/

export default {
    install: (app, options) => 
    {
        function hparams()
        {
            var token0 = null;
            var token1 = null;
            if(process.env.NODE_ENV === 'production')
            {
                token0 = Cookies.get('sb-fyqptmokmnymednlerpj-auth-token.0')
                token1 = Cookies.get('sb-fyqptmokmnymednlerpj-auth-token.1')
            }

            var params = {
                withCredentials: true
            }
            if(token0) params.headers = 
            {
                'token0': token0,
                'token1': token1
            }

            return params
        }

        async function handleApiError (error)
        {
            if (error.response) {
                // Server error (status code is not in the range 2xx)
                //console.log('Error Status:', error.response.status);
                //console.log('Error Headers:', error.response.headers);
                //console.log('Error Data:', error.response.data);
          
                if (error.response.status === 404) {
                  console.error('Resource not found.');
                } else if (error.response.status === 500) {
                  console.error('Server error.');
                }
              } else if (error.request) {
                // No response received
                console.error('Error: No response received from server:', error.request);
              } else {
                // Request setup error
                console.error('Error Message:', error.message);
              }
        }

        async function connectUser (predirectTo)
        {
            try {
                const { data, error } = await anonSupabase.auth.signInWithOAuth({
                    provider: 'discord',
                    options:
                    {
                        redirectTo: import.meta.env.VITE_APP_BASE_URL + predirectTo
                    }
                })
            } 
            catch (error) {
                console.log(error)
            }    
        }

        app.config.globalProperties.g_connectUser = function(predirectTo)
        {
            connectUser(predirectTo)
        }

        async function assignRoles(puser)
        {
            if(!puser) return

            puser.admin = false

            try {
                const { data, error: erreur } = await axios.get(API_BASEURL + 'user/admin/' + puser.id, hparams())
                puser.admin = data && data.isadmin
            } 
            catch (error) 
            {
                console.error('Error requesting api:', error);
            }
        }

        async function retrieveUser (pcallback)
        {
            try {
                const { data } = await anonSupabase.auth.getUser()

                if(data.user)
                {
                    assignRoles(data.user)
                }
                pcallback(data.user)
            } catch (error) {
                handleApiError(error)
                pcallback(null)
            }                  
        }
        app.config.globalProperties.g_retrieveuser = function(pcallback)
        {
            retrieveUser(pcallback);
        }
        
        async function deconnectUser (pcallback)
        {
            await anonSupabase.auth.signOut()
            if(pcallback) pcallback();
        }

        app.config.globalProperties.g_deconnectUser = function(pcallback)
        {
            deconnectUser(pcallback)
        }

        
        app.config.globalProperties.g_isAdmin = function(puser)
        {
            return puser && puser.admin
        }
        
        async function fetchCardsFromDatabase(params, pcallback)
        {
            var req = anonSupabase
                .from('Card')
                .select()
                .eq('mainFaction', params.currentFaction);

            if (params.currentName != '') req = req.ilike('name', '%' + params.currentName + '%');
            if (params.calculatedrarity.length > 0) req = req.in("rarity", params.calculatedrarity);
            if (params.calculatedmaincost.length > 0) req = req.in("mainCost", params.calculatedmaincost);
            if (params.calculatedrecallcost.length > 0) req = req.in("recallCost", params.calculatedrecallcost);
            if (params.calculatedforest.length > 0) req = req.in("forestPower", params.calculatedforest);
            if (params.calculatedmountain.length > 0) req = req.in("mountainPower", params.calculatedmountain);
            if (params.calculatedwater.length > 0) req = req.in("oceanPower", params.calculatedwater);
            if (params.calculatedtype.length > 0) req = req.in("cardType", params.calculatedtype);
            if (params.currentEditions.length > 0) req = req.in("cardSet", params.currentEditions);

            var streq = [];
            if (params.currentSoustypes.length > 0)
            {
                params.currentSoustypes.forEach(st => streq.push('cardSubtypes.cs.\{' + st + '\}'));
            }
            if(streq.length > 0) req = req.or(streq.join(','));

            var keywords = [];
            params.currentKeywords.forEach(kw => {
                var label = this.g_getKeywordLabel(kw);
                keywords.push('main_effect.ilike.%' + label + '%,echo_effect.ilike.%' + label + '%');
            });
            if(keywords.length > 0) req = req.or(keywords.join(','));
            
            params.currentSort.forEach(sortref => {
                var tab = sortref.split(',');
                req = req.order(tab[0] == 'translations.name' ? 'name' : tab[0], { ascending: tab.length == 1 })
            });      
            
            req = req.range((params.currentPage - 1) * params.itemsPerPage, (params.currentPage * params.itemsPerPage) );

            try {
                const { data: cards, error } = await req;

                pcallback(cards)
            }
            catch(error)
            {
                pcallback([])
            }
        }

        app.config.globalProperties.g_fetchCardsFromDatabase = function(params, pcallback)
        {
            fetchCardsFromDatabase(params, pcallback)
        }

        async function runFetchDecks(preq, pdftval, params)
        {
            if(params.ipp)
            {
                if(params.page === undefined) params.page = 1;
                preq = preq.range((params.page - 1) * params.ipp, (params.page * params.ipp) );
            }
            const { data: decks, error: erreur } = await preq;

            if(params.ipp)
            {
                $.extend(params, {hasnext: decks && decks.length > params.ipp})
                if(params.hasnext) decks.pop()
            }
            
            if(erreur){
                console.log(erreur);
                return;
            }
            if(params.withcards || params.withhero)
            {
                for(let deck of decks)
                {
                    $.extend(deck, {cards: []});

                    if(deck.CardsDeck)
                    {
                        var refs = deck.CardsDeck.map(card => card.cardRef);
                                            
                        var req = await anonSupabase
                            .from('Card')
                            .select()
                            .in('reference', refs)
                            .order('cardType')
                            .order('mainCost')
                            .order('recallCost')
                            .order('name');

                        req.data.forEach(card => 
                        {
                            var realcardeck = deck.CardsDeck.find(carddeck => carddeck.cardRef == card.reference)
                            deck.cards.push($.extend(card, {quantite: realcardeck.quantity}));
                        });
                        delete deck.CardsDeck
                    }
                }
            }

            if(params.callback) params.callback(decks ? decks : pdftval);
        }

        async function fetchDecks(params)
        {
            var select = '*';
            if(params.withcards) select += ', CardsDeck(*), hero:Card(*)';
            else if(params.withhero) select += ', hero:Card(*)';
            
            var req = anonSupabase
                .from('Deck')
                .select(select)
                .order('modifiedAt', {ascending : false});

            if(params.faction) req = req.eq('main_faction', params.faction)
            if(params.hero) req = req.eq('hero_id', params.hero)

            if(params.myonly)
            {
                retrieveUser(puser => 
                {
                    if(!puser)
                    {
                        if(params.callback) params.callback([])
                        return
                    }
                    req = req.eq('userId', puser.id);
                    runFetchDecks(req, [], params);
                });
                return;
            }
            
            //on veut tous les decks
            retrieveUser(puser => 
            {
                //utilisateur non connecté : on recupere que les decks publics
                if(!puser)
                {
                    req = req.eq('public', true);
                }
                else
                {
                    //utilisateur connecté : on recupere tous les decks publics + mes decks
                    req = req.or('public.eq.TRUE,userId.eq.' + puser.id);
                }
                runFetchDecks(req, [], params);
            });          
        }

        app.config.globalProperties.g_fetchDecks = function(params)
        {
            fetchDecks(params)
        }

        async function fetchDeck(pid, pwithcards, pcallback)
        {
            var req = anonSupabase.from('Deck');
            if(pwithcards)
            {
                req = req.select('*, CardsDeck(*), hero:Card(*)')
            }

            const { data: deck, erreurdeck } = await req.eq('id', pid);
            
            var found = deck && deck.length > 0;
            if(found)
            {
                var zedeck = $.extend(deck[0], {cards: []});

                if(pwithcards && deck[0].CardsDeck)
                {
                    var refs = deck[0].CardsDeck.map(card => card.cardRef);
                                        
                    req = await anonSupabase
                        .from('Card')
                        .select()
                        .in('reference', refs);

                    req.data.forEach(card => 
                    {
                        var realcardeck = deck[0].CardsDeck.find(carddeck => carddeck.cardRef == card.reference)
                        zedeck.cards.push($.extend(card, {quantite: realcardeck.quantity}));
                    });
                }
                
                if(pwithcards) delete zedeck.CardsDeck

                pcallback(zedeck);                
            }
            else pcallback(null);
        }

        app.config.globalProperties.g_fetchDeck = function(pid, pwithcards, pcallback)
        {
            fetchDeck(pid, pwithcards, pcallback)
        }

        async function isOwerDeck(params)
        {
            if(!params.deck)
            {
                params.callback(false)
                return
            }

            retrieveUser(puser => 
            {
                params.callback(puser && params.deck.userId == puser.id);
            })
        }

        app.config.globalProperties.g_isOwerDeck = function(params)
        {
            isOwerDeck(params)
        }

        app.config.globalProperties.g_getImageCardPublicUrl = function(pcard)
        {
            if(!pcard.imageS3) return pcard.imagePath;

            const {data: image} = anonSupabase.storage.from('Altered').getPublicUrl(pcard.imageS3);
            if(image.publicUrl.endsWith("null")) return pcard.imagePath;
            return image.publicUrl;
        }

        /**
         * preference : référence de la card à rechercher en base
         * 
         * onFetchedCard(card) : callback de card trouvée en base
         */
        async function fetchCard(preference, onFetchedCard)
        {
            const { data: fetched, error: erreur } = await anonSupabase
                .from('Card')
                .select()
                .eq('reference', preference);

            if(onFetchedCard) 
                onFetchedCard(!erreur && fetched.length > 0 ? fetched[0] : null);
        }

        /**
         * preference : référence de la card à rechercher en base
         * params.onFetchedCard(card) : callback de card trouvée en base
         */
        app.config.globalProperties.g_fetchCard = function(preference, onFetchedCard)
        {
            fetchCard(preference, onFetchedCard)
        }

        async function fetchHeroes(params)
        {
            var req = anonSupabase
                .from('Card')
                .select()
                .eq('cardSet', 'COREKS')
                .eq('cardType', 'HERO');

            if(params.faction) req = req.eq('mainFaction', params.faction)

            const { data: heroes, erreur } = await req;

            if(!erreur && heroes.length > 0 && params.callback)
            {
                params.callback(heroes);
            }
            else if(params.callback) params.callback(null);
        }

        app.config.globalProperties.g_fetchHeroes = function(params)
        {
            fetchHeroes(params)
        }

        async function fetchFactionCards(pfaction, pcallback)
        {
            var req = anonSupabase
                .from('Card')
                .select();

            if(pfaction) req = req.eq('mainFaction', pfaction);

            const { data: cards, error: erreur } = await req;                

            if(!erreur && cards.length > 0)
            {
                if(pcallback) pcallback(cards);
            }
        }

        app.config.globalProperties.g_fetchFactionCards = function(pfaction, pcallback)
        {
            fetchFactionCards(pfaction, pcallback)
        }

        /**
         * params.deck : deck à importer, dans le cas d'une copie de deck (deck au format base de donnée, contenant cards)
         * 
         * params.name: nom du deck à importer (cas d'une liste de cartes ref/qte)
         * params.cards: liste des cartes à importer, au format [{qte: int, ref: string}]
         * 
         * onImportedDeck(deck): callback de deck importé. deck contient les cartes
         *              deck est null si erreur de traitement
         */
        app.config.globalProperties.g_importDeck = function(params, onImportedDeck)
        {
            importDeck(params, onImportedDeck)
        }


        function sleep(ms) 
        {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        

        /**
         * pcards[] : tableau de cards dont les images sont à télécharger
         * 
         * onDownloadingImage(card) : callback pré-telechargement d'une carte
         * onDownloadedImages() : callback de fin de traitement
         * onUpdatedImageS3(card) : callback de fin de mise à jour de la base
         */
        app.config.globalProperties.g_downloadImages = function(pcards, onDownloadingImage, onDownloadedImages, onUpdatedImageS3)
        {
            downloadImages(pcards, onDownloadingImage, onDownloadedImages, onUpdatedImageS3);
        }

        /**
         * preferences[] : liste des référence des uniques à importer
         * 
         * onDownloadingImage(card) : callback pré-telechargement d'une carte
         * onDownloadedImages() : callback de fin de traitement
         * onUpdatedImageS3(card) : callback de fin de mise à jour de la base
        */
        function importerUniques(preferences, onDownloadingImage, onDownloadedImages, onUpdatedImageS)
        {
            for(let ref of preferences)
            {
                importerUnique(ref, onDownloadingImage, onDownloadedImages, onUpdatedImageS)
            }
        }

        /**
         * reference : référence de l'unique à importer
         * 
         * onDownloadingImage(card) : callback pré-telechargement d'une carte
         * onDownloadedImages() : callback de fin de traitement
         * onUpdatedImageS3(card) : callback de fin de mise à jour de la base
        */
        function importerUnique(preference, onDownloadingImage, onDownloadedImages, onUpdatedImageS3)
        {
            if(!preference)
            {
                return
            }

            var onUpdatedCard = pcard => 
            {
                //si la carte n'est pas unique => ras
                if(app.config.globalProperties.g_isUnique(pcard))
                {
                    downloadImages([pcard], onDownloadingImage, onDownloadedImages, onUpdatedImageS3);
                }
            }

            var onFetchedCard = pcard => 
            {
                //si la carte a ete trouvé => ras
                if(!pcard)
                {
                    updateCardFromApi(preference, onUpdatedCard)
                }
            }

            fetchCard(preference, onFetchedCard)
        }

        async function deleteDeck(pdeck, pcallback)
        {
            try {
                const { data, error } = await axios.get(API_BASEURL + 'deck/delete/' + pdeck.id, {}, {withCredentials: true})

                if(error) console.error(error)
                pcallback(error ? null : data);
            }
            catch (error) 
            {
                handleApiError(error)
                pcallback(null);
            }        }

        app.config.globalProperties.g_deleteDeck = function(pdeck, pcallback)
        {
            deleteDeck(pdeck, pcallback)
        }   

        /**
         * params.deck : deck à importer, dans le cas d'une copie de deck (deck au format base de donnée, contenant cards)
         * 
         * params.name: nom du deck à importer (cas d'une liste de cartes ref/qte)
         * params.cards: liste des cartes à importer, au format [{qte: int, ref: string}]
         * 
         * onImportedDeck(deck): callback de deck importé. deck contient les cartes
         *              deck est null si erreur de traitement
         */
        async function importDeck(params, onImportedDeck)
        {
            var deck = params.deck ? params.deck : {
                name: params.name,
                public: true,
                main_faction: '',
                description: ''
            }

            var tmpcards = params.deck ? params.deck.cards : params.cards

            if(params.deck) 
            {
                //ne pas oublier de supprimer l'id et le user !!!
                delete deck.id
                delete deck.userId
                delete deck.cards
                delete deck.hero
                delete deck.createdAt
                delete deck.modifiedAt
            }

            var saveddeck;
            try {
                const { data, error } = await axios.post(API_BASEURL + 'deck/new', deck, {withCredentials: true})

                if(error) console.error(error)
                else saveddeck = data
            }
            catch (error) 
            {
                handleApiError(error)
            }

            if(!saveddeck)
            {
                onImportedDeck(null)
                return
            }

            var cards;
            if(params.deck) 
            {
                cards = tmpcards.map(pcard => 
                {
                    return {
                        cardRef: pcard.reference,
                        deckId:  saveddeck.id,
                        quantity: pcard.quantite
                    }
                })
            }
            else
            {
                cards = tmpcards.map(pcard => 
                {
                    return {
                        cardRef: pcard.ref,
                        deckId:  saveddeck.id,
                        quantity: pcard.qte
                    }
                })
            }
                
            var importingUniques = false
            //recup auto de la faction à partir de la liste des cartes pour update du deck
            //si on est en import de deck de la base, pas besoin le champ est déjà rempli
            if(cards.length > 0 && !params.deck)
            {
                var refs = cards.map(pcard => pcard.cardRef);

                const { data: cardlist, error } = await anonSupabase
                    .from('Card')
                    .select()
                    .in('reference', refs);

                if(!error && cardlist.length > 0)
                {
                    var hero = app.config.globalProperties.g_getCardsOfTypeHeroDecklist(cardlist);
                    if(hero && hero.length > 0)
                    {
                        saveddeck.main_faction = hero[0].mainFaction;
                        saveddeck.hero_id = hero[0].reference;

                        try {
                            const { data, error } = await axios.post(API_BASEURL + 'deck/update', saveddeck, {withCredentials: true})
            
                            if(error) console.error(error)
                        }
                        catch (error) 
                        {
                            handleApiError(error)
                        }
                    }
                }

                //dans le cas d'un import à partir d'une liste ref/qte, il peut y avoir des uniques
                //lancer le traitement d'import
                //NB: ici l'enregistrement Card n'a pas encore été créé
                var uniques = cards
                    .filter(pcard => app.config.globalProperties.g_isUniqueFromReference(pcard.cardRef))
                    .map(pcard => pcard.cardRef)

                if(uniques.length > 0)
                {
                    importingUniques = true
                    var cptUniques = 0
                    importerUniques(uniques,
                        //onDownloadingImage
                        ppcard => console.log("Téléchargement de " + ppcard.imagePath),
                        //onDownloadedImage
                        null,
                        //onUpdatedImageS3
                        ppcard => 
                        {
                            console.log("Upload de " + ppcard.imageS3)
                            cptUniques++

                            if(cptUniques == uniques.length)
                            {
                                runFetchCardsDecks(saveddeck, cards, onImportedDeck)
                            }
                        }
                    )
                }
            }

            if(!importingUniques) runFetchCardsDecks(saveddeck, cards, onImportedDeck)
        }

        async function runFetchCardsDecks(pdeck, pcards, onImportedDeck)
        {
            try {
                const { data, error } = await axios.post(API_BASEURL + 'cardsdeck/set', pcards, {withCredentials: true})

                if(error) console.error(error)
                onImportedDeck(error ? null : pdeck);
            }
            catch (error) 
            {
                handleApiError(error)
                onImportedDeck(null);
            }
        }
        
        /**
         * preference : référence de la card à mettre à jour à partir de l'api
         * 
         * onUpdatedCard(card) : callback de card mise à jour
         */
        app.config.globalProperties.g_updateCardFromApi = function(preference, onUpdatedCard)
        {
            updateCardFromApi(preference, onUpdatedCard)
        }

        /**
         * pcards[] : liste des cards à mettre à jour
         * 
         * onUpdatingCard(card) : callback de card en train d'être mise à jour
         * onUpdatedCard(card) : callback de card mise à jour
         * onUpdatedCards() : callback de fin de mise à jour
         */
        async function updateCardsFromApi(pcards, onUpdatingCard, onUpdatedCard, onUpdatedCards)
        {
            for(let card of pcards)
            {
                if(onUpdatingCard) onUpdatingCard(card)

                updateCardFromApi(card.reference, onUpdatedCard);

                if(pcards.length > 3) await sleep(300)
            }
            if(onUpdatedCards) onUpdatedCards()
        }

        /**
         * pcards[] : liste des cards à mettre à jour
         * 
         * onUpdatingCard(card) : callback de card en train d'être mise à jour
         * onUpdatedCard(card) : callback de card mise à jour
         * onUpdatedCards() : callback de fin de mise à jour
         */
        app.config.globalProperties.g_updateCardsFromApi = function(pcards, onUpdatingCard, onUpdatedCard, onUpdatedCards)
        {
            updateCardsFromApi(pcards, onUpdatingCard, onUpdatedCard, onUpdatedCards)
        }

        /**
         * preference : référence de la card à mettre à jour
         * 
         * onUpdatedCard(card) : callback de card mise à jour
         */
        async function updateCardFromApi(preference, onUpdatedCard)
        {
            try {
                const { data, error } = await axios.get(API_BASEURL + 'card/getfromapi/' + preference, {}, {withCredentials: true})

                if(error) 
                {
                    console.error(error)
                    if(onUpdatedCard) onUpdatedCard(null)
                }
                else 
                {
                    var params = {
                        apicard: data,
                        detail: true,
                        forceupdate: true
                    }
                    upsertCard(params, onUpdatedCard)
                }
            }
            catch (error) 
            {
                handleApiError(error)
                if(onUpdatedCard) onUpdatedCard(null)
            }
        }

        /**
         * Mise à jour / création d'une Card en base de données, à partir d'une reponse du endpoint card de l'api
         * 
         * params.apicard : card au format api
         * params.detail : true si apicard est au format détaillé (endpoint card) ou false si format general (endpoint cards)
         *      si true, les champs additionnels comme cardSet/CardSubtypes sont accessibles
         * params.forceupdate : true pour forcer la mise à jour si la card existe déjà en base
         * 
         * onUpdatedCard(card) : callback de card mise à jour
         */
        async function upsertCard(params, onUpdatedCard)
        {
            //pcard, pdetail, pforceupdate, pcallback
            const { data: fetched, error: erreur } = await anonSupabase
                .from('Card')
                .select('detail')
                .eq('reference', params.apicard.reference);

            if(!params.forceupdate)
            {
                if(fetched && fetched.length > 0 && fetched[0].detail)
                {
                    //si la carte est déjà en base et détaillée, pas besoin de maj
                    return;
                }
                if(!params.detail && fetched && fetched.length > 0)
                {
                    //si on veut pas les détails et que l'enregistrement existe, pas besoin de maj
                    return;
                }
            }
            
            var card = {
                reference: params.apicard.reference,
                name: params.apicard.name,
                imagePath: params.apicard.imagePath,
                //cardSet: "COREKS",
                mainFaction: params.apicard.mainFaction.reference,
                cardType: params.apicard.cardType.reference,
                cardSubtypes: null,
                rarity: params.apicard.rarity.reference,
                mainCost: params.apicard.elements.MAIN_COST,
                recallCost: params.apicard.elements.RECALL_COST,
                forestPower: params.apicard.elements.FOREST_POWER,
                mountainPower: params.apicard.elements.MOUNTAIN_POWER,
                oceanPower: params.apicard.elements.OCEAN_POWER,
                main_effect: params.apicard.elements.MAIN_EFFECT,
                echo_effect: params.apicard.elements.ECHO_EFFECT,
                id: params.apicard.id,
            };

            if(params.detail) 
            {
                $.extend(card, 
                {
                    cardSet: params.apicard.cardSet.reference
                });
                if(params.apicard.cardSubTypes)
                {
                    card.cardSubtypes = [];
                    params.apicard.cardSubTypes.forEach(subtype => card.cardSubtypes.push(subtype.reference));
                }
            }

            if(card.mainCost && card.mainCost.startsWith('#')) card.mainCost = card.mainCost.replaceAll('#', '');
            if(card.recallCost && card.recallCost.startsWith('#')) card.recallCost = card.recallCost.replaceAll('#', '');
            if(card.forestPower && card.forestPower.startsWith('#')) card.forestPower = card.forestPower.replaceAll('#', '');
            if(card.mountainPower && card.mountainPower.startsWith('#')) card.mountainPower = card.mountainPower.replaceAll('#', '');
            if(card.oceanPower && card.oceanPower.startsWith('#')) card.oceanPower = card.oceanPower.replaceAll('#', '');

            if(!card.forestPower) card.forestPower = 0;
            if(!card.mountainPower) card.mountainPower = 0;
            if(!card.oceanPower) card.oceanPower = 0;
            if(!card.mainCost) card.mainCost = 0;
            if(!card.recallCost) card.recallCost = 0;

            card.mainCost = parseInt(card.mainCost);
            card.recallCost = parseInt(card.recallCost);
            card.forestPower = parseInt(card.forestPower);
            card.mountainPower = parseInt(card.mountainPower);
            card.oceanPower = parseInt(card.oceanPower);

            try {
                const { data, error } = await axios.post(API_BASEURL + '/card/update', card, {withCredentials: true})

                if(error) console.error(error)
                if(onUpdatedCard) onUpdatedCard(error ? null : data)
            }
            catch (error) 
            {
                handleApiError(error)
                if(onUpdatedCard) onUpdatedCard(null)
            }
        }

        /**
         * Mise à jour / création d'une Card en base de données, à partir d'une reponse du endpoint card de l'api
         * 
         * params.apicard : card au format api
         * params.detail : true si apicard est au format détaillé (endpoint card) ou false si format general (endpoint cards)
         *      si true, les champs additionnels comme cardSet/CardSubtypes sont accessibles
         * params.forceupdate : true pour forcer la mise à jour si la card existe déjà en base
         * 
         * onUpdatedCard(card) : callback de card mise à jour
         */
        app.config.globalProperties.g_upsertCard = function(params, onUpdatedCard)
        {
            return upsertCard(params, onUpdatedCard);
        }

        /**
         * Enregistrement des propriétés d'un deck en base de données
         * 
         * @param {*} pdeck Deck à enregistrer
         * @param {*} onSavedDeck callback de fin de traitement
         */
        async function saveProprietesDeck(pdeck, onSavedDeck)
        {
            try {
                var deck = $.extend({}, pdeck)
                delete deck.cards //pas besoni d'envoyer les cartes
                delete deck.hero //ni le hero
                const { data, error } = await axios.post(API_BASEURL + 'deck/saveprops', deck, {withCredentials: true})

                if(error) console.error(error)
                onSavedDeck(error ? null : data)
            } 
            catch (error) 
            {
                handleApiError(error)
                onSavedDeck(null)
            }
        }

        /**
         * @see #saveProprietesDeck
         */
        app.config.globalProperties.g_saveProprietesDeck = function(pdeck, onSavedDeck)
        {
            saveProprietesDeck(pdeck, onSavedDeck)
        }

        async function saveDeck(pdeck, pcallback)
        {
            try {
                const { data, error } = await axios.post(API_BASEURL + 'deck/save', {deck: pdeck}, {withCredentials: true})

                if(error) console.error(error)
                pcallback(error ? null : data)
            } 
            catch (error) 
            {
                handleApiError(error)
                pcallback(null)
            }
        }

        app.config.globalProperties.g_saveDeck = function(pdeck, pcallback)
        {
            saveDeck(pdeck, pcallback)
        }

        /**
         * pcards[] : tableau de cards dont les images sont à télécharger
         * params.onDownloadingImage(card) : callback pré-telechargement d'une carte
         * params.onDownloadedImages() : callback de fin de traitement
         * params.onUpdatedImageS3(card) : callback de fin de mise à jour de la base
         */
        async function downloadImages(pcards, onDownloadingImage, onDownloadedImages, onUpdatedImageS3)
        {
            for(let card of pcards)
            {
                if(onDownloadingImage) onDownloadingImage(card)
                downloadBlob(card, onUpdatedImageS3);
                if(pcards.length > 3) await sleep(300) //pas d'attente pour l'import de deck
            }
            if(onDownloadedImages) onDownloadedImages(pcards)
        }

        /**
         * pcard : card à télécharger à partir du S3 officiel
         * 
         * onUpdatedImageS3(card) : callback de fin de mise à jour de la base
         */
        async function downloadBlob(pcard, onUpdatedImageS3)
        {
            fetch(PROXY_BASEURL + `?url=${encodeURIComponent(pcard.imagePath)}`)
                .then(response => response.blob())
                .then(jpgBlob => 
                {
                  convertJpgToWebp(jpgBlob)
                    .then(webpBlob => 
                    {
                        uploadFile(pcard, webpBlob, onUpdatedImageS3) 
                    })
                    .catch(error => console.error('Conversion error:', error))
                })
                .catch(error => console.error('Error downloading image:', error))
        }

        /**
         * jpgBlob: Image jpg au format blob
         */
        async function convertJpgToWebp(jpgBlob)
        {
            return new Promise((resolve, reject) =>
            {
                const img = new Image()
                img.src = URL.createObjectURL(jpgBlob)
        
                img.onload = () => 
                {
                    const canvas = document.createElement('canvas')
                    canvas.width = img.width
                    canvas.height = img.height
            
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0)
            
                    canvas.toBlob(webpBlob => 
                        {
                            if (webpBlob) resolve(webpBlob)
                            else reject(new Error('Conversion to WebP failed.'))
                        },
                        'image/webp',
                        0.8 // Quality from 0 to 1 (optional)
                    )
                }
        
                img.onerror = () => {
                    reject(new Error('Failed to load JPG image.'));
                }
            })
        }

        /**
         * Upload du fichier sur le S3 de supabase
         * 
         * params.card : card à uploader
         * params.blob : contenu du fichier blob à uploader (format webp)
         * 
         * onUpdatedImageS3(card) : callback de fin de mise à jour de la base
         */
        async function uploadFile(pcard, pblob, onUpdatedImageS3) 
        {
            var v_path = "cards/";
            var v_faction = pcard.mainFaction.reference;
            if(!v_faction) v_faction = pcard.mainFaction;

            if(v_faction == "AX") v_path+= "axiom/";
            else if(v_faction == "BR") v_path+= "bravos/";
            else if(v_faction == "LY") v_path+= "lyra/";
            else if(v_faction == "MU") v_path+= "muna/";
            else if(v_faction == "OR") v_path+= "ordis/";
            else v_faction+= "yzmir/";

            v_path+= pcard.reference + '.webp';
            
            try {
                let formData = new FormData();
                let file = new File([pblob], pcard.reference + '.webp');
                formData.append('fichier', file)
                formData.append('path', v_path)

                //res.data: card
                const { error } = await axios.post(API_BASEURL + '/image/s3/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }) 
                //const { error } = await axios.post(API_BASEURL + '/image/s3/upload', apiparams, {withCredentials: true})

                if(error) console.error(error)
                else 
                {
                    //update Card.imageS3
                    updateImageS3(pcard, v_path, onUpdatedImageS3)
                }
            } 
            catch (error) 
            {
                handleApiError(error)
                onUpdatedImageS3(null)
            }
        }

        /**
         * params.card : card à mettre à jour
         * params.path : chemin S3 de supabase
         * 
         * onUpdatedImageS3(card) : callback de fin de mise à jour de la base
         */
        async function updateImageS3(pcard, ppath, onUpdatedImageS3)
        {
            try {
                //req.body: {card, path}
                const apiparams = {
                    card: pcard,
                    path: ppath
                }
                //res.data: card
                const { data, error } = await axios.post(API_BASEURL + '/image/s3', apiparams, {withCredentials: true})

                if(error) console.error(error)
                else 
                {
                    pcard.imageS3 = ppath //maj du champ car pcard est retourné dans les autres callback 
                    if(onUpdatedImageS3) onUpdatedImageS3(error ? null : data)
                }
            } 
            catch (error) 
            {
                handleApiError(error)
                if(onUpdatedImageS3) onUpdatedImageS3(null)
            }
        }
    }
}