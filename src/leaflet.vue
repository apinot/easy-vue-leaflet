<template>
    <div id="leaflet"></div>
</template>

<script>
import L from 'leaflet';
export default {
    name: 'leaflet',
    props: ['options', 'markers'],
    data() {
        return {
            map: null,
            markersLayer: null,
        };
    },
    mounted() {
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
        onViewChange() {
            const res = {
                view: {
                    NW: this.map.getBounds().getNorthWest().toString().match(/\d+[.]?\d+/g).join(','),
                    SE: this.map.getBounds().getSouthEast().toString().match(/\d+[.]?\d+/g).join(','),
                    zoom: this.map.getZoom(),
                }
            };
            this.$emit('viewchanged', res);
        },
        onMapClick(event) {
            const click = {
                position : {
                    lat: event.latlng.lat, 
                    lng: event.latlng.lng,
                }
            }
            this.$emit('mapclick', click);
        },
        setMarkers() {
            this.markersLayer.clearLayers();
            if(!this.markers || !this.markers.length || this.markers.length <= 0) return;
            this.markers.forEach((marker) => {
                const newMarker = L.marker([marker.position.lat, marker.position.lng]);
                newMarker.on('click', () => {
                    this.$emit('markerclick', {marker});
                });
                this.markersLayer.addLayer(newMarker);
            });
        }
    },
    watch: {
        markers() {
            this.setMarkers();
        }
    }
}
</script>

<style scoped>
@import url('https://unpkg.com/leaflet@1.6.0/dist/leaflet.css');
#leaflet {
    height: 500px;
    z-index: 0;
}
</style>