<template>
    <div class="col-lg-8 col-12 aw-decktest" v-if="currentdeck">
        <div class="row">
            <div class="d-flex">
                <div class="d-flex flex-fill flex-column">
                    <div class="text-center m-1 aw-titlezone">
                        Expédition Héro
                        <i class="altered-forest fs-7 me-1"></i>{{ getPatate('forest', 'hero') }}
                        <i class="altered-mountain fs-7 ms-2 me-1"></i>{{ getPatate('mountain', 'hero') }}
                        <i class="altered-ocean fs-7 ms-2 me-1"></i>{{ getPatate('ocean', 'hero') }}
                    </div>
                    <div class="aw-expehero m-1 d-flex flex-row justify-content-center flex-fill align-items-center">
                        <draggable
                            v-model="expehero"
                            v-bind="dragOptions"
                            item-key="testid"
                            @start="dragFrom='EXPEHERO'"
                            @end="e_endDrag" 
                            data-dragto='EXPEHERO'
                            class="d-flex flex-wrap"
                            >
                            <template #item="{element}">
                                <div :class="['aw-ghost m-1 position-relative', getClassCard(element), getClassSelectedCard(element)]" :id="element.testid" @click="e_selectCard(element)">
                                    <img :src="g_getImageCardPublicUrl(element)" :title="element.name" class="aw-imgcard aw-dragcard aw-alteredcard" />
                                    <div class="aw-manaslot aw-manacard mb-1 ms-1 me-1"></div>
                                    <div class="aw-imgfugace"></div>
                                    <div class="aw-imgancre"></div>
                                    <div class="aw-imgendormi"></div>
                                    <div :class="['aw-imgboost', getClassBoost(element)]"></div>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
                <div class="d-flex flex-column">
                    <div class="text-center m-1 aw-titlezone">Héro</div>
                    <div class="aw-slot aw-hero m-1 d-flex justify-content-center">
                        <img :src="g_getImageCardPublicUrl(currentdeck.hero)" :title="currentdeck.hero.name" class="aw-imgcard aw-alteredcard p-1" @click="e_exhaustHero"/>
                    </div>
                </div>
                <div class="d-flex flex-fill flex-column">
                    <div class="text-center m-1 aw-titlezone">
                        Expédition Compagnon
                        <i class="altered-forest fs-7 me-1"></i>{{ getPatate('forest', 'comp') }}
                        <i class="altered-mountain fs-7 ms-2 me-1"></i>{{ getPatate('mountain', 'comp') }}
                        <i class="altered-ocean fs-7 ms-2 me-1"></i>{{ getPatate('ocean', 'comp') }}
                    </div>
                    <div class="aw-expecomp m-1 d-flex justify-content-center flex-fill align-items-center">
                        <draggable
                            v-model="expecomp"
                            v-bind="dragOptions"
                            item-key="testid"
                            @start="dragFrom='EXPECOMP'"
                            @end="e_endDrag" 
                            data-dragto='EXPECOMP'
                            class="d-flex flex-wrap"
                            >
                            <template #item="{element}">
                                <div :class="['aw-ghost m-1 position-relative', getClassCard(element), getClassSelectedCard(element)]" :id="element.testid" @click="e_selectCard(element)">
                                    <img :src="g_getImageCardPublicUrl(element)" :title="element.name" class="aw-imgcard aw-dragcard aw-alteredcard" />
                                    <div class="aw-manaslot aw-manacard mb-1 ms-1 me-1"></div>
                                    <div class="aw-imgfugace"></div>
                                    <div class="aw-imgancre"></div>
                                    <div class="aw-imgendormi"></div>
                                    <div :class="['aw-imgboost', getClassBoost(element)]"></div>
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
                    <div class="text-center m-1 aw-titlezone">Réserve</div>
                    <div class="aw-reserve m-1 d-flex justify-content-center flex-fill align-items-center">
                        <draggable
                            v-model="reserve"
                            v-bind="dragOptions"
                            item-key="testid"
                            @start="dragFrom='RESERVE'" 
                            @end="e_endDrag"
                            data-dragto='RESERVE'
                            class="d-flex flex-wrap"
                            >
                            <template #item="{element}">
                                <div :class="['aw-ghost m-1 position-relative', getClassCard(element), getClassSelectedCard(element)]" :id="element.testid" @click="e_selectCard(element)">
                                    <img :src="g_getImageCardPublicUrl(element)" :title="element.name" class="aw-imgcard aw-dragcard aw-alteredcard"/>
                                    <div class="aw-manaslot aw-manacard mb-1 ms-1 me-1"></div>
                                    <div class="aw-imgfugace"></div>
                                    <div class="aw-imgancre"></div>
                                    <div class="aw-imgendormi"></div>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
                <div class="d-flex flex-fill flex-column">
                    <div class="text-center m-1 aw-titlezone">Permanents</div>
                    <div class="aw-perma m-1 d-flex justify-content-center flex-fill align-items-center">
                        <draggable
                            v-model="permas"
                            v-bind="dragOptions"
                            item-key="testid"
                            @start="dragFrom='PERMAS'"
                            @end="e_endDrag" 
                            data-dragto='PERMAS'
                            >
                            <template #item="{element}">
                                <div :class="['aw-ghost m-1', getClassSelectedCard(element)]" :id="element.testid" @click="e_selectCard(element)">
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
                <div class="d-flex">
                    <div class="d-flex flex-column">
                        <div class="text-center m-1 aw-titlezone">Mana: {{ mana.length }}</div>
                        <div class="aw-slot aw-mana m-1">
                            <draggable
                                v-model="mana"
                                v-bind="dragOptions"
                                item-key="testid"
                                @start="dragFrom='MANA'"
                                @end="e_endDrag" 
                                data-dragto='MANA'
                                class="d-flex flex-column justify-content-end"
                                >
                                <template #item="{element}">
                                    <div class="aw-ghost" :id="element.testid" @click="e_selectCard(element)" @mouseenter="e_mouseEnterMana(element)" @mouseleave="e_mouseLeaveMana(element)">
                                        <img :src="g_getImageCardPublicUrl(element)" :title="element.name" class="aw-imgcard aw-dragcard aw-alteredcard" />
                                        <div class="aw-manaslot aw-manacard mb-1 ms-1 me-1"></div>
                                    </div>
                                </template>
                            </draggable>
                        </div>
                    </div>
                    <div class="d-flex flex-column" v-if="urlManaCard">
                        <div class="text-center m-1 aw-titlezone">Carte en mana</div>
                        <div class="aw-slot m-1 d-flex justify-content-center align-items-center position-relative">
                            <img :src="urlManaCard" class="aw-imgcard aw-alteredcard" />
                        </div>
                    </div>
                    <div class="d-flex align-items-center flex-column m-2 aw-decktools">
                        <Dice :dice="dice" @dicerolled="e_dicerolled" class="position-relative"/>

                        <BButton @click="e_addToken" data-ref="ALT_CORE_A_OR_31_C" variant="primary" size="xs" title="Réinitialiser" class="mt-1 w-100 text-left" v-if="g_isDeckOrdis(currentdeck) && tokenavail.length > 0">
                            <font-awesome-icon :icon="['fas', 'circle-plus']" class="me-2" />1/1/1 Recrue Ordis
                        </BButton>
                        <BButton @click="e_addToken" data-ref="ALT_CORE_A_AX_31_C" variant="primary" size="xs" title="Réinitialiser" class="mt-1 w-100 text-left" v-if="g_isDeckAxiom(currentdeck) && tokenavail.length > 0">
                            <font-awesome-icon :icon="['fas', 'circle-plus']" class="me-2" />2/2/2 Scarabot
                        </BButton>
                        <BButton @click="e_addToken" data-ref="ALT_CORE_A_BR_31_C" variant="primary" size="xs" title="Réinitialiser" class="mt-1 w-100 text-left" v-if="g_isDeckBravos(currentdeck) && tokenavail.length > 0">
                            <font-awesome-icon :icon="['fas', 'circle-plus']" class="me-2" />2/2/2 Booda
                        </BButton>
                        <BButton @click="e_addToken" data-ref="ALT_CORE_A_YZ_31_C" variant="primary" size="xs" title="Réinitialiser" class="mt-1 w-100 text-left" v-if="g_isDeckYzmir(currentdeck) && tokenavail.length > 0">
                            <font-awesome-icon :icon="['fas', 'circle-plus']" class="me-2" />0/0/0 Maw
                        </BButton>
                    </div>
                </div>

                <div class="d-flex justify-content-end">
                    <div class="d-flex flex-column">
                        <div class="text-center m-1 aw-titlezone">Deck : {{ deck.length }}</div>
                        <div class="aw-slot m-1 h-100">
                            <img src="@/assets/img/altered/card-back.webp" class="aw-imgcard aw-alteredcard aw-imgdeck"/>
                        </div>
                    </div>
                    <div class="d-flex flex-column aw-defaussecontainer">
                        <div class="text-center m-1 aw-titlezone">
                            <div class="d-flex justify-content-between align-items-center ps-2 pe-2 font-weight-bold">
                                Défausse: {{ defausse.length }} 
                                <div>
                                    <font-awesome-icon :icon="['far', 'eye']" class="ms-1 aw-showdefausse" @click="e_toggleShowDefausse" v-if="defausse.length > 1"/>
                                    <font-awesome-icon :icon="['far', 'eye-slash']" class="ms-3 aw-hidedefausse" @click="e_toggleShowDefausse" v-if="defausse.length > 1"/>
                                </div>
                            </div>
                        </div>
                        <div class="aw-defausse m-1 d-flex justify-content-center align-items-center position-relative h-100">
                            <draggable 
                                v-model="defausse" 
                                v-bind="dragOptions"
                                @start="dragFrom='DEFAUSSE'"
                                @end="e_endDrag" 
                                data-dragto='DEFAUSSE'
                                item-key="testid"
                                class="d-flex">
                                <template #item="{element}">
                                    <div class="aw-ghost m-1 d-flex justify-content-center" :id="element.testid" @click="e_selectCard(element)">
                                        <img :src="g_getImageCardPublicUrl(element)" :title="element.name" class="aw-imgcard aw-dragcard aw-alteredcard" />
                                        <div class="aw-manaslot aw-manacard mb-1 ms-1 me-1"></div>
                                    </div>
                                </template>
                            </draggable>
                        </div>
                    </div>
                    <div class="d-flex flex-column">
                        <div class="text-center">&nbsp;</div>
                        <div class="m-1 d-flex flex-column justify-content-between h-100">
                            <div class="d-flex" v-if="isVisibleStatut()">
                                <img src="@/assets/img/altered/fugace.png" @click="e_toggleStatut('fugace')" :class="['aw-imgjeton aw-imgfugace p-1 m-1', getClassStatut('fugace')]" />
                                <img src="@/assets/img/altered/ancre.png" @click="e_toggleStatut('ancre')" :class="['aw-imgjeton aw-imgancre p-1 m-1', getClassStatut('ancre')]" />
                                <img src="@/assets/img/altered/endormi.png" @click="e_toggleStatut('endormi')" :class="['aw-imgjeton aw-imgendormi p-1 m-1', getClassStatut('endormi')]" />
                            </div>
                            <div class="d-flex justify-content-between" v-if="isVisibleBoost()">
                                <img src="@/assets/img/altered/boost0.png" :class="['aw-imgjeton p-1 m-1']" @click="e_changeBoost(0)" />
                                <img src="@/assets/img/altered/boostremove.png" :class="['aw-imgjeton p-1 m-1']" @click="e_changeBoost(-1)" />
                                <img src="@/assets/img/altered/boostadd.png" :class="['aw-imgjeton p-1 m-1']" @click="e_changeBoost(1)" />
                            </div>
                            <div class="d-flex justify-content-between" style="height: 45px;">
                            <BButton @click="e_fen" variant="light" size="sm" class="me-1" title="Piocher / Mettre en mana / ravitailler" v-if="deck.length >= 3 && isDeckFen()">
                                <img src="https://fyqptmokmnymednlerpj.supabase.co/storage/v1/object/public/Altered/assets/icons/lyra.png" class="h-100">
                            </BButton>
                            <BButton @click="e_draw" variant="uniqued2" size="sm" title="Piocher" v-if="deck.length > 0">
                                <i class="altered-hand"></i>
                            </BButton>
                            <BButton @click="e_ravitailler" variant="uniqued2" size="sm" class="ms-1" title="Ravitailler" v-if="deck.length > 0">
                                <i class="altered-reserve"></i>
                            </BButton>
                            <BButton @click="e_reinit" variant="danger" size="sm" title="Réinitialiser" class="ms-1">
                                <font-awesome-icon :icon="['fas', 'rotate-left']" />
                            </BButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="d-flex aw-maincontainer">
                <div class="d-flex flex-column flex-fill">
                    <div class="text-center m-1 aw-titlezone">Main: {{ hand.length }} / Coût de main: {{ getCoutDeMain()}} / Coût de réserve: {{ getCoutDeReserve() }}</div>
                    <draggable 
                        v-model="hand" 
                        v-bind="dragOptions"
                        @start="dragFrom='HAND'"
                        @end="e_endDrag" 
                        data-dragto='HAND'
                        item-key="testid"
                        class="aw-main m-1 d-flex justify-content-center flex-fill">
                        <template #item="{element}">
                            <div :class="['aw-ghost m-1', getClassSelectedCard(element)]" :id="element.testid" @click="e_selectCard(element)">
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
import { useToast, TYPE } from "vue-toastification";

