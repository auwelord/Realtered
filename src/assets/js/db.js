
import { anonCreateClient } from '@/assets/js/supabase'
import axios from 'axios';
import Cookies from 'js-cookie';

const anonSupabase = anonCreateClient()

const bearer = null
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
        function hparams(withformdata)
        {
            var token0 = Cookies.get('sb-fyqptmokmnymednlerpj-auth-token.0')
            var token1 = Cookies.get('sb-fyqptmokmnymednlerpj-auth-token.1')

            var params = {
                withCredentials: true
            }
            params.headers = {}
            if(token0) params.headers['token0'] = token0
            if(token1) params.headers['token1'] = token1
            if(withformdata) params.headers['Content-Type'] = 'multipart/form-data'

            if(!token0 && !token1 && !withformdata) delete params.headers

            return params
        }

        function handleApiError(error)
        {
            if (error.response) {
                // Server error (status code is not in the range 2xx)
                //console.log('Error Status:', error.response.status);
                //console.log('Error Headers:', error.response.headers);
                //console.log('Error Data:', error.response.data);
          
                if (error.response.status === 404) {
                  console.error('Resource not found.');
                } else if (error.response.status === 500) {
                  console.error(error.response.statusText + ': ' + error.response.data.message);
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

        async function assignRoles(puser, pcallback)
        {
            if(!puser) return

            puser.admin = false

            try 
            {
                const { data, error: erreur } = await axios.get(API_BASEURL + '/user/admin', hparams())
                puser.admin = data && data.isadmin

                pcallback(puser)
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
                    assignRoles(data.user, pcallback)
                }
                else pcallback(data.user)
                
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
            Cookies.remove('sb-fyqptmokmnymednlerpj-auth-token.0')
            Cookies.remove('sb-fyqptmokmnymednlerpj-auth-token.1')
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
            const { data } = await anonSupabase.auth.getUser()

            //dans le deckbuiler, la recherche d'unique ne peut être combinée avec les autres recherches
            const innerFav = params.deckbuilder && params.calculatedrarity.length == 1 && params.calculatedrarity[0] == 'UNIQUE'

            const recupFav = ((!params.deckbuilder || innerFav) && data.user !== undefined)
            
            //verif de la syntaxe de params.currentName
            var req = anonSupabase
                .from('Card')
                .select('*' + (recupFav ? ', UniqueFav' + (innerFav ? '!inner' : '') + '(*)' : ''))
                .eq('mainFaction', params.currentFaction)

            if(recupFav)
            {                
                req = req.eq('UniqueFav.userId', data.user.id)
            }

            if (params.currentName) req = req.ilike('name', '%' + params.currentName + '%')
            if (params.calculatedrarity && params.calculatedrarity.length > 0) req = req.in("rarity", params.calculatedrarity)
            if (params.calculatedmaincost && params.calculatedmaincost.length > 0) req = req.in("mainCost", params.calculatedmaincost)
            if (params.calculatedrecallcost && params.calculatedrecallcost.length > 0) req = req.in("recallCost", params.calculatedrecallcost)
            if (params.calculatedforest && params.calculatedforest.length > 0) req = req.in("forestPower", params.calculatedforest)
            if (params.calculatedmountain && params.calculatedmountain.length > 0) req = req.in("mountainPower", params.calculatedmountain)
            if (params.calculatedwater && params.calculatedwater.length > 0) req = req.in("oceanPower", params.calculatedwater)
            if (params.calculatedtype && params.calculatedtype.length > 0) req = req.in("cardType", params.calculatedtype)
            if (params.currentEditions && params.currentEditions.length > 0) req = req.in("cardSet", params.currentEditions)

            if(params.capaStaticNonVide) req = req.gt('static_effect', '')
            else if(params.capaStatic) req = req.ilike('static_effect', '%' + params.capaStatic + '%')

            if(params.capaEtbNonVide) req = req.gt('etb_effect', '')
            else if(params.capaEtb) req = req.ilike('etb_effect', '%' + params.capaEtb + '%')

            if(params.capaHandNonVide) req = req.gt('hand_effect', '')
            else if(params.capaHand) req = req.ilike('hand_effect', '%' + params.capaHand + '%')

            if(params.capaReserveNonVide) req = req.gt('reserve_effect', '')
            else if(params.capaReserve) req = req.ilike('reserve_effect', '%' + params.capaReserve + '%')

            if(params.capaExhaustNonVide) req = req.gt('exhaust_effect', '')
            else  if(params.capaExhaust) req = req.ilike('exhaust_effect', '%' + params.capaExhaust + '%')

            if(params.capaSupportNonVide) req = req.gt('echo_effect', '')
            else if(params.capaSupport) req = req.ilike('echo_effect', '%' + params.capaSupport + '%')

            var streq = []
            if (params.currentSoustypes && params.currentSoustypes.length > 0)
            {
                params.currentSoustypes.forEach(st => streq.push('cardSubtypes.cs.\{' + st + '\}'))
            }
            if(streq.length > 0) req = req.or(streq.join(','))

            var keywords = []
            if(params.currentKeywords)
            {
                params.currentKeywords.forEach(kw => {
                    var label = app.config.globalProperties.g_getKeywordLabel(kw);
                    keywords.push('main_effect.ilike.%' + label + '%,echo_effect.ilike.%' + label + '%')
                });
            }
            if(keywords.length > 0) req = req.or(keywords.join(','))

            if(params.currentSort)
            {
                params.currentSort.forEach(sortref => {
                    var tab = sortref.split(',')
                    req = req.order(tab[0] == 'translations.name' ? 'name' : tab[0], { ascending: tab.length == 1 })
                });      
            }
            
            req = req.range((params.currentPage - 1) * params.itemsPerPage, (params.currentPage * params.itemsPerPage) )

            try {
                const { data: cards, error } = await req

                if(!error && recupFav)
                {
                    cards.forEach(card => 
                    {
                        card.favori = app.config.globalProperties.g_isUnique(card) && card.UniqueFav.length > 0
                        delete card.UniqueFav
                    })
                }

                if(error) console.error(error)
                pcallback(cards)
            }
            catch(error)
            {
                console.error(error)
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

            if(params.withfavs) {
                for(let deck of decks)
                {
                    deck.favori = deck.DeckFav.length > 0
                    delete deck.DeckFav
                }
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
            if(params.withcards) select += ', CardsDeck(*), hero:Card!Deck_hero_id_fkey(*)'
            else if(params.withhero) select += ', hero:Card!Deck_hero_id_fkey(*)'

            if(params.withfavs) select += ', DeckFav' + (params.favonly ? '!inner' : '') + '(*)'

            var req = anonSupabase
                .from('Deck')
                .select(select)
                .order('modifiedAt', {ascending : false});

            if(params.faction) req = req.eq('main_faction', params.faction)
            if(params.hero) req = req.eq('hero_id', params.hero)
            if(params.mainonly) req = req.eq('refid', 0)

            const dataUser = await anonSupabase.auth.getUser()
            const user = dataUser.data.user
                
            if(params.myonly)
            {
                if(!user)
                {
                    if(params.callback) params.callback([])
                    return
                }
                req = req.eq('userId', user.id);
            }
            else
            {            
                //on veut tous les decks
                //utilisateur non connecté : on recupere que les decks publics
                if(!user)
                {
                    req = req.eq('public', true);
                }
                else
                {
                    //utilisateur connecté : on recupere tous les decks publics + mes decks
                    req = req.or('public.eq.TRUE,userId.eq.' + user.id);
                }
            }

            if(params.refid)
            {
                req = req.or('id.eq.' + params.refid + ',refid.eq.' + params.refid);
            }

            if(user && params.withfavs)
            {
                req = req.eq('DeckFav.userId', user.id);
            }
            runFetchDecks(req, [], params);
        }

        app.config.globalProperties.g_fetchDecks = function(params)
        {
            fetchDecks(params)
        }

        async function fetchDeck(params, pcallback)
        {
            const versions = []
            
            if(params.withversions)
            {
                //récup de la dernière version du deck
                const {data, error} = await anonSupabase
                    .from('Deck')
                    .select()
                    .eq('id', params.id)
                if(data.length > 0)
                {
                    const prefid = data[0].refid > 0 ? data[0].refid : data[0].id

                    const {data: vrsdecks, error} = await anonSupabase
                        .from('Deck')
                        .select()
                        .eq('refid', prefid)
                        .order('version', { ascending: false })

                    if(vrsdecks.length > 0)
                    {
                        //on change l'id à récupérer pour la dernière version
                        if(params.lastversion) params.id = vrsdecks[0].id
                        else if (params.version > 1)
                        {
                            params.id = vrsdecks.find(vrsdeck => vrsdeck.version == params.version).id
                        }

                        vrsdecks.forEach(vrsdeck => versions.push(vrsdeck.version))
                    }
                }
            }
            versions.push(1)
            
            var req = anonSupabase.from('Deck');
            if(params.withcards)
            {
                var select = '*, CardsDeck(*), hero:Card!Deck_hero_id_fkey(*)'
                if(params.withfavs) select += ', DeckFav(*)'

                req = req.select(select)
            }
            req = req.eq('id', params.id)

            if(params.withfavs)
            {
                const dataUser = await anonSupabase.auth.getUser()
                if(dataUser.user) req = req.eq('DeckFav.userId', dataUser.user.id);
            }
            
            const { data } = await req;

            var found = data && data.length > 0;
            if(found)
            {
                var zedeck = $.extend(data[0], {cards: []});

                if(params.withversions) zedeck.versions = versions
                
                if(params.withfavs) 
                {
                    zedeck.favori = (zedeck.DeckFav.length > 0)
                    delete zedeck.DeckFav
                }

                if(params.withcards && data[0].CardsDeck)
                {
                    var refs = data[0].CardsDeck.map(card => card.cardRef);
                                        
                    req = await anonSupabase
                        .from('Card')
                        .select()
                        .in('reference', refs);

                    req.data.forEach(card => 
                    {
                        var realcardeck = data[0].CardsDeck.find(carddeck => carddeck.cardRef == card.reference)
                        zedeck.cards.push($.extend(card, {quantite: realcardeck.quantity}));
                    });
                }
                
                if(params.withcards) delete zedeck.CardsDeck

                pcallback(zedeck);                
            }
            else pcallback(null);
        }

        app.config.globalProperties.g_fetchDeck = function(params, pcallback)
        {
            fetchDeck(params, pcallback)
        }

        async function fetchVersionnedDeck(prefdeckid, pcallback)
        {
            const params = {
                callback: pcallback,
                withcards: true,
                withfavs: false,
                mainonly: false,
                refid: prefdeckid,
            }
            
            fetchDecks(params)
        }

        app.config.globalProperties.g_fetchVersionnedDeck = function(prefdeckid, pcallback)
        {
            fetchVersionnedDeck(prefdeckid, pcallback)
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
        function importerUniques(preferences, paddfavorite, onDownloadingImage, onDownloadedImages, onUpdatedImageS)
        {
            for(let ref of preferences)
            {
                importerUnique(ref, paddfavorite, onDownloadingImage, onDownloadedImages, onUpdatedImageS)
            }
        }

        /**
         * reference : référence de l'unique à importer
         * 
         * onDownloadingImage(card) : callback pré-telechargement d'une carte
         * onDownloadedImages() : callback de fin de traitement
         * onUpdatedImageS3(card) : callback de fin de mise à jour de la base
        */
        function importerUnique(preference, paddfavorite, onDownloadingImage, onDownloadedImages, onUpdatedImageS3)
        {
            if(!preference)
            {
                return
            }

            var onUpdatedCard = (pcard, palreadyexists) => 
            {
                //si la carte n'est pas unique => ras
                if(app.config.globalProperties.g_isUnique(pcard))
                {
                    if(palreadyexists)
                    {
                        //on appelle le trigger de fin
                        if(onUpdatedImageS3) onUpdatedImageS3(pcard, palreadyexists)
                    }
                    else downloadImages([pcard], onDownloadingImage, onDownloadedImages, onUpdatedImageS3);
                }
            }

            var onFetchedCard = pcard => 
            {
                //si la carte a ete trouvé => ras
                if(!pcard)
                {
                    updateCardFromApi(preference, paddfavorite, onUpdatedCard)
                }
                else onUpdatedCard(pcard, true)
            }

            fetchCard(preference, onFetchedCard)
        }

        async function deleteDeck(pdeckid, pcallback)
        {
            try {
                const { data, error } = await axios.get(API_BASEURL + '/deck/delete/' + pdeckid, hparams())

                if(error) console.error(error)
                pcallback(error ? null : data);
            }
            catch (error) 
            {
                handleApiError(error)
                pcallback(null);
            }
        }

        app.config.globalProperties.g_deleteDeck = function(pdeckid, pcallback)
        {
            deleteDeck(pdeckid, pcallback)
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
            var deck = params.deck ? $.extend({}, params.deck) : {
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
                delete deck.DeckFav
                delete deck.favori
            }

            var saveddeck;
            try {
                const { data, error } = await axios.post(API_BASEURL + '/deck/new', deck, hparams())

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
                            const { data, error } = await axios.post(API_BASEURL + '/deck/update', saveddeck, hparams())
            
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
                    importerUniques(uniques, true,
                        //onDownloadingImage
                        ppcard => console.log("Téléchargement de " + ppcard.imagePath),
                        //onDownloadedImage
                        null,
                        //onUpdatedImageS3
                        (ppcard, palreadyexists) => 
                        {
                            if(!palreadyexists) console.log("Upload de " + ppcard.imageS3)
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
                const { data, error } = await axios.post(API_BASEURL + '/cardsdeck/set', pcards, hparams())

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
        app.config.globalProperties.g_updateCardFromApi = function(preference, paddfavorite, onUpdatedCard)
        {
            updateCardFromApi(preference, paddfavorite, onUpdatedCard)
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

                updateCardFromApi(card.reference, false, onUpdatedCard);

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
        async function updateCardFromApi(preference, paddfavorite, onUpdatedCard)
        {
            try {
                const { data, error } = await axios.get(API_BASEURL + '/card/getfromapi/' + preference, hparams())

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
                        forceupdate: true,
                        addfavorite: paddfavorite,
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
                etb_effect: '',
                hand_effect: '',
                reserve_effect: '',
                static_effect: '',
                exhaust_effect: '',
            }

            if(card.main_effect)
            {
                //extraction par type de trigger
                var effects = card.main_effect
                    .replaceAll('\#', '')
                    .split('  ') //séparateur = double espace

                for(let effect of effects)
                {
                    if(effect.startsWith('{J}'))
                    {
                        card.etb_effect += (card.etb_effect ? '  ' : '') + effect
                    }
                    else if(effect.startsWith('{H}'))
                    {
                        card.hand_effect += (card.hand_effect ? '  ' : '') + effect
                    }
                    else if(effect.startsWith('{R}'))
                    {
                        card.reserve_effect += (card.reserve_effect ? '  ' : '') + effect
                    }
                    else
                    {
                        //pour l'exhaust, il peut y avaoit un cout et le symbole n'est pas en première position
                        if(effect.startsWith('{T}'))
                            card.exhaust_effect += (card.exhaust_effect ? '  ' : '') + effect
                        else
                        {
                            var tab = effect.split(':')
                            if(tab.length > 1 && tab[0].includes('{T}'))
                                card.exhaust_effect += (card.exhaust_effect ? '  ' : '') + effect
                            else  
                                card.static_effect +=  (card.static_effect ? '  ' : '') + effect
                        }                        
                    }
                }
            }

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
                const { data, error } = await axios.post(API_BASEURL + '/card/update', card, hparams())

                if(error) console.error(error)
                else if(params.addfavorite && app.config.globalProperties.g_isUnique(card))
                {
                    addCardFavori(card)
                }
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
                const { data, error } = await axios.post(API_BASEURL + '/deck/saveprops', deck, hparams())

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
                const { data, error } = await axios.post(API_BASEURL + '/deck/save', {deck: pdeck}, hparams())

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
                const { error } = await axios.post(API_BASEURL + '/image/s3/upload', formData, hparams(true)) 

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
                const { data, error } = await axios.post(API_BASEURL + '/image/s3', apiparams, hparams())

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

        app.config.globalProperties.g_isBearer = function()
        {
            return bearer != null
        }

        async function fetchCardsFromApi (params, pcallback)
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
    
            var headers = hparams()

            if (bearer) {
                $.extend(headers, { 'Authorization': "Bearer " + bearer });
            }
    
            try {
                const { data, error } = await axios.post(API_BASEURL + '/cards/getfromapi/', apiparams, {headers: headers})

                if(error) 
                {
                    console.error(error)
                    pcallback([], false)
                }
                else 
                {
                    var hasMore = data["hydra:view"]["hydra:next"] != undefined
                    var pcards = data["hydra:member"]

                    pcallback(pcards, hasMore)
                }
            }
            catch (error) 
            {
                handleApiError(error)
                pcallback([], false)
            }               
        }

        app.config.globalProperties.gaa_fetchCards = function(params, pcallback)
        {
            fetchCardsFromApi(params, pcallback)
        }

        app.config.globalProperties.gaa_fetchDeck = function(pid, pcallback)
        {
            fetchDeckFromApi(pid, pcallback)
        }

        async function fetchDeckFromApi (pid, pcallback)
        {
            try 
            {
                const { data, error } = await axios.get(API_BASEURL + '/deck/getfromapi/' + pid, hparams())
                
                if(error) console.error(error)
                pcallback(error ? null : data)
            }
            catch(error)
            {
                handleApiError(error)
                pcallback(null)
            }
            
        }

        async function toggleDeckFavori(pdeck, pcallback)
        {
            try 
            {
                const { data, error } = await axios.get(API_BASEURL + '/deck/favori/' + pdeck.id, hparams())
                
                if(error) console.error(error)
                pcallback(!error && data.favori)
            }
            catch(error)
            {
                handleApiError(error)
                pcallback(null)
            }
        }

        app.config.globalProperties.g_toggleDeckFavori = function(pdeck, pcallback)
        {
            toggleDeckFavori(pdeck, pcallback)
        }

        async function createVersion(pdeck, pcallback)
        {
            try 
            {
                const { data, error } = await axios.post(API_BASEURL + '/deck/newversion', pdeck ,hparams())
                
                if(error) console.error(error)
                pcallback(data)
            }
            catch(error)
            {
                handleApiError(error)
                pcallback(null)
            }
        }

        app.config.globalProperties.g_createVersion = function(pdeck, pcallback)
        {
            createVersion(pdeck, pcallback)
        }

        async function deleteVersion(pdeck, pcallback)
        {
            try 
            {
                const { data, error } = await axios.post(API_BASEURL + '/deck/deleteversion', pdeck ,hparams())
                
                if(error) console.error(error)
                pcallback(error ? 1 : data)
            }
            catch(error)
            {
                handleApiError(error)
                pcallback(1)
            }
        }

        app.config.globalProperties.g_deleteVersion = function(pdeck, pcallback)
        {
            deleteVersion(pdeck, pcallback)
        }  

        async function toggleCardFavori(pcard, pcallback)
        {
            try 
            {
                const { data, error } = await axios.get(API_BASEURL + '/card/favori/' + pcard.reference, hparams())
                
                if(error) console.error(error)
                else pcard.favori = data.favori

                pcallback(pcard, error)
            }
            catch(error)
            {
                handleApiError(error)
                pcallback(pcard, error)
            }
        }

        app.config.globalProperties.g_toggleCardFavori = function(pcard, pcallback)
        {
            toggleCardFavori(pcard, pcallback)
        }

        async function addCardFavori(pcard)
        {
            try 
            {
                const { data, error } = await axios.get(API_BASEURL + '/card/addfavori/' + pcard.reference, hparams())
                
                if(error) console.error(error)
                pcard.favori = error === undefined && data.favori
            }
            catch(error)
            {
                handleApiError(error)
            }
        }
    }
}