<template>
    <div class="col-lg-8 col-12" v-if="currentdeck">
        <div class="row">
            <div class="d-flex">
                <div class="d-flex flex-fill flex-column">
                    <div class="text-center">Expédition Héro</div>
                    <div class="aw-expehero m-1 d-flex flex-row justify-content-center flex-fill align-items-center">
                        <draggable
                            v-model="expehero"
                            v-bind="dragOptions"
                            item-key="testid"
                            @start="draghand=true" 
                            @end="draghand=false" 
                            >
                            <template #item="{element}">
                                <div class="aw-ghost m-1">
                                    <img :src="g_getImageCardPublicUrl(element)" :title="element.name" class="aw-imgcard aw-dragcard aw-alteredcard" />
                                    <div class="aw-manaslot aw-manacard mb-1 ms-1 me-1"></div>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
                <div class="d-flex flex-column">
                    <div class="text-center">Héro</div>
                    <div class="aw-slot m-1 d-flex justify-content-center">
                        <img :src="g_getImageCardPublicUrl(currentdeck.hero)" :title="currentdeck.hero.name" class="aw-imgcard aw-alteredcard p-1" />
                    </div>
                </div>
                <div class="d-flex flex-fill flex-column">
                    <div class="text-center">Expédition Compagnon</div>
                    <div class="aw-expecompagnon m-1 d-flex justify-content-center flex-fill align-items-center">
                        <draggable
                            v-model="expecompagnon"
                            v-bind="dragOptions"
                            item-key="testid"
                            @start="draghand=true" 
                            @end="draghand=false" 
                            >
                            <template #item="{element}">
                                <div class="aw-ghost m-1">
                                    <img :src="g_getImageCardPublicUrl(element)" :title="element.name" class="aw-imgcard aw-dragcard aw-alteredcard" />
                                    <div class="aw-manaslot aw-manacard mb-1 ms-1 me-1"></div>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="d-flex">
                <div class="d-flex flex-fill flex-column">
                    <div class="text-center">Réserve</div>
                    <div class="aw-reserve m-1 d-flex justify-content-center flex-fill align-items-center">
                        <draggable
                            v-model="reserve"
                            v-bind="dragOptions"
                            item-key="testid"
                            @start="draghand=true" 
                            @end="draghand=false" 
                            >
                            <template #item="{element}">
                                <div class="aw-ghost m-1">
                                    <img :src="g_getImageCardPublicUrl(element)" :title="element.name" class="aw-imgcard aw-dragcard aw-alteredcard" />
                                    <div class="aw-manaslot aw-manacard mb-1 ms-1 me-1"></div>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
                <div class="d-flex flex-fill flex-column">
                    <div class="text-center">Permanents</div>
                    <div class="aw-perma m-1 d-flex justify-content-center flex-fill align-items-center">
                        <draggable
                            v-model="permas"
                            v-bind="dragOptions"
                            item-key="testid"
                            @start="draghand=true" 
                            @end="draghand=false" 
                            >
                            <template #item="{element}">
                                <div class="aw-ghost m-1">
                                    <img :src="g_getImageCardPublicUrl(element)" :title="element.name" class="aw-imgcard aw-dragcard aw-alteredcard" />
                                    <div class="aw-manaslot aw-manacard mb-1 ms-1 me-1"></div>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="d-flex justify-content-between">
                <div class="d-flex flex-column">
                    <div class="text-center">Mana: {{ mana.length }}</div>
                    <div class="aw-slot aw-mana m-1">
                        <draggable
                            v-model="mana"
                            v-bind="dragOptions"
                            item-key="testid"
                            @start="draghand=true" 
                            @end="draghand=false" 
                            class="d-flex flex-column justify-content-end"
                            >
                            <template #item="{element}">
                                <div class="aw-ghost">
                                    <img :src="g_getImageCardPublicUrl(element)" :title="element.name" class="aw-imgcard aw-dragcard aw-alteredcard" />
                                    <div class="aw-manaslot aw-manacard mb-1 ms-1 me-1"></div>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>

                <div class="d-flex justify-content-end">
                    <div class="d-flex flex-column">
                        <div class="text-center">Deck : {{ deck.length }}</div>
                        <div class="aw-slot m-1">
                            <img src="@/assets/img/altered/card-back.webp" class="aw-imgcard aw-alteredcard"/>
                        </div>
                    </div>
                    <div class="d-flex flex-column">
                        <div class="text-center">Défausse: {{ defausse.length }}</div>
                        <div class="aw-defausse m-1 d-flex justify-content-center align-items-center position-relative">
                            <draggable 
                                v-model="defausse" 
                                v-bind="dragOptions"
                                @start="draghand=true" 
                                @end="draghand=false" 
                                item-key="testid"
                                class="m-1 d-flex justify-content-center flex-fill">
                                <template #item="{element}">
                                    <div class="aw-ghost m-1">
                                        <img :src="g_getImageCardPublicUrl(element)" :title="element.name" class="aw-imgcard aw-dragcard aw-alteredcard" />
                                        <div class="aw-manaslot aw-manacard mb-1 ms-1 me-1"></div>
                                    </div>
                                </template>
                            </draggable>
                        </div>
                    </div>
                    <div class="d-flex flex-column">
                        <div class="text-center">&nbsp;</div>
                        <div class="m-1 d-flex flex-column">
                            <BButton @click="e_fen" variant="light" size="sm" class="mb-1" title="Piocher / Mettre en mana / ravitailler" v-if="deck.length >= 3 && isDeckFen()">
                                <img src="https://fyqptmokmnymednlerpj.supabase.co/storage/v1/object/public/Altered/assets/icons/lyra.png" class="me-2" style="width: 15px "> Fen
                            </BButton>
                            <BButton @click="e_draw" variant="uniqued2" size="sm" class="mb-1" title="Piocher" v-if="deck.length > 0">
                                <i class="altered-hand me-2"></i>Piocher
                            </BButton>
                            <BButton @click="e_ravitailler" variant="uniqued2" size="sm" class="mb-1" title="Ravitailler" v-if="deck.length > 0">
                                <i class="altered-reserve me-2"></i>Ravitailler
                            </BButton>
                            <BButton @click="e_reinit" variant="uniqued2" size="sm" title="Réinitialiser">
                                <font-awesome-icon :icon="['fas', 'rotate-left']" class="me-2" />Réinitialiser
                            </BButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="d-flex aw-maincontainer">
                <div class="d-flex flex-column flex-fill">
                    <div class="text-center">Main: {{ hand.length }} / Coût de main: {{ getCoutDeMain()}} / Coût de réserve: {{ getCoutDeReserve() }}</div>
                    <draggable 
                        v-model="hand" 
                        v-bind="dragOptions"
                        @start="draghand=true" 
                        @end="draghand=false" 
                        item-key="testid"
                        class="aw-main m-1 d-flex justify-content-center flex-fill">
                        <template #item="{element}">
                            <div class="aw-ghost m-1">
                                <img :src="g_getImageCardPublicUrl(element)" :title="element.name" class="aw-imgcard aw-dragcard aw-alteredcard" />
                                <div class="aw-manaslot aw-manacard mb-1 ms-1 me-1"></div>
                            </div>
                        </template>
                    </draggable>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { watch, getCurrentInstance } from 'vue'

