
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
          
                if (error.response.status === 404) 
                {
                  console.error('Resource not found.');
                }
                else console.error(error.response.statusText + ': ' + error.response.data.message);
            } 
            else if (error.request) 
            {
                // No response received
                console.error('Error: No response received from server:', error.request);
            }
            else 
            {
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
                    data.user.admin = false
                    pcallback(data.user) //appel du callback pour ne pas attendre la récup des roles

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
        
        app.config.globalProperties.g_getPreviewArticle = function(purl, pcallback)
        {
            getPreviewArticle(purl, pcallback)
        }

        async function getPreviewArticle(purl, pcallback)
        {
            if(purl) try 
            {
                var headparams = hparams()
                headparams.params = {url: purl}
                const { data, error } = await axios.get(API_BASEURL + '/tools/previewarticle', headparams)

                pcallback(data)
                return
            } catch (error) {
                console.error("Error fetching URL preview:", error);
            }
            pcallback(null)
        }

        async function fetchCardsFromDatabase(params, pcallback)
        {
            const { data } = await anonSupabase.auth.getUser()

            //dans le deckbuiler, la recherche d'unique ne peut être combinée avec les autres recherches
            const innerFav = params.deckbuilder && params.calculatedrarity.length == 1 && params.calculatedrarity[0] == 'UNIQUE'

            const recupFav = ((!params.deckbuilder || innerFav) && data.user !== undefined)
            const recupCollec = (data.user !== undefined)

            var effectPrefix = ''

            var select = '*' + (recupFav ? ', UniqueFav' + (innerFav ? '!inner' : '') + '(*)' : '')
            
            if(!isLocaleFrench())
            {
                select += ', CardTrad(*)'
                effectPrefix = 'CardTrad.'
            }
            if(recupCollec)
            {
                select += ', Collection(*)'
            }

            var req = anonSupabase
                .from('Card')
                .select(select)
                .eq('mainFaction', params.currentFaction)

            if(recupFav)
            {                
                req = req.eq('UniqueFav.userId', data.user.id)
            }
            if(!isLocaleFrench())
            {
                req = req.eq('CardTrad.locale', getLocale())
            }
            if(recupCollec)
            {
                req = req.eq('Collection.userId', data.user.id)
            }

            if (params.currentName) req = req.ilike(effectPrefix + 'name', '%' + params.currentName + '%')
            if (params.calculatedrarity && params.calculatedrarity.length > 0) req = req.in("rarity", params.calculatedrarity)
            if (params.calculatedmaincost && params.calculatedmaincost.length > 0) req = req.in("mainCost", params.calculatedmaincost)
            if (params.calculatedrecallcost && params.calculatedrecallcost.length > 0) req = req.in("recallCost", params.calculatedrecallcost)
            if (params.calculatedforest && params.calculatedforest.length > 0) req = req.in("forestPower", params.calculatedforest)
            if (params.calculatedmountain && params.calculatedmountain.length > 0) req = req.in("mountainPower", params.calculatedmountain)
            if (params.calculatedwater && params.calculatedwater.length > 0) req = req.in("oceanPower", params.calculatedwater)
            if (params.calculatedtype && params.calculatedtype.length > 0) req = req.in("cardType", params.calculatedtype)
            if (params.currentEditions && params.currentEditions.length > 0) req = req.in("cardSet", params.currentEditions)

            if(params.capaStaticNonVide) req = req.gt(effectPrefix + 'static_effect', '')
            else if(params.capaStatic) req = req.ilike(effectPrefix + 'static_effect', '%' + params.capaStatic + '%')

            if(params.capaEtbNonVide) req = req.gt(effectPrefix + 'etb_effect', '')
            else if(params.capaEtb) req = req.ilike(effectPrefix + 'etb_effect', '%' + params.capaEtb + '%')

            if(params.capaHandNonVide) req = req.gt(effectPrefix + 'hand_effect', '')
            else if(params.capaHand) req = req.ilike(effectPrefix + 'hand_effect', '%' + params.capaHand + '%')

            if(params.capaReserveNonVide) req = req.gt(effectPrefix + 'reserve_effect', '')
            else if(params.capaReserve) req = req.ilike(effectPrefix + 'reserve_effect', '%' + params.capaReserve + '%')

            if(params.capaExhaustNonVide) req = req.gt(effectPrefix + 'exhaust_effect', '')
            else  if(params.capaExhaust) req = req.ilike(effectPrefix + 'exhaust_effect', '%' + params.capaExhaust + '%')

            if(params.capaSupportNonVide) req = req.gt(effectPrefix + 'echo_effect', '')
            else if(params.capaSupport) req = req.ilike(effectPrefix + 'echo_effect', '%' + params.capaSupport + '%')

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
                    keywords.push(effectPrefix + 'main_effect.ilike.%' + label + '%,' + effectPrefix + 'echo_effect.ilike.%' + label + '%')
                });
            }
            if(keywords.length > 0) req = req.or(keywords.join(','))

            if(params.currentSort)
            {
                params.currentSort.forEach(sortref => {
                    var tab = sortref.split(',')
                    req = req.order(tab[0] == 'translations.name' ? effectPrefix + 'name' : tab[0], { ascending: tab.length == 1 })
                }); 
                req = req.order('reference')  //permet d'avoir toujours le meme tri pour les doublons potentiels selon le tri   
            }
            
            const rangemin = (params.currentPage - 1) * params.itemsPerPage
            const rangemax = (params.currentPage * params.itemsPerPage)

            req = req.range(rangemin, rangemax)

            var hasMore = false
            try {
                const { data: cards, error } = await req

                hasMore = !error && cards.length > params.itemsPerPage
                if(hasMore)
                {
                    cards.pop(); //on vire le dernier élément qui ne sert qu'à savoir si il y a d'autres cartes à fetch
                }

                if(!error && recupFav)
                {
                    cards.forEach(card => 
                    {
                        card.favori = app.config.globalProperties.g_isUnique(card) && card.UniqueFav.length > 0
                        delete card.UniqueFav

                        card.inMyCollection = recupCollec && card.Collection.length > 0 ? card.Collection[0].inMyCollection : 0
                        card.inMyTradelist = recupCollec && card.Collection.length > 0 ? card.Collection[0].inMyTradelist : 0
                        card.inMyWantlist = recupCollec && card.Collection.length > 0 ? card.Collection[0].inMyWantlist : 0
                        card.foiled = recupCollec && card.Collection.length > 0 && card.Collection[0].foiled

                        if(recupCollec) delete card.Collection
                        fusionnerTrad(card)
                    })
                }

                if(error) console.error(error)
                pcallback(cards, hasMore)
            }
            catch(error)
            {
                console.error(error)
                pcallback([], false)
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
                        var select = '*' + (isLocaleFrench() ? '' : ', CardTrad!inner(*)')                    

                        var req = anonSupabase
                            .from('Card')
                            .select(select)
                            .in('reference', refs)
                            .order('cardType')
                            .order('mainCost')
                            .order('recallCost')
                            .order('name');

                        if(!isLocaleFrench()) req = req.eq('CardTrad.locale', getLocale())
                        const {data: datacard, error: errorcard} = await req;

                        if(errorcard)
                        {
                            console.log(errorcard)
                        }
                        else datacard.forEach(card => 
                        {
                            var realcardeck = deck.CardsDeck.find(carddeck => carddeck.cardRef == card.reference)
    
                            $.extend(card, {quantite: realcardeck.quantity})
                            
                            fusionnerTrad(card)
    
                            deck.cards.push(card);
                        })
                        delete deck.CardsDeck
                    }
                }
            }

            if(params.callback) params.callback(decks ? decks : pdftval);
        }

        async function fetchDecks(params)
        {
            if(params.tournois)
            {
                params.myonly = false
                params.favonly = false
            }

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
                
            if(params.tournois)
            {
                req = req.is('userId', null);
            }
            else 
            {
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
                    //on veut tous les decks non tournoi
                    req = req.not('userId', 'is', null)
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
            
            const { data: decks } = await req;

            if(!decks || decks.length == 0)
            {
                pcallback(null)
                return
            }

            const deck = decks[0]
            var zedeck = $.extend(deck, {cards: []});

            if(params.withversions) zedeck.versions = versions
            
            if(params.withfavs) 
            {
                zedeck.favori = (zedeck.DeckFav.length > 0)
                delete zedeck.DeckFav
            }

            if(params.withcards && deck.CardsDeck)
            {
                var refs = deck.CardsDeck.map(card => card.cardRef);
                var selectCard = '*' + (!isLocaleFrench() ? ', CardTrad!inner(*)' : '')

                req = anonSupabase
                    .from('Card')
                    .select(selectCard)
                    .in('reference', refs);

                if(!isLocaleFrench()) req = req.eq('CardTrad.locale', getLocale())
                const {data: datacard, error: errorcard} = await req;

                if(errorcard)
                {
                    console.log(errorcard)
                }
                else datacard.forEach(card => 
                {
                    var realcardeck = deck.CardsDeck.find(carddeck => carddeck.cardRef == card.reference)

                    $.extend(card, {quantite: realcardeck.quantity})
                    
                    fusionnerTrad(card)

                    zedeck.cards.push(card);
                })
            }
            
            if(params.withcards) delete zedeck.CardsDeck

            pcallback(zedeck);                
        }
        
        function fusionnerTrad(pcard, pcardtrad)
        {
            if(!pcard) return

            var cardtrad = pcardtrad
            if(!cardtrad) cardtrad = pcard.CardTrad
            
            if(!cardtrad || !(cardtrad instanceof Array)) return

            pcard.name = cardtrad[0].name
            pcard.imagePath = cardtrad[0].imagePath
            pcard.imageS3 = cardtrad[0].imageS3
            pcard.main_effect = cardtrad[0].main_effect
            pcard.reserve_effect = cardtrad[0].reserve_effect
            pcard.static_effect = cardtrad[0].static_effect
            pcard.echo_effect = cardtrad[0].echo_effect
            pcard.etb_effect = cardtrad[0].etb_effect
            pcard.hand_effect = cardtrad[0].hand_effect
            pcard.exhaust_effect = cardtrad[0].exhaust_effect

            delete pcard.CardTrad
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

        async function fetchTournois(params, pcallback)
        {
            var req = anonSupabase
                .from('Tournoi')
                .select()
            if(params.tournoiid)
            {
                req = req.eq('id', params.tournoiid)
            }
            
            const {data, error} = await req.order('dates', { ascending: false})
            pcallback(data)
        }

        app.config.globalProperties.g_fetchTournois = function(params, pcallback)
        {
            fetchTournois(params, pcallback)
        }

        async function saveTournoi(ptournoi, pcallback)
        {
            try 
            {
                const { data, error } = await axios.post(API_BASEURL + '/tournoi/save', ptournoi ,hparams())
                
                if(error) console.error(error)
                pcallback(error ? null : data.tournoi)
            }
            catch(error)
            {
                handleApiError(error)
                pcallback(null)
            }
        }

        app.config.globalProperties.g_saveTournoi = function(ptournoi, pcallback)
        {
            saveTournoi(ptournoi, pcallback)
        }

        async function fetchDecksTournoi(ptournoi, pcallback)
        {
            const {data, error} = await anonSupabase
                    .from('Deck')
                    .select('*, hero:Card!Deck_hero_id_fkey(*)')
                    .eq('tournoiId', ptournoi.id)
                    .eq('public', true)
                    .order('tournoiPos')

            pcallback(data)
        }

        app.config.globalProperties.g_fetchDecksTournoi = function(ptournoi, pcallback)
        {
            fetchDecksTournoi(ptournoi, pcallback)
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

        function getLocale()
        {
            return app.config.globalProperties.g_getLocale()
        }
        function isLocaleFrench()
        {
            return app.config.globalProperties.g_isLocaleFrench()
        }
        /**
         * preference : référence de la card à rechercher en base
         * 
         * onFetchedCard(card) : callback de card trouvée en base
         */
        async function fetchCard(preference, onFetchedCard)
        {
            var select = '*' + (isLocaleFrench() ? '' : ', CardTrad!inner(*)')

            var req = anonSupabase
                .from('Card')
                .select(select)
                .eq('reference', preference)

            if(!isLocaleFrench()) req = req.eq('CardTrad.locale', getLocale())

            const { data: cards, error: erreur } = await req

            var card = cards != null && cards.length > 0 ? cards[0] : null
            fusionnerTrad(card)

            if(onFetchedCard) onFetchedCard(card);
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
                .select('*' + (isLocaleFrench() ? '' : ', CardTrad!inner(*)'))
                .eq('cardSet', 'COREKS')
                .eq('cardType', 'HERO');

            if(params.faction) req = req.eq('mainFaction', params.faction)
            if(!isLocaleFrench()) req = req.eq('CardTrad.locale', getLocale())

            const { data: heroes, erreur } = await req;

            if(heroes) heroes.forEach(hero => fusionnerTrad(hero))
            
            if(erreur) console.error(erreur)

            params.callback(heroes)
        }

        app.config.globalProperties.g_fetchHeroes = function(params)
        {
            fetchHeroes(params)
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
        app.config.globalProperties.g_downloadImages = function(pcards, pforcedlocale, onDownloadingImage, onDownloadedImages, onUpdatedImageS3)
        {
            downloadImages(pcards, pforcedlocale, onDownloadingImage, onDownloadedImages, onUpdatedImageS3);
        }

        /**
         * preferences[] : liste des référence des uniques à importer
         * 
         * onDownloadingImage(card) : callback pré-telechargement d'une carte
         * onDownloadedImages() : callback de fin de traitement
         * onUpdatedImageS3(card) : callback de fin de mise à jour de la base
        */
        function importerUniques(preferences, paddfavorite, onDownloadingImage, onDownloadedImages, onUpdatedImageS3)
        {
            for(let ref of preferences)
            {
                importerUnique(ref, paddfavorite, onDownloadingImage, onDownloadedImages, onUpdatedImageS3)
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

            var onUpdatedCard = (pcard, palreadyexists, pforcedlocale) => 
            {
                //si la carte n'est pas unique => ras
                if(app.config.globalProperties.g_isUnique(pcard))
                {
                    downloadImages([pcard], pforcedlocale, onDownloadingImage, onDownloadedImages, onUpdatedImageS3);
                }
                else if(onUpdatedImageS3) onUpdatedImageS3(pcard, false, preference, pforcedlocale)
            }

            var onFetchedCard = pcard => 
            {
                //si la carte a ete trouvé => ras
                if(!pcard)
                {
                    updateCardFromApi(preference, paddfavorite, onUpdatedCard)
                }
                else onUpdatedCard(pcard, true, null)
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
            deck.version = 1 //dans tous les cas sur un import on repart sur une première version

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
            else
            {
                deck.tournoiId = params.tournoi
                deck.idaltered = params.idaltered
                if(deck.tournoiId)
                {
                    deck.tournoiPos = params.postournoi
                    deck.userId = null
                }
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

            var cardsRefs;
            if(params.deck) 
            {
                cardsRefs = tmpcards.map(pcard => 
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
                cardsRefs = tmpcards.map(pcard => 
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
            if(cardsRefs.length > 0 && !params.deck)
            {
                var refs = cardsRefs.map(pcard => pcard.cardRef);

                //NB: ici pas besoin de la trad, on veut juste recup le hero pour avoir la faction
                var req = anonSupabase
                    .from('Card' )
                    .select()
                    .in('reference', refs)

                const { data: cardlist, error } = await req;

                if(!error && cardlist.length > 0)
                {
                    var hero = app.config.globalProperties.g_getCardsOfTypeHeroDecklist(cardlist);
                    if(hero && hero.length > 0)
                    {
                        saveddeck.main_faction = hero[0].mainFaction;
                        saveddeck.hero_id = hero[0].reference;

                        try {
                            const { dataUpdated, error } = await axios.post(API_BASEURL + '/deck/update', saveddeck, hparams())
            
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
                var uniques = cardsRefs
                    .filter(pcard => app.config.globalProperties.g_isUniqueFromReference(pcard.cardRef))
                    .map(pcard => pcard.cardRef)

                if(uniques.length > 0)
                {
                    importingUniques = true
                    var cptUniques = 0
                    var faileduniques = []
                    importerUniques(uniques, params.setuniquefav,
                        //onDownloadingImage
                        ppcard => console.log("Téléchargement de " + ppcard.imagePath),
                        //onDownloadedImage
                        null,
                        //onUpdatedImageS3
                        (ppcard, palreadyexists, pref, pforcedlocale) => 
                        {
                            if(ppcard && !palreadyexists) console.log("Upload de " + ppcard.imageS3)
                            else if(!ppcard && !palreadyexists)
                            {
                                if(!pforcedlocale) faileduniques.push(pref)
                                console.log("Echec de l'import de l'unique : " + pref)
                            }
                            if(!pforcedlocale) 
                            {
                                cptUniques++
                                if(cptUniques == uniques.length)
                                {
                                    if(faileduniques.length > 0)
                                    {
                                        cardsRefs = cardsRefs.filter(pcard => !faileduniques.find(ppref => ppref == pcard.cardRef))
                                    }
                                    runSetCardsDecks(saveddeck, cardsRefs, onImportedDeck, faileduniques)
                                }
                            }
                        }
                    )
                }
            }

            if(!importingUniques) runSetCardsDecks(saveddeck, cardsRefs, onImportedDeck)
        }

        async function runSetCardsDecks(pdeck, pcardsRefs, onImportedDeck, pfaileduniques)
        {
            try {
                const { data, error } = await axios.post(API_BASEURL + '/cardsdeck/set', pcardsRefs, hparams())

                if(error) console.error(error)
                onImportedDeck(error ? null : pdeck, pfaileduniques);
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
            //si la locale n'est pas fr, vérifier la présence de la carte en fr avant de mettre à jour
            //si la carte n'existe pas, il faut la créer
            if(!isLocaleFrench())
            {
                const { data: cardsfr } = await anonSupabase
                    .from('Card')
                    .select('reference')
                    .eq('reference', preference)

                if(cardsfr == null || cardsfr.length == 0) 
                {
                    _updateCardFromApi(preference, paddfavorite, 'fr', onUpdatedCard, () => {
                        _updateCardFromApi(preference, false, null, onUpdatedCard)
                    })
                    return
                }
            }

            if(!isLocaleFrench())
            {
                //ici la carte est en anglais mais la fr existe : on la met juste à jour
                _updateCardFromApi(preference, paddfavorite, null, onUpdatedCard)
                return
            }

            //carte en français, on la met à jour, puis on vérifie si l'anglais existe
            _updateCardFromApi(preference, paddfavorite, null, onUpdatedCard, () => 
            {
                fetchEnglishCard(preference, pcard => 
                {
                    if(!pcard) _updateCardFromApi(preference, paddfavorite, 'en', onUpdatedCard)
                })
            })          
        }

        async function fetchEnglishCard(preference, pcallback)
        {
            const { data: cards } = await anonSupabase
                .from('CardTrad')
                .select('reference')
                .eq('reference', preference)
                .eq('locale', 'en')

            pcallback(cards && cards.length > 0 ? cards[0] : null)
        }

        async function _updateCardFromApi(preference, paddfavorite, pforcedlocale, onUpdatedCard, pthen)
        {
            try {
                const zelocale = pforcedlocale ? pforcedlocale : getLocale()
                const apiparams = {
                    locale: getFormattedLocale(zelocale)
                }

                const { data, error } = await axios.post(API_BASEURL + '/card/getfromapi/' + preference, apiparams, hparams())

                if(error) 
                {
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
                    upsertCard(params, pforcedlocale, onUpdatedCard, pthen)
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
        async function upsertCard(params, pforcedlocale, onUpdatedCard, pthen)
        {
            //pcard, pdetail, pforceupdate, pcallback
            const { data: fetched, error: erreur } = await anonSupabase
                .from('Card')
                .select('detail')
                .eq('reference', params.apicard.reference)

            if(!params.forceupdate)
            {
                const hasresult = fetched != null && fetched.length > 0
                if(hasresult && fetched[0].detail)
                {
                    //si la carte est déjà en base et détaillée, pas besoin de maj
                    return;
                }
                if(!params.detail && hasresult)
                {
                    //si on veut pas les détails et que l'enregistrement existe, pas besoin de maj
                    return;
                }
            }

            var card = {
                reference: params.apicard.reference,
                name: params.apicard.name,
                imagePath: params.apicard.allImagePath['fr-fr'],
                imageLocale: params.apicard.allImagePath[pforcedlocale ? getFormattedLocale(pforcedlocale) : getFormattedLocale()],
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

            card.locale = pforcedlocale ? pforcedlocale : getLocale()

            try {
                const { data, error } = await axios.post(API_BASEURL + '/card/update', card, hparams())

                if(error) console.error(error)
                else if(params.addfavorite && app.config.globalProperties.g_isUnique(card))
                {
                    addCardFavori(card)
                }
                if(onUpdatedCard) onUpdatedCard(error ? null : data, true, pforcedlocale)
                if(pthen) pthen()
            }
            catch (error) 
            {
                handleApiError(error)
                if(onUpdatedCard) onUpdatedCard(null, true, pforcedlocale)
                if(pthen) pthen()
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
            return upsertCard(params, null, onUpdatedCard);
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
        async function downloadImages(pcards, pforcedlocale, onDownloadingImage, onDownloadedImages, onUpdatedImageS3)
        {
            for(let card of pcards)
            {
                if(onDownloadingImage) onDownloadingImage(card)
                downloadBlob(card, pforcedlocale, onUpdatedImageS3);
                if(pcards.length > 3) await sleep(300) //pas d'attente pour l'import de deck
            }
            if(onDownloadedImages) onDownloadedImages(pcards)
        }

        /**
         * pcard : card à télécharger à partir du S3 officiel
         * 
         * onUpdatedImageS3(card) : callback de fin de mise à jour de la base
         */
        async function downloadBlob(pcard, pforcedlocale, onUpdatedImageS3)
        {
            fetch(PROXY_BASEURL + `?url=${encodeURIComponent(pcard.imagePath)}`)
                .then(response => response.blob())
                .then(jpgBlob => 
                {
                  convertJpgToWebp(jpgBlob)
                    .then(webpBlob => 
                    {
                        uploadFile(pcard, webpBlob, pforcedlocale, onUpdatedImageS3) 
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
        async function uploadFile(pcard, pblob, pforcedlocale, onUpdatedImageS3) 
        {
            var locale = pforcedlocale ? pforcedlocale : getLocale()

            var v_path = "cards/";
            var v_faction = pcard.mainFaction.reference;
            if(!v_faction) v_faction = pcard.mainFaction;

            if(v_faction == "AX") v_path+= "axiom/";
            else if(v_faction == "BR") v_path+= "bravos/";
            else if(v_faction == "LY") v_path+= "lyra/";
            else if(v_faction == "MU") v_path+= "muna/";
            else if(v_faction == "OR") v_path+= "ordis/";
            else v_faction+= "yzmir/";

            if(locale != 'fr')
            {
                v_path+= locale + "/"
            }
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
                    updateImageS3(pcard, v_path, pforcedlocale, onUpdatedImageS3)
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
        async function updateImageS3(pcard, ppath, pforcedlocale, onUpdatedImageS3)
        {
            try 
            {
                var locale = pforcedlocale ? pforcedlocale : getLocale()

                //req.body: {card, path}
                const apiparams = {
                    card: pcard,
                    path: ppath,
                    locale: locale
                }
                //res.data: card
                const { data, error } = await axios.post(API_BASEURL + '/image/s3', apiparams, hparams())

                if(error) console.error(error)
                else 
                {
                    pcard.imageS3 = ppath //maj du champ car pcard est retourné dans les autres callback 
                    if(onUpdatedImageS3) onUpdatedImageS3(error ? null : data, true, pcard.reference, pforcedlocale)
                }
            } 
            catch (error) 
            {
                handleApiError(error)
                if(onUpdatedImageS3) onUpdatedImageS3(null, true, pcard.reference, pforcedlocale)
            }
        }

        app.config.globalProperties.g_isBearer = function()
        {
            return bearer != null
        }

        function getFormattedLocale(plocale)
        {
            if(!plocale) plocale = getLocale()
            if(plocale == 'en') return 'en-us'
            return plocale + '-' + plocale
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
    
            //if (bearer) $.extend(apiparams, { collection: true });
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
    
            $.extend(apiparams, { locale: getFormattedLocale()});

            var headers = hparams()

            /*
            if (bearer) {
                $.extend(headers, { 'Authorization': "Bearer " + bearer });
            }
            */
    
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
        
        async function getCollection(pcards, pcallback)
        {
            try 
            {
                var headers = hparams()
                if (bearer) {
                    $.extend(headers.headers, { 'Authorization': "Bearer " + bearer });
                }

                //split des uniques
                const cards = []
                const uniques = []
                
                pcards.forEach(card => {
                    if(app.config.globalProperties.g_isUniqueFromReference(card.reference)) uniques.push(card)
                    else cards.push(card)
                })

                const { data, error } = await axios.post(API_BASEURL + '/cards/stats', {cards: cards, uniques: uniques}, headers)
                
                if(error) console.error(error)
                else
                {
                    var tmpcards = data.cards["hydra:member"].map(pcard => 
                    {
                        return {
                            reference: pcard.reference,
                            inMyCollection: pcard.inMyCollection,
                            inMyWantlist: pcard.inMyWantlist,
                            inMyTradelist: pcard.inMyTradelist,
                            foiled: pcard.foiled
                        }
                    })

                    data.uniques.forEach(punique => {
                        tmpcards.push({
                            reference: punique.reference,
                            inMyCollection: punique.inMyCollection,
                            inMyWantlist: punique.inMyWantlist,
                            inMyTradelist: punique.inMyTradelist,
                            foiled: punique.foiled
                        })
                    })
                    
                    pcallback(tmpcards)
                    return
                }
            }
            catch(error)
            {
                handleApiError(error)
                pcallback(null, error)
            }
        }

        app.config.globalProperties.g_getCollection = function(pcards, pcallback)
        {
            if(this.g_isBearer())
                getCollection(pcards, pcallback)
            else pcallback(null, null)
        }

        async function updateCollection(pcards, pcallback)
        {
            if(!pcards || pcards.length == 0) return

            const zeCards = pcards.map(pcard => {
                return {
                    reference: pcard.reference,
                    inMyCollection: pcard.inMyCollection,
                    inMyTradelist: pcard.inMyTradelist,
                    inMyWantlist: pcard.inMyWantlist,
                    foiled: pcard.foiled,
                }
            })

            try 
            {
                const { data, error } = await axios.post(API_BASEURL + '/cards/collection/update', zeCards, hparams())
                pcallback(data, error)
            }
            catch(error)
            {
                handleApiError(error)
                pcallback(null, error)
            }
        }

        app.config.globalProperties.g_updateCollection = function(pcards, pcallback)
        {
            updateCollection(pcards, pcallback)
        }
        

        async function updateDeckFromAltered(pdeck, pcards, pcallback)
        {
            try 
            {
                const { data, error } = await axios.post(API_BASEURL + '/deck/updatealtered/' + pdeck.id, pcards, hparams())
                
                if(error) 
                {
                    console.error(error)
                    pcallback(null)
                    return
                }

                pcallback(pdeck) //on retourne le deck mais il sera reload par la méthode de chargement de la page
                return
            }
            catch(error)
            {
                handleApiError(error)
                pcallback(null)
            }
        }

        app.config.globalProperties.g_updateDeckFromAltered = function(pdeck, pcards, pcallback)
        {
            updateDeckFromAltered(pdeck, pcards, pcallback)
        }

        
    }
}