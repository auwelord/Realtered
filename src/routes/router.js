import { createRouter, createWebHistory } from 'vue-router';
import PAccueil from '../components/PAccueil.vue';
import PDeckBuilder from '../components/PDeckBuilder.vue';
import PCartes from '../components/PCartes.vue';
import PDecklists from '../components/PDecklists.vue';
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
        path: '/decklists/:pathMatch(.*)*',
        name: 'Decks',
        component: PDecklists,
        history: true,
        props: true
    },
    {
        path: '/test',
        name: 'Test',
        component: Test,
        history: false,
        props: true
    }
];

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