const toast = useToast();

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
            expecomp: [],
            reserve: [],
            permas: [],
            fulldeck: [], //pour manipuler les statuts
            token: [], //token in game
            tokenavail: [],
            dragFrom: null,
            selectedCard: null,
            urlManaCard: null,
            dice: {value: 1},
            maxTestid: 1
        }
    },
    computed: {
        dragOptions() {
            return {
                animation: 200,
                group: "hand",
                disabled: false,
                ghostClass: "ghost",
            };
        }
    },
    mounted() 
    {
    },
    methods:
    {
        getPatate(pbiome, pqui)
        {
            var total = 0
            if(pqui == 'hero')
            {
                for(let card of this.expehero)
                {
                    if(!card.endormi) switch(pbiome)
                    {
                        case 'forest':
                            total += card.forestPower + card.boost
                            break
                        case 'mountain':
                            total += card.mountainPower + card.boost
                            break
                        case 'ocean':
                            total += card.oceanPower + card.boost
                            break
                    }
                }
            }
            else
            {
                for(let card of this.expecomp)
                {
                    if(!card.endormi) switch(pbiome)
                    {
                        case 'forest':
                            total += card.forestPower + card.boost
                            break
                        case 'mountain':
                            total += card.mountainPower + card.boost
                            break
                        case 'ocean':
                            total += card.oceanPower + card.boost
                            break
                    }
                }
            }
            return total
        },
        e_addToken(pevt)
        {
            const ref = $(pevt.target).data('ref')
            if(!ref) return

            const token = $.extend({}, this.tokenavail.find(pcard => pcard.reference == ref))
            token.testid = this.maxTestid++
            token.boost = 0

            this.token.push(token)
            this.expehero.push(token)
            this.e_selectCard(token)
        },
        e_dicerolled()
        {
            toast('Vous avez fait un ' + this.dice.value, {type: TYPE.INFO})
        },
        e_toggleShowDefausse()
        {
            $('.aw-defaussecontainer').toggleClass('aw-showall')
        },
        e_exhaustHero()
        {
            $('.aw-slot.aw-hero').toggleClass('aw-exhauted')
        },
        e_mouseEnterMana(pcard)
        {
            this.urlManaCard = this.g_getImageCardPublicUrl(pcard)
        },
        e_mouseLeaveMana(pcard)
        {
            this.urlManaCard = null
        },
        getClassBoost(pcard)
        {
            return 'aw-boost' + pcard.boost
        },
        e_changeBoost(pval)
        {
            if(!this.selectedCard || !this.g_canHaveBoost(this.selectedCard)) return

            if(pval == 0){
                this.selectedCard.boost = 0
                return
            }
            else if(pval == -1)
            {
                if(this.selectedCard.boost > 0) this.selectedCard.boost -= 1
            }
            else if(this.selectedCard.boost < 20) this.selectedCard.boost += 1
        },
        e_toggleStatut(pstatut)
        {
            if(!this.selectedCard) return

            switch (pstatut) {
                case 'fugace':
                    this.selectedCard.fugace = !this.selectedCard.fugace
                    break;
                case 'ancre':
                    this.selectedCard.ancre = !this.selectedCard.ancre
                    break;
                case 'endormi':
                    this.selectedCard.endormi = !this.selectedCard.endormi
                    break;
            }
        },
        getPositionSelectedCard()
        {
            if(!this.selectedCard) return null

            var card = this.hand.find(pcard => pcard.testid == this.selectedCard.testid)
            if(card) return 'HAND'

            card = this.expehero.find(pcard => pcard.testid == this.selectedCard.testid)
            if(card) return 'EXPEHERO'

            card = this.expecomp.find(pcard => pcard.testid == this.selectedCard.testid)
            if(card) return 'EXPECOMP'

            card = this.reserve.find(pcard => pcard.testid == this.selectedCard.testid)
            if(card) return 'RESERVE'

            card = this.permas.find(pcard => pcard.testid == this.selectedCard.testid)
            if(card) return 'PERMAS'

            card = this.defausse.find(pcard => pcard.testid == this.selectedCard.testid)
            if(card) return 'DEFAUSSE'

            card = this.deck.find(pcard => pcard.testid == this.selectedCard.testid)
            if(card) return 'DECK'

            return null
        },
        isVisibleStatut(pstatut)
        {
            if(!this.selectedCard) return false
            if(this.g_isPermanent(this.selectedCard)) return false

            const where = this.getPositionSelectedCard()
            if(where != 'EXPEHERO' && where != 'EXPECOMP' ) return false
            return true
        },
        isVisibleBoost()
        {
            if(!this.selectedCard) return false
            if(!this.g_canHaveBoost(this.selectedCard)) return false

            const where = this.getPositionSelectedCard()
            if(where != 'EXPEHERO' && where != 'EXPECOMP' ) return false
            //&& (g_isPersonnage(this.selectedCard) || g_isPermanent(this.selectedCard))
            return true
        },
        getClassStatut(pstatut)
        {
            if(!this.selectedCard) return ''

            if(pstatut == 'fugace' && this.selectedCard.fugace) return 'aw-selected'
            else if(pstatut == 'ancre' && this.selectedCard.ancre) return 'aw-selected'
            else if(pstatut == 'endormi' && this.selectedCard.endormi) return 'aw-selected'
            return ''
        },
        e_selectCard(pcard)
        {
            if(this.selectedCard && this.selectedCard.testid == pcard.testid) this.selectedCard = null
            else this.selectedCard = pcard
        },
        e_endDrag(pevent)
        {
            if(pevent.from === pevent.to) return

            const dragTo = $(pevent.to).data('dragto')
            const card = this.getCardFromId(pevent.item.id)
            
            //un token n'est autorisé qu'en expé
            //si zone différente, on le supprime
            if(this.g_isToken(card) && (!(dragTo == 'EXPEHERO' || dragTo == 'EXPECOMP')))
            {
                switch (dragTo) {
                    case 'RESERVE':
                        this.reserve = this.reserve.filter(pcard => pcard.testid != card.testid)
                        break
                    case 'PERMAS':
                        this.permas = this.permas.filter(pcard => pcard.testid != card.testid)
                        break
                    case 'MANA':
                        this.mana = this.mana.filter(pcard => pcard.testid != card.testid)
                        break
                    case 'HAND':
                        this.hand = this.hand.filter(pcard => pcard.testid != card.testid)
                        break
                    case 'DEFAUSSE':
                        this.defausse = this.defausse.filter(pcard => pcard.testid != card.testid)
                        break
                }
                //suppression du token in game
                this.token = this.token.filter(pcard => pcard.testid != card.testid)
                
                this.selectedCard = null
                return
            }

            switch (dragTo) {
                case 'RESERVE':
                    if(this.dragFrom != 'EXPEHERO' && this.dragFrom != 'EXPECOMP' && this.dragFrom != 'HAND' && !this.g_isSort(card))
                    {
                        this.reAddCardToOriginalGroup(card)
                        this.reserve = this.reserve.filter(pcard => pcard.testid != card.testid)
                        return
                    }
                    if(!this.g_isPermanent(card))
                    {
                        card.fugace = true
                    }
                    card.ancre = false
                    card.endormi = false
                    break;
                case 'EXPEHERO':
                case 'EXPECOMP':
                    if(this.g_isPermanent(card) || this.g_isSort(card))
                    {
                        this.reAddCardToOriginalGroup(card)
                        if(dragTo == 'EXPEHERO') this.expehero = this.expehero.filter(pcard => pcard.testid != card.testid)
                        else this.expecomp = this.expecomp.filter(pcard => pcard.testid != card.testid)
                        return
                    }
                    break;
                case 'PERMAS':
                    if(!this.g_isPermanent(card))
                    {
                        this.reAddCardToOriginalGroup(card)
                        this.permas = this.permas.filter(pcard => pcard.testid != card.testid)
                        return
                    }
                    card.fugace = false
                    break;
                case 'MANA':
                case 'HAND':
                case 'DEFAUSSE':
                    card.ancre = false
                    card.endormi = false
                    card.fugace = false
                    card.boost = 0
                    break;
                default:
                    break;
            }

            this.selectedCard = card
        },
        reAddCardToOriginalGroup(pcard)
        {
            switch (this.dragFrom) {
                case 'HAND':
                    this.hand.push(pcard)
                    break;
                case 'RESERVE':
                    this.reserve.push(pcard)
                    break;
                case 'PERMAS':
                    this.permas.push(pcard)
                    break;
                case 'EXPEHERO':
                    this.expehero.push(pcard)
                    break;
                case 'EXPECOMP':
                    this.expecomp.push(pcard)
                    break;
                case 'MANA':
                    this.mana.push(pcard)
                    break;
                case 'DEFAUSSE':
                    this.defausse.push(pcard)
                    break;
                default:
                    break;
            }
        },
        getCardFromId(ptestid)
        {
            var card = this.fulldeck.find(pcard => pcard.testid == ptestid)
            if(card) return card

            //peut être un token
            return this.token.find(pcard => pcard.testid == ptestid)
        },
        getClassCard(pcard)
        {
            var classes = []
            if(pcard.fugace) classes.push('aw-fugace')
            if(pcard.ancre) classes.push('aw-ancre')
            if(pcard.endormi) classes.push('aw-endormi')
            return classes.join(' ')
        },
        getClassSelectedCard(pcard)
        {
            return this.selectedCard && pcard.testid == this.selectedCard.testid ? 'aw-selected' : ''
        },
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
            $('.aw-slot.aw-hero').removeClass('aw-exhauted')

            const tmpdeck = this.currentdeck.cards.filter(card => !this.g_isHero(card));
            
            this.deck = []
            this.hand = []
            this.mana = []
            this.expehero = []
            this.expecomp = []
            this.reserve = []
            this.defausse = []
            this.permas = []
            this.fulldeck = []
            this.token = []
            this.tokenavail = []

            this.maxTestid = 1
            tmpdeck.forEach(card => 
            {
                for(let nbcards = 1; nbcards <= card.quantite; nbcards++)
                {
                    card.boost = 0
                    card.testid = this.maxTestid++
                    this.deck.push($.extend({}, card))
                }
            })
            this.deck.forEach(card => this.fulldeck.push(card))

            this.shuffleDeck()

            for(let index = 1; index <= 6; index++)
            {
                this.hand.push(this.deck.shift())
            }

            //recup des tokens
            var calcparams = {
                deckbuilder: false,
                currentFaction: this.currentdeck.main_faction,
                calculatedrarity: ['COMMON'],
                calculatedtype: ['TOKEN'],
                currentPage: 1,
                itemsPerPage: 50,                
            }
            this.g_fetchCardsFromDatabase(calcparams, pcards => 
            {
                if(pcards)
                {
                    this.tokenavail = pcards
                }
            })
        },
        e_fen()
        {
            this.fen()
        },
        fen()
        {
            this.draw()
            this.mana.unshift(this.deck.shift())
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
            const card = this.deck.shift()

            if(card)
            {
                if(!this.g_isPermanent(card)) card.fugace = true
                this.reserve.push(card)
            }
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
.aw-decktools
{
    margin-top: 38px !important;
}
.aw-main img{
    min-width: 124px;
}
.aw-imgdeck{
    max-height: 170px;
}
.aw-defaussecontainer
{
    max-width: 800px;
}
.aw-defaussecontainer .aw-hidedefausse
{
    display: none;
}
.aw-defaussecontainer.aw-showall .aw-showdefausse
{
    display: none;
}
.aw-defaussecontainer.aw-showall .aw-hidedefausse
{
    display: block;
}
.aw-hidedefausse,
.aw-showdefausse
{
    cursor: pointer;
    transition: all 0.3s;
}
.aw-showdefausse:hover
{
    color: var(--c-unique)
}
.aw-slot.aw-hero
{
    transition: width 0.5s;
}
.aw-slot.aw-hero img
{
    transition: transform 0.5s;
    cursor: pointer;
    max-width: 132px;
}
.aw-slot.aw-hero.aw-exhauted
{
    width: 185px;
}
.aw-slot.aw-hero.aw-exhauted img
{
    transform: rotate(90deg);
}

.aw-titlezone{
    background-color: rgb(0 0 0 / 33%);
    border-width: var(--bs-border-width);
    border-color: var(--bs-border-color-translucent);
    border-radius: var(--bs-border-radius);
    border-style: solid;
    color: white;
    font-weight: bolder;
}
.aw-decktest{
    background-image: url(/src/assets/img/altered_leviathan.jpg);
    background-size: contain;
    color: white;
}
.aw-imgjeton.aw-selected
{
    border: 2px solid var(--c-unique);
}
.aw-imgjeton
{
    cursor: pointer;
    width: 50px;
}
.aw-ghost.aw-selected img
{
    border: 2px solid var(--c-unique);
}
.aw-ghost .aw-imgancre,
.aw-ghost .aw-imgfugace,
.aw-ghost .aw-imgendormi
{
    display: none;
}
.aw-ghost .aw-imgancre::after,
.aw-ghost .aw-imgfugace::after,
.aw-ghost .aw-imgendormi::after,
.aw-ghost .aw-imgboost::after
{
    position: absolute;
    right: 5px;
    background-size: 35px 35px;
    width: 35px;
    height: 35px;
    content: "";
    color: white;
    padding-left: 14px;
}
.aw-ghost.aw-ancre .aw-imgancre,
.aw-ghost.aw-fugace .aw-imgfugace,
.aw-ghost.aw-endormi .aw-imgendormi
{
    display: block;
}
.aw-ghost.aw-fugace .aw-imgfugace::after
{
    top: 0;
    background-image: url(/src/assets/img/altered/fugace.png);    
}
.aw-ghost.aw-ancre .aw-imgancre::after
{
    top: 38px;
    background-image: url(/src/assets/img/altered/ancre.png);    
}
.aw-ghost.aw-endormi .aw-imgendormi::after
{
    top: 76px;
    background-image: url(/src/assets/img/altered/endormi.png);
}
.aw-ghost .aw-imgboost::after
{
    top: 114px;
    background-image: url(/src/assets/img/altered/boost.png);  
}
.aw-ghost .aw-imgboost.aw-boost0::after { display: none; }
.aw-ghost .aw-imgboost.aw-boost1::after { content: "1"; }
.aw-ghost .aw-imgboost.aw-boost2::after { content: "2"; }
.aw-ghost .aw-imgboost.aw-boost3::after { content: "3"; }
.aw-ghost .aw-imgboost.aw-boost4::after { content: "4"; }
.aw-ghost .aw-imgboost.aw-boost5::after { content: "5"; }
.aw-ghost .aw-imgboost.aw-boost6::after { content: "6"; }
.aw-ghost .aw-imgboost.aw-boost7::after { content: "7"; }
.aw-ghost .aw-imgboost.aw-boost8::after { content: "8"; }
.aw-ghost .aw-imgboost.aw-boost9::after { content: "9"; }
.aw-ghost .aw-imgboost.aw-boost10::after { content: "10"; padding-left: 9px;}
.aw-ghost .aw-imgboost.aw-boost11::after { content: "11"; padding-left: 9px; }
.aw-ghost .aw-imgboost.aw-boost12::after { content: "12"; padding-left: 9px; }
.aw-ghost .aw-imgboost.aw-boost13::after { content: "13"; padding-left: 9px; }
.aw-ghost .aw-imgboost.aw-boost14::after { content: "14"; padding-left: 9px; }
.aw-ghost .aw-imgboost.aw-boost15::after { content: "15"; padding-left: 9px; }
.aw-ghost .aw-imgboost.aw-boost16::after { content: "16"; padding-left: 9px; }
.aw-ghost .aw-imgboost.aw-boost17::after { content: "17"; padding-left: 9px; }
.aw-ghost .aw-imgboost.aw-boost18::after { content: "18"; padding-left: 9px; }
.aw-ghost .aw-imgboost.aw-boost19::after { content: "19"; padding-left: 9px; }
.aw-ghost .aw-imgboost.aw-boost20::after { content: "20"; padding-left: 9px; }

.aw-expehero > div,
.aw-expecomp > div,
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
    display: none !important;
}
.aw-defausse .aw-ghost:first-child,
.aw-defaussecontainer.aw-showall .aw-defausse .aw-ghost
{
    display: block !important;
}
.aw-ghost
{
    display: inline-block;
    max-width: 127px;
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
    background-color: var(--c-uniqued2);
    transition: all 0.3s;
}
.aw-mana .aw-manaslot:hover
{
    background-color: var(--c-unique);
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
.aw-reserve, .aw-perma, .aw-slot, .aw-expehero, .aw-expecomp, .aw-main, .aw-defausse
{
    min-height: 180px;
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
    min-width: 122px; 
}
.aw-defaussecontainer .aw-defausse
{
    min-width: 127px;
    width: auto; 
    height: auto;
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
    height: auto;
    width: 120px;
    /*min-width: 126px;*/
}
.aw-defaussecontainer .aw-showall.aw-defausse{
    height: auto;
}
.aw-defausse > div{
    flex-wrap: wrap;
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