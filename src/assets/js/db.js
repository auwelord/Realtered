import { supabase } from '@/db/client'
import axios from 'axios';

export default {
    install: (app, options) => 
    {
        app.config.globalProperties.g_isAdmin = function(puser)
        {
            return puser && puser.id == import.meta.env.VITE_SUPABASE_ADMINID;
        }
        
        async function updateCardFromApi(pid, pcallback)
        {
            var params = {
                itemsPerPage: 1,
                page: 1
            }
            var headers = {
                "Accept-Language": "fr-fr"
            }
            try {
                await axios.get('https://api.altered.gg/cards/' + pid,
                {
                    headers: headers,
                    params: params
                }).then(response => 
                {
                    app.config.globalProperties.g_upsertCard(response.data, true, true, pcallback);
                });
    
            } catch (error) {
                console.error('Error fetching cards:', error);
            }
        }

        app.config.globalProperties.g_updateCardFromApi = function(preference, pcallback)
        {
            updateCardFromApi(preference, pcallback)
        }

        async function fetchAllCards()
        {
            const { data: cards, erreur } = await supabase
                .from('Card')
                .select();

            cards.forEach(card => updateCardFromApi(card.reference));
        }
        app.config.globalProperties.g_updateAllCards = function()
        {
            fetchAllCards();
        }

        async function runFetchDecks(preq, pdftval, params)
        {
            const { data: decks, erreur } = await preq;
            
            if(erreur){
                console.log(erreur);
                return;
            }
            if(params.withcards)
            {
                for(let deck of decks)
                {
                    $.extend(deck, {cards: []});

                    if(deck.CardsDeck)
                    {
                        var refs = deck.CardsDeck.map(card => card.cardRef);
                                            
                        var req = await supabase
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
            var req = supabase.from('Deck');

            if(params.withcards) req = req
                .select('*, CardsDeck(*), hero:Card(*)')

            else req = req.select()

            req = req.order('modifiedAt', {ascending : false});

            if(params.faction)
            {
                req = req.eq('main_faction', params.faction);
            }           

            if(params.myonly)
            {
                app.config.globalProperties.g_retrieveuser(puser => 
                {
                    if(!puser)
                    {
                        pcallback([])
                        return
                    }
                    req = req.eq('userId', puser.id);
                    runFetchDecks(req, [], params);
                });
                return;
            }
            
            //on veut tous les decks
            app.config.globalProperties.g_retrieveuser(puser => 
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
            var req = supabase.from('Deck');
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
                                        
                    req = await supabase
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

        async function importDeck(pdeckname, pdecklist, pcallback)
        {
            var deck = {
                name: pdeckname,
                public: true,
                main_faction: '',
                description: '',
                modifiedAt: new Date().toISOString()
            }

            const {data: saveddeck, erreur} = await supabase
                .from('Deck')
                .upsert(deck)
                .select();

            if(erreur)
            {
                pcallback(null)
                return
            }

            var cards = pdecklist.map(card => {
                return {
                    cardRef: card.ref,
                    deckId:  saveddeck[0].id,
                    quantity: card.qte
                }}
            );

            var refs = pdecklist.map(card => card.ref);
                        
            //recup auto de la faction à partir de la liste des cartes pour update du deck
            if(cards.length > 0)
            {
                const { data: cardlist, errcard } = await supabase
                    .from('Card')
                    .select()
                    .in('reference', refs);

                if(!errcard && cardlist.length > 0)
                {
                    var hero = app.config.globalProperties.g_getCardsOfTypeHeroDecklist(cardlist);
                    if(hero && hero.length > 0)
                    {
                        saveddeck[0].main_faction = hero[0].mainFaction;
                        saveddeck[0].hero_id = hero[0].reference;
                        await supabase
                            .from('Deck')
                            .upsert(saveddeck[0])
                            .select();
                    }
                }
            }

            
            await supabase
                .from('CardsDeck')
                .insert(cards);

            if(pcallback) pcallback(saveddeck[0]);
        }

        app.config.globalProperties.g_importDeck = function(pdeckname, pcardstab, pcallback)
        {
            importDeck(pdeckname, pcardstab, pcallback)
        }

        async function saveDeck(pdeck, pcallback)
        {
            var deck = $.extend({}, pdeck);
            delete deck.cards
            delete deck.hero
            deck.modifiedAt = new Date().toISOString()

            var response = await supabase
                .from('Deck')
                .upsert(deck)
                .select()
            
            var zedeck = response.error ? null : response.data[0];
            if(zedeck)
            {
                //suppression des cartes du deck
                response = await supabase
                    .from('CardsDeck')
                    .delete()
                    .eq('deckId', zedeck.id)

                if(!response.error)
                {
                    //enregistrements des cartes
                    var req = supabase.from('CardsDeck');
                    var cards = [];
                    pdeck.cards.forEach(card => {
                        cards.push({
                            cardRef: card.reference,
                            deckId:  zedeck.id,
                            quantity: card.quantite
                        });
                    });
                    req = req.insert(cards);
                    response = await req.select();
                }
            }

            pcallback(zedeck);
        }

        app.config.globalProperties.g_saveDeck = function(pdeck, pcallback)
        {
            saveDeck(pdeck, pcallback)
        }

        async function deleteDeck(pdeck, pcallback)
        {
            const response = await supabase
                .from('Deck')
                .delete()
                .eq('id', pdeck.id);

            pcallback(response);
        }

        app.config.globalProperties.g_deleteDeck = function(pdeck, pcallback)
        {
            deleteDeck(pdeck, pcallback)
        }        

        async function fetchCard(preference, pcallback)
        {
            const { data: fetched, erreur } = await supabase
                .from('Card')
                .select()
                .eq('reference', preference);

            if(!erreur && fetched.length > 0)
            {
                if(pcallback){
                    pcallback(fetched[0]);
                    return;
                }
            }
            if(pcallback) pcallback(null);
        }

        app.config.globalProperties.g_fetchCard = function(preference, pcallback)
        {
            fetchCard(preference, pcallback)
        }

        async function fetchFactionCards(pfaction, pcallback)
        {
            var req = supabase
                .from('Card')
                .select();

            if(pfaction) req = req.eq('mainFaction', pfaction);

            const { data: cards, erreur } = await req;                

            if(!erreur && cards.length > 0)
            {
                if(pcallback) pcallback(cards);
            }
        }

        app.config.globalProperties.g_fetchFactionCards = function(pfaction, pcallback)
        {
            fetchFactionCards(pfaction, pcallback)
        }

        async function upsertCard(pcard, pdetail, pforceupdate, pcallback)
        {
            const { data: fetched, erreur } = await supabase
                .from('Card')
                .select('detail')
                .eq('reference', pcard.reference);

            if(!pforceupdate)
            {
                if(fetched && fetched.length > 0 && fetched[0].detail)
                {
                    //si la carte est déjà en base et détaillée, pas besoin de maj
                    return;
                }
                if(!pdetail && fetched && fetched.length > 0)
                {
                    //si on veut pas les détails et que l'enregistrement existe, pas besoin de maj
                    return;
                }
            }
            
            var card = {
                reference: pcard.reference,
                name: pcard.name,
                imagePath: pcard.imagePath,
                //cardSet: "COREKS",
                mainFaction: pcard.mainFaction.reference,
                cardType: pcard.cardType.reference,
                cardSubtypes: null,
                rarity: pcard.rarity.reference,
                mainCost: pcard.elements.MAIN_COST,
                recallCost: pcard.elements.RECALL_COST,
                forestPower: pcard.elements.FOREST_POWER,
                mountainPower: pcard.elements.MOUNTAIN_POWER,
                oceanPower: pcard.elements.OCEAN_POWER,
                main_effect: pcard.elements.MAIN_EFFECT,
                echo_effect: pcard.elements.ECHO_EFFECT,
                id: pcard.id,
            };

            if(pdetail) 
            {
                $.extend(card, 
                {
                    cardSet: pcard.cardSet.reference
                });
                if(pcard.cardSubTypes)
                {
                    card.cardSubtypes = [];
                    pcard.cardSubTypes.forEach(subtype => card.cardSubtypes.push(subtype.reference));
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

            const { data, error } = await supabase
                .from('Card')
                .upsert([card])
                .select()

            if(pcallback) pcallback(data[0]);
            return error;
        }

        app.config.globalProperties.g_upsertCard = function(pcard, pdetail, pforceupdate, pcallback)
        {
            return upsertCard(pcard, pdetail, pforceupdate, pcallback);
        }
        async function updateAllCards(pcards, pcallback)
        {
            const { error } = await supabase
            .from('Card')
            .upsert(pcards);

            if(error) console.log(error)
            else if(pcallback) pcallback();
        }

        app.config.globalProperties.g_updateAllCards = function(pcards, pcallback)
        {
            updateAllCards(pcards, pcallback)
        }

        app.config.globalProperties.g_getImageCardPublicUrl = function(pcard)
        {
            if(!pcard.imageS3) return pcard.imagePath;

            const {data: image} = supabase.storage.from('Altered').getPublicUrl(pcard.imageS3);
            if(image.publicUrl.endsWith("null")) return pcard.imagePath;
            return image.publicUrl;
        }

        async function updateImageS3(pcard, ppath, pcallback)
        {
            const { data: card, erreur } = await supabase
                .from('Card')
                .upsert({
                    reference: pcard.reference,
                    imageS3: ppath
                })
                .select();

            if(erreur) console.log(erreur)
            else if(pcallback) pcallback(card[0]);
        }

        app.config.globalProperties.g_updateImageS3 = function(pcard, ppath, pcallback)
        {
            updateImageS3(pcard, ppath, pcallback);
        }
    }
}