const props = defineProps({
    user: { type: Object },
    currentdeck: { type: Object }
});

const instance = getCurrentInstance();

watch(() => props.currentdeck, async (newcurrentdeck, oldcurrentdeck) => {
    if (newcurrentdeck) {
        instance.proxy.initTest();
    }
})
</script>

<script>
import draggable from 'vuedraggable'

export default
{
    components: {
        draggable,
    },
    data() {
        return {
            deck: [],
            defausse: [],
            mana: [],
            hand: [],
            expehero: [],
            expecompagnon: [],
            reserve: [],
            permas: [],
            draghand: false
        }
    },
    computed: {
        dragOptions() {
            return {
                animation: 200,
                group: "hand",
                disabled: false,
                ghostClass: "ghost"
            };
        }
    },
    mounted() 
    {
    },
    methods:
    {
        getCoutDeMain()
        {
            var cost = 0
            for(let card of this.hand)
            {
                cost += card.mainCost
            }
            return cost
        },
        getCoutDeReserve()
        {
            var cost = 0
            for(let card of this.hand)
            {
                cost += card.recallCost
            }
            return cost
        },
        e_reinit(){
            this.initTest()
        },
        isDeckFen()
        {
            return this.currentdeck && this.currentdeck.hero.name.startsWith('Fen')
        },
        initTest()
        {
            const tmpdeck = this.currentdeck.cards.filter(card => !this.g_isHero(card));
            
            this.deck = []
            this.hand = []
            this.mana = []
            this.expehero = []
            this.expecompagnon = []
            this.reserve = []
            this.defausse = []
            this.permas = []

            var cpt = 1
            tmpdeck.forEach(card => 
            {
                for(let nbcards = 1; nbcards <= card.quantite; nbcards++)
                {
                    card.testid = cpt++
                    this.deck.push($.extend({}, card))
                }
            })

            //console.log(this.currentdeck.cards)
            this.shuffleDeck()

            for(let index = 1; index <= 6; index++)
            {
                this.hand.push(this.deck.shift())
            }
        },
        e_fen()
        {
            this.fen()
        },
        fen()
        {
            this.draw()
            this.mana.push(this.deck.shift())
            this.ravitailler()
        },
        e_draw()
        {
            this.draw()
        },
        draw()
        {
            this.hand.push(this.deck.shift())
        },
        e_ravitailler()
        {
            this.ravitailler()
        },
        ravitailler()
        {
            this.reserve.push(this.deck.shift())
        },
        shuffleDeck() 
        {
            var m = this.deck.length, t, i;

            // While there remain elements to shuffle…
            while (m) {
                // Pick a remaining element…
                i = Math.floor(Math.random() * m--);

                // And swap it with the current element.
                t = this.deck[m];
                this.deck[m] = this.deck[i];
                this.deck[i] = t;
            }
        }
    }
}
</script>

