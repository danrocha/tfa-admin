import Vue from 'vue';
import * as VueGoogleMaps from 'vue2-google-maps';
import { GmapAutocomplete } from 'vue2-google-maps/src/components/autocomplete';
import moment from 'moment';
import App from './App.vue';
import router from './router';
import { createProvider } from './vue-apollo';
import './assets/tailwind.css';
import vuetify from './plugins/vuetify';

Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
    libraries: 'places',
    installComponents: false,
    region: 'US',
    language: 'en',
  },
});
Vue.component('GmapAutocomplete', GmapAutocomplete);

Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(String(value)).format('DD.MMM.YY');
  }
});
Vue.filter('formatUrl', function(value) {
  if (value) {
    return value.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
  }
});

Vue.config.productionTip = false;

new Vue({
  router,
  apolloProvider: createProvider(),
  vuetify,
  render: h => h(App),
}).$mount('#app');
