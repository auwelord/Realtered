import { supabase } from '@/db/client'
import axios from 'axios';

export default {
    install: (app, options) => 
    {
        app.config.globalProperties.g_isAdmin = function(puser)
        {
            return puser.id = import.meta.env.VITE_SUPABASE_ADMINID;
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

        async function run(preq, pdftval, pcallback)
        {
            const { data: zedata, erreur } = await preq;

            if(erreur){
                console.log(erreur);
                return;
            }
            if(pcallback) pcallback(zedata ? zedata : pdftval);
        }

        async function fetchDecks(pmyonly, pcallback)
        {
            var req = supabase
                .from('Deck')
                .select();

            if(pmyonly)
            {
                app.config.globalProperties.g_retrieveuser(user => 
                {
                    req = req.eq('userId', user.id);
                    run(req, [], pcallback);
                });
                return;
            }

            const { data: fetched, erreur } = await req;
            pcallback(fetched ? fetched : []);            
        }

        app.config.globalProperties.g_fetchDecks = function(pmyonly, pcallback)
        {
            fetchDecks(pmyonly, pcallback)
        }

        async function fetchDeck(pid, pwithcards, pcallback)
        {
            var req = supabase.from('Deck');
            if(pwithcards)
            {
                req = req.select('*, CardsDeck(*)')
            }
            req = req.eq('id', pid);

            const { data: deck, erreurdeck } = await req
            
            var found = deck && deck.length > 0;
            if(found)
            {
                var zedeck = 
                {
                    id: deck[0].id,
                    name: deck[0].name,
                    public: deck[0].public,
                    main_faction: deck[0].main_faction,
                    description: deck[0].description,
                    cards: []
                }

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
            
            //recup auto de la faction à partir de la liste des cartes pour update du deck
            if(cards.length > 0)
            {
                const { data: card, errcard } = await supabase
                    .from('Card')
                    .select()
                    .eq('reference', cards[0].cardRef);

                if(!errcard && card.length > 0)
                {
                    saveddeck[0].main_faction = card[0].mainFaction;
                    await supabase
                        .from('Deck')
                        .upsert(saveddeck[0])
                        .select();
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
            var deck = {
                name: pdeck.name,
                public: pdeck.public,
                main_faction: pdeck.main_faction,
                description: pdeck.description,
                modifiedAt: new Date().toISOString()
            }

            if(pdeck.id != 0)
            {
                $.extend(deck, {id: pdeck.id})
            }
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