<style scoped>
.aw-expehero > div,
.aw-expecompagnon > div,
.aw-perma > div,
.aw-reserve > div,
.aw-mana > div,
.aw-defausse > div
{
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
}

.aw-defausse .aw-ghost
{
    display: none;
}
.aw-defausse .aw-ghost:first-child
{
    display: block;
}

.aw-ghost
{
    display: inline-block;
}
.aw-mana .aw-ghost
{
    display: block;
}
.aw-mana .aw-imgcard
{
    display: none;
}
.aw-manaslot
{
    display: none;
}
.aw-mana .aw-manaslot
{
    display: block;
    background-color: var(--c-rared2);
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.flip-list-move {
  transition: transform 0.5s;
}
.aw-dragcard {
  cursor: move;
}
.aw-reserve, .aw-perma, .aw-slot, .aw-expehero, .aw-expecompagnon, .aw-main, .aw-defausse
{
    height: 180px;
    background-color: var(--bs-border-color-translucent);
    border-width: var(--bs-border-width);
    border-color: var(--bs-border-color-translucent);
    border-radius: var(--bs-border-radius);
    border-style: solid;
}
.aw-slot.aw-mana
{
    height: 100%;
}
.aw-slot, .aw-deck, .aw-defausse
{
    width: 132px;    
}
.aw-decksize
{
    background-color: transparent;
    color: black;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
}
.aw-imgcard
{
    height: 100%;
}
.aw-maincontainer
{
    overflow-x: auto;
}

.aw-slot.aw-mana
{
    width: 100px;
}
.aw-manacard
{
    background-color: var(--c-rare);
    height: 15px;
    border-radius: 3px;
}
</style>