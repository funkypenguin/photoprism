import Api from "common/api";
import Notify from "common/notify";
import Config from "common/config";
import Clipboard from "common/clipboard";
import Components from "component/components";
import Dialogs from "dialog/dialogs";
import Event from "pubsub-js";
import GetTextPlugin from "vue-gettext";
import Maps from "maps/components";
import PhotoPrism from "photoprism.vue";
import Router from "vue-router";
import Routes from "routes";
import Session from "session";
import {Settings} from "luxon";
import Socket from "common/websocket";
import Viewer from "common/viewer";
import Vue from "vue";
import Vuetify from "vuetify";
import VueLuxon from "vue-luxon";
import VueFilters from "vue2-filters";
import VueFullscreen from "vue-fullscreen";
import VueInfiniteScroll from "vue-infinite-scroll";

// Resources
import themes from "./resources/themes.json";
import translations from "./resources/translations.json";

// Initialize helpers
const config = new Config(window.localStorage, window.clientConfig);
const viewer = new Viewer();
const clipboard = new Clipboard(window.localStorage, "photo_clipboard");
const isPublic = config.getValue("public");

// Assign helpers to VueJS prototype
Vue.prototype.$event = Event;
Vue.prototype.$notify = Notify;
Vue.prototype.$viewer = viewer;
Vue.prototype.$session = Session;
Vue.prototype.$api = Api;
Vue.prototype.$socket = Socket;
Vue.prototype.$config = config;
Vue.prototype.$clipboard = clipboard;

// Theme config
const themeSetting = config.getValue("settings").theme;
const theme = themes[themeSetting] ? themes[themeSetting] : themes["default"];

// Register Vuetify
Vue.use(Vuetify, { theme });

Vue.config.language = "en";
Settings.defaultLocale = Vue.config.language;

// Register other VueJS plugins
Vue.use(GetTextPlugin, {translations: translations, silent: false, defaultLanguage: Vue.config.language});
Vue.use(VueLuxon);
Vue.use(VueInfiniteScroll);
Vue.use(VueFullscreen);
Vue.use(VueFilters);
Vue.use(Components);
Vue.use(Dialogs);
Vue.use(Maps);
Vue.use(Router);

// Configure client-side routing
const router = new Router({
    routes: Routes,
    mode: "history",
    saveScrollPosition: true,
});

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.admin)) {
        if (isPublic || Session.isAdmin()) {
            next();
        } else {
            next({
                name: "login",
                params: {nextUrl: to.fullPath},
            });
        }
    } else if (to.matched.some(record => record.meta.auth)) {
        if (isPublic || Session.isUser()) {
            next();
        } else {
            next({
                name: "login",
                params: {nextUrl: to.fullPath},
            });
        }
    } else {
        next();
    }
});

// Run app
new Vue({
    router,
    render: h => h(PhotoPrism),
}).$mount("#photoprism");
