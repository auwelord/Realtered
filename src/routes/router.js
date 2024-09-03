import { createRouter, createWebHistory } from 'vue-router';
import Accueil from '../components/Accueil.vue';
import DeckBuilder from '../components/DeckBuilder.vue';
import Collection from '../components/Collection.vue';
import Test from '../components/Test.vue';

const routes = [
    {
        path: '/',
        redirect: '/accueil',
        history: false
    },
    {
        path: '/accueil',
        name: 'Accueil',
        component: Accueil,
        history: true
    },
    {
        path: '/deckbuilder',
        name: 'DeckBuilder',
        component: DeckBuilder,
        history: true
    },
    {
        path: '/collection',
        name: 'Collection',
        component: Collection,
        history: true
    },
    {
        path: '/test',
        name: 'Test',
        component: Test,
        history: false
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
