import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/architects',
      name: 'Architects',
      component: () =>
        import(/* webpackChunkName: "Architects" */ './views/Architects.vue'),
    },
    {
      path: '/add-building',
      name: 'AddBuilding',
      component: () =>
        import(/* webpackChunkName: "AddBuilding" */ './views/AddBuilding.vue'),
    },
    {
      path: '/add-links',
      name: 'AddLinks',
      component: () =>
        import(/* webpackChunkName: "AddBuilding" */ './views/AddLinks.vue'),
    },
    {
      path: '/buildings',
      name: 'Buildings',
      component: () =>
        import(/* webpackChunkName: "Buildings" */ './views/Buildings.vue'),
    },
    {
      path: '/cities',
      name: 'Cities',
      component: () =>
        import(/* webpackChunkName: "Cities" */ './views/Cities.vue'),
    },
    {
      path: '/countries',
      name: 'Countries',
      component: () =>
        import(/* webpackChunkName: "Countries" */ './views/Countries.vue'),
    },
  ],
});
