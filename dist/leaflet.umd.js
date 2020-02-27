(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('leaflet')) :
    typeof define === 'function' && define.amd ? define(['exports', 'leaflet'], factory) :
    (global = global || self, factory(global.Leaflet = {}, global.L));
}(this, (function (exports, L) { 'use strict';

    L = L && L.hasOwnProperty('default') ? L['default'] : L;

    //
    var script = {
        name: 'leaflet',
        props: ['options', 'markers', 'circles'],
        data: function data() {
            return {
                map: null,
                markersLayer: null,
                markersData: [],
                circlesLayer: null,
                circlesData: [],
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

            //init circles
            this.circlesLayer = L.layerGroup().addTo(this.map);
            this.addCircles(this.compCircles);
            

            // init markers
            L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.6.0/dist/images/';
            this.markersLayer = L.layerGroup().addTo(this.map);
            this.addMarkers(this.compMarkers);

            // emit ready
            this.$emit('ready');
            this.onViewChange();
        },
        methods: {
            onViewChange: function onViewChange() {
                var NW = (this.map.getBounds().getNorthWest().lat) + "," + (this.map.getBounds().getNorthWest().lng);
                var SE = (this.map.getBounds().getSouthEast().lat) + "," + (this.map.getBounds().getSouthEast().lng);
                var res = {
                    view: {
                        NW: NW,
                        SE: SE,
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
            addMarkers: function addMarkers(markers) {
                var this$1 = this;

                if(!markers || !markers.length || markers.length <= 0) { return; }
                markers.forEach(function (marker) {
                    var newMarker = L.marker([marker.position.lat, marker.position.lng]);

                    // save trace in markerData
                    this$1.markersData.push({data: marker, obj: newMarker});

                    //click event
                    newMarker.on('click', function () {
                        this$1.$emit('markerclick', {marker: marker});
                    });

                    // mouse enter event
                    newMarker.on('mouseover', function () {
                        this$1.$emit('markerin', {marker: marker});
                    });

                    //mouse leave event
                    newMarker.on('mouseout', function () {
                        this$1.$emit('markerout', {marker: marker});
                    });

                    this$1.markersLayer.addLayer(newMarker);
                });
            },
            removeMarkers: function removeMarkers(markers) {
                var this$1 = this;

                if(!markers || !markers.length || markers.length <= 0) { return; }
                markers.forEach(function (marker) {
                    var data = this$1.markersData.find(function (elem, index) {
                        if(elem.data === marker){
                            elem.index = index;
                            return true;
                        }
                        return false;
                    });
                
                    this$1.markersLayer.removeLayer(data.obj);
                    this$1.markersData.splice(data.index, 1);
                });
            },
            addCircles: function addCircles(circles) {
                var this$1 = this;

                if(!circles || !circles.length || circles.length <= 0) { return; }
                circles.forEach(function (circle) {
                    var newCircle = L.circle([circle.position.lat, circle.position.lng], {radius: circle.radius});
                    
                    // save trace in circleData
                    this$1.circlesData.push({data: circle, obj: newCircle});
                    
                    //click event
                    newCircle.on('click', function () {
                        this$1.$emit('circleclick', {circle: circle});
                    });

                    // mouse enter event
                    newCircle.on('mouseover', function () {
                        this$1.$emit('circlein', {circle: circle});
                    });

                    //mouse leave event
                    newCircle.on('mouseout', function () {
                        this$1.$emit('circleout', {circle: circle});
                    });
                    
                    this$1.circlesLayer.addLayer(newCircle);
                });
            },
            removeCircles: function removeCircles(circles) {
                var this$1 = this;

                if(!circles || !circles.length || circles.length <= 0) { return; }
                circles.forEach(function (circle) {
                    var data = this$1.circlesData.find(function (elem, index) {
                        if(elem.data === circle){
                            elem.index = index;
                            return true;
                        }
                        return false;
                    });
                
                    this$1.circlesLayer.removeLayer(data.obj);
                    this$1.circlesData.splice(data.index, 1);
                });
            },
        },
        computed: {
            compMarkers: function compMarkers() {
                if(!this.markers || !this.markers.length) { return []; }
                return this.markers.slice(0);
            },
            compCircles: function compCircles() {
                if(!this.circles || !this.circles.length) { return []; }
                return this.circles.slice(0);
            }
        },
        watch: {
            compMarkers: {
                handler: function handler(newMarker, oldMarker) {
                    if(!oldMarker) { oldMarker = []; }
                    if(!newMarker) { newMarker = []; }
                    var toAdd = newMarker.filter(function (elem) { return !oldMarker.includes(elem); });
                    var toRemove = oldMarker.filter(function (elem) { return !newMarker.includes(elem); });

                    this.addMarkers(toAdd);
                    this.removeMarkers(toRemove);
                },
                deep: true, 
            },
            compCircles: {
                handler: function handler(newCircle, oldCircle) {
                    if(!oldCircle) { oldCircle = []; }
                    if(!newCircle) { newCircle = []; }
                    var toAdd = newCircle.filter(function (elem) { return !oldCircle.includes(elem); });
                    var toRemove = oldCircle.filter(function (elem) { return !newCircle.includes(elem); });

                    this.addCircles(toAdd);
                    this.removeCircles(toRemove);
                },
                deep: true,
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
        inject("data-v-bfff0cc2_0", { source: "\n#leaflet[data-v-bfff0cc2] {\n    height: 500px;\n    z-index: 0;\n}\n", map: {"version":3,"sources":["/home/antoine/npm-packages/easy-vue-leaflet/src/leaflet.vue"],"names":[],"mappings":";AA4LA;IACA,aAAA;IACA,UAAA;AACA","file":"leaflet.vue","sourcesContent":["<template>\n    <div id=\"leaflet\"></div>\n</template>\n\n<script>\nimport L from 'leaflet';\nexport default {\n    name: 'leaflet',\n    props: ['options', 'markers', 'circles'],\n    data() {\n        return {\n            map: null,\n            markersLayer: null,\n            markersData: [],\n            circlesLayer: null,\n            circlesData: [],\n        };\n    },\n    mounted() {\n        // init map \n        this.map = L.map('leaflet').setView([this.options.view.lat, this.options.view.lng], this.options.view.zoom);\n         L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {\n            attribution:\n                \"&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors\",\n        }).addTo(this.map);\n        this.map.on('zoomend', this.onViewChange);\n        this.map.on('dragend', this.onViewChange);\n        this.map.on('click', this.onMapClick);\n\n        //init circles\n        this.circlesLayer = L.layerGroup().addTo(this.map);\n        this.addCircles(this.compCircles);\n        \n\n        // init markers\n        L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.6.0/dist/images/';\n        this.markersLayer = L.layerGroup().addTo(this.map);\n        this.addMarkers(this.compMarkers);\n\n        // emit ready\n        this.$emit('ready');\n        this.onViewChange();\n    },\n    methods: {\n        onViewChange() {\n            const NW = `${this.map.getBounds().getNorthWest().lat},${this.map.getBounds().getNorthWest().lng}`;\n            const SE = `${this.map.getBounds().getSouthEast().lat},${this.map.getBounds().getSouthEast().lng}`;\n            const res = {\n                view: {\n                    NW,\n                    SE,\n                    zoom: this.map.getZoom(),\n                }\n            };\n            this.$emit('viewchanged', res);\n        },\n        onMapClick(event) {\n            const click = {\n                position : {\n                    lat: event.latlng.lat, \n                    lng: event.latlng.lng,\n                }\n            }\n            this.$emit('mapclick', click);\n        },\n        addMarkers(markers) {\n            if(!markers || !markers.length || markers.length <= 0) return;\n            markers.forEach((marker) => {\n                const newMarker = L.marker([marker.position.lat, marker.position.lng]);\n\n                // save trace in markerData\n                this.markersData.push({data: marker, obj: newMarker});\n\n                //click event\n                newMarker.on('click', () => {\n                    this.$emit('markerclick', {marker});\n                });\n\n                // mouse enter event\n                newMarker.on('mouseover', () => {\n                    this.$emit('markerin', {marker});\n                });\n\n                //mouse leave event\n                newMarker.on('mouseout', () => {\n                    this.$emit('markerout', {marker});\n                });\n\n                this.markersLayer.addLayer(newMarker);\n            });\n        },\n        removeMarkers(markers) {\n            if(!markers || !markers.length || markers.length <= 0) return;\n            markers.forEach((marker) => {\n                const data = this.markersData.find((elem, index) => {\n                    if(elem.data === marker){\n                        elem.index = index;\n                        return true;\n                    }\n                    return false;\n                });\n            \n                this.markersLayer.removeLayer(data.obj);\n                this.markersData.splice(data.index, 1);\n            });\n        },\n        addCircles(circles) {\n            if(!circles || !circles.length || circles.length <= 0) return;\n            circles.forEach((circle) => {\n                const newCircle = L.circle([circle.position.lat, circle.position.lng], {radius: circle.radius});\n                \n                // save trace in circleData\n                this.circlesData.push({data: circle, obj: newCircle});\n                \n                //click event\n                newCircle.on('click', () => {\n                    this.$emit('circleclick', {circle});\n                });\n\n                // mouse enter event\n                newCircle.on('mouseover', () => {\n                    this.$emit('circlein', {circle});\n                });\n\n                //mouse leave event\n                newCircle.on('mouseout', () => {\n                    this.$emit('circleout', {circle});\n                });\n                \n                this.circlesLayer.addLayer(newCircle);\n            });\n        },\n        removeCircles(circles) {\n            if(!circles || !circles.length || circles.length <= 0) return;\n            circles.forEach((circle) => {\n                const data = this.circlesData.find((elem, index) => {\n                    if(elem.data === circle){\n                        elem.index = index;\n                        return true;\n                    }\n                    return false;\n                });\n            \n                this.circlesLayer.removeLayer(data.obj);\n                this.circlesData.splice(data.index, 1);\n            });\n        },\n    },\n    computed: {\n        compMarkers() {\n            if(!this.markers || !this.markers.length) return [];\n            return this.markers.slice(0);\n        },\n        compCircles() {\n            if(!this.circles || !this.circles.length) return [];\n            return this.circles.slice(0);\n        }\n    },\n    watch: {\n        compMarkers: {\n            handler(newMarker, oldMarker) {\n                if(!oldMarker) oldMarker = [];\n                if(!newMarker) newMarker = [];\n                const toAdd = newMarker.filter(elem => !oldMarker.includes(elem));\n                const toRemove = oldMarker.filter(elem => !newMarker.includes(elem));\n\n                this.addMarkers(toAdd);\n                this.removeMarkers(toRemove);\n            },\n            deep: true, \n        },\n        compCircles: {\n            handler(newCircle, oldCircle) {\n                if(!oldCircle) oldCircle = [];\n                if(!newCircle) newCircle = [];\n                const toAdd = newCircle.filter(elem => !oldCircle.includes(elem));\n                const toRemove = oldCircle.filter(elem => !newCircle.includes(elem));\n\n                this.addCircles(toAdd);\n                this.removeCircles(toRemove);\n            },\n            deep: true,\n        }\n    }\n}\n</script>\n\n<style scoped>\n#leaflet {\n    height: 500px;\n    z-index: 0;\n}\n</style>"]}, media: undefined });

      };
      /* scoped */
      var __vue_scope_id__ = "data-v-bfff0cc2";
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

    exports.default = __vue_component__;
    exports.install = install;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
