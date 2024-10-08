import { createRouter, createWebHistory } from 'vue-router';
import PAccueil from '../components/PAccueil.vue';
import PDeckBuilder from '../components/PDeckBuilder.vue';
import PCartes from '../components/PCartes.vue';
import PDecks from '../components/PDecks.vue';
import PDecktest from '../components/PDecktest.vue';
import PTournois from '../components/PTournois.vue';
import Test from '../components/Test.vue';

const routes = [
    /*
    {
        path: '/',
        redirect: '/accueil',
        history: false
    },*/
    {
        path: '/',
        name: 'Accueil',
        component: PAccueil,
        history: true,
        props: true
    },
    {
        path: '/deckbuilder',
        name: 'DeckBuilder',
        component: PDeckBuilder,
        history: true,
        props: true
    },
    {
        path: '/cartes',
        name: 'Cartes',
        component: PCartes,
        history: true,
        props: true
    },
    {
        path: '/decklists/:deckid',
        name: 'Decks',
        component: PDecks,
        history: true,
        props: route => ({ deckid: convertIntegerParam(route.params.deckid)})
    },
    {
        path: '/decklists',
        name: 'DeckList',
        component: PDecks,
        history: true,
        props: true
    },
    {
        path: '/decktest/:deckid',
        name: 'DeckTest',
        component: PDecktest,
        history: true,
        props: route => ({ deckid: convertIntegerParam(route.params.deckid)})
    },
    {
        path: '/decktest',
        name: 'Tests',
        component: PDecktest,
        history: true,
        props: true
    },
    {
        path: '/tournois',
        name: 'Tournois',
        component: PTournois,
        history: true,
        props: true
    },
    {
        path: '/tournois/:tournoiid',
        name: 'Tournoi',
        component: PTournois,
        history: true,
        props: route => ({ tournoiid: convertIntegerParam(route.params.tournoiid)})
    },
    {
        path: '/test',
        name: 'Test',
        component: Test,
        history: false,
        props: true
    }
];

const convertIntegerParam = function(pval)
{
    const num = Number(pval);
    return Number.isInteger(num) && pval.trim() === num.toString() ? num : 0
}

const router = createRouter({
    history: createWebHistory(),
    routes
});

function checkHistory(route, fullPath)
{
    return route.history && fullPath.startsWith(route.path);
}
// Store the last visited page in localStorage
router.beforeEach((to, from, next) => {

    let history = to.fullPath == "/" || routes.some(route => checkHistory(route, to.fullPath));
    if(history)
    {
        localStorage.setItem('lastVisitedPage', to.fullPath);
    }
    next();
});

export default router;
