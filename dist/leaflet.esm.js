import L from 'leaflet';

//
var script = {
    name: 'leaflet',
    props: ['options', 'markers'],
    data: function data() {
        return {
            map: null,
            markersLayer: null,
        };
    },
    mounted: function mounted() {
        // init map 
        this.map = L.map('leaflet').setView([this.options.view.lat, this.options.view.lng], this.options.view.zoom);
         L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution:
                "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
        }).addTo(this.map);
        this.map.on('zoomend', this.onViewChange);
        this.map.on('dragend', this.onViewChange);
        this.map.on('click', this.onMapClick);
        // init markers
        L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.6.0/dist/images/';
        this.markersLayer = L.layerGroup().addTo(this.map);
        this.setMarkers();
        // emit ready
        this.$emit('ready');
        this.onViewChange();
    },
    methods: {
        onViewChange: function onViewChange() {
            var res = {
                view: {
                    NW: this.map.getBounds().getNorthWest().toString().match(/\d+[.]?\d+/g).join(','),
                    SE: this.map.getBounds().getSouthEast().toString().match(/\d+[.]?\d+/g).join(','),
                    zoom: this.map.getZoom(),
                }
            };
            this.$emit('viewchanged', res);
        },
        onMapClick: function onMapClick(event) {
            var click = {
                position : {
                    lat: event.latlng.lat, 
                    lng: event.latlng.lng,
                }
            };
            this.$emit('mapclick', click);
        },
        setMarkers: function setMarkers() {
            var this$1 = this;

            this.markersLayer.clearLayers();
            if(!this.markers || !this.markers.length || this.markers.length <= 0) { return; }
            this.markers.forEach(function (marker) {
                var newMarker = L.marker([marker.position.lat, marker.position.lng]);
                newMarker.on('click', function () {
                    this$1.$emit('markerclick', {marker: marker});
                });
                this$1.markersLayer.addLayer(newMarker);
            });
        }
    },
    watch: {
        markers: function markers() {
            this.setMarkers();
        }
    }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    var options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    var hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            var originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

var isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return function (id, style) { return addStyle(id, style); };
}
var HEAD;
var styles = {};
function addStyle(id, css) {
    var group = isOldIE ? css.media || 'default' : id;
    var style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        var code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                { style.element.setAttribute('media', css.media); }
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            var index = style.ids.size - 1;
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index])
                { style.element.removeChild(nodes[index]); }
            if (nodes.length)
                { style.element.insertBefore(textNode, nodes[index]); }
            else
                { style.element.appendChild(textNode); }
        }
    }
}

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { attrs: { id: "leaflet" } })
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-33addcff_0", { source: "\n@import url('https://unpkg.com/leaflet@1.6.0/dist/leaflet.css');\n#leaflet[data-v-33addcff] {\n    height: 500px;\n    z-index: 0;\n}\n", map: {"version":3,"sources":["/home/antoine/npm-packages/easy-vue-leaflet/src/leaflet.vue"],"names":[],"mappings":";AA0EA,+DAAA;AACA;IACA,aAAA;IACA,UAAA;AACA","file":"leaflet.vue","sourcesContent":["<template>\n    <div id=\"leaflet\"></div>\n</template>\n\n<script>\nimport L from 'leaflet';\nexport default {\n    name: 'leaflet',\n    props: ['options', 'markers'],\n    data() {\n        return {\n            map: null,\n            markersLayer: null,\n        };\n    },\n    mounted() {\n        // init map \n        this.map = L.map('leaflet').setView([this.options.view.lat, this.options.view.lng], this.options.view.zoom);\n         L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {\n            attribution:\n                \"&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors\",\n        }).addTo(this.map);\n        this.map.on('zoomend', this.onViewChange);\n        this.map.on('dragend', this.onViewChange);\n        this.map.on('click', this.onMapClick);\n        // init markers\n        L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.6.0/dist/images/';\n        this.markersLayer = L.layerGroup().addTo(this.map);\n        this.setMarkers();\n        // emit ready\n        this.$emit('ready');\n        this.onViewChange();\n    },\n    methods: {\n        onViewChange() {\n            const res = {\n                view: {\n                    NW: this.map.getBounds().getNorthWest().toString().match(/\\d+[.]?\\d+/g).join(','),\n                    SE: this.map.getBounds().getSouthEast().toString().match(/\\d+[.]?\\d+/g).join(','),\n                    zoom: this.map.getZoom(),\n                }\n            };\n            this.$emit('viewchanged', res);\n        },\n        onMapClick(event) {\n            const click = {\n                position : {\n                    lat: event.latlng.lat, \n                    lng: event.latlng.lng,\n                }\n            }\n            this.$emit('mapclick', click);\n        },\n        setMarkers() {\n            this.markersLayer.clearLayers();\n            if(!this.markers || !this.markers.length || this.markers.length <= 0) return;\n            this.markers.forEach((marker) => {\n                const newMarker = L.marker([marker.position.lat, marker.position.lng]);\n                newMarker.on('click', () => {\n                    this.$emit('markerclick', {marker});\n                });\n                this.markersLayer.addLayer(newMarker);\n            });\n        }\n    },\n    watch: {\n        markers() {\n            this.setMarkers();\n        }\n    }\n}\n</script>\n\n<style scoped>\n@import url('https://unpkg.com/leaflet@1.6.0/dist/leaflet.css');\n#leaflet {\n    height: 500px;\n    z-index: 0;\n}\n</style>"]}, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-33addcff";
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__ = normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

// Import vue component

// Declare install function executed by Vue.use()
function install(Vue) {
	if (install.installed) { return; }
	install.installed = true;
	Vue.component('Leaflet', __vue_component__);
}

// Create module definition for Vue.use()
var plugin = {
	install: install,
};

// Auto-install when vue is found (eg. in browser via <script> tag)
var GlobalVue = null;
if (typeof window !== 'undefined') {
	GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
	GlobalVue = global.Vue;
}
if (GlobalVue) {
	GlobalVue.use(plugin);
}

export default __vue_component__;
export { install };
