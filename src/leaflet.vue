<template>
    <div id="leaflet"></div>
</template>

<script>
import L from 'leaflet';
export default {
    name: 'leaflet',
    props: ['options', 'markers', 'circles'],
    data() {
        return {
            map: null,
            markersLayer: null,
            markersData: [],
            circlesLayer: null,
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

        //init circles
        this.circlesLayer = L.layerGroup().addTo(this.map);
        this.setCircles();

        // init markers
        L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.6.0/dist/images/';
        this.markersLayer = L.layerGroup().addTo(this.map);
        this.addMarkers(this.compMarkers);

        // emit ready
        this.$emit('ready');
        this.onViewChange();
    },
    methods: {
        onViewChange() {
            const NW = `${this.map.getBounds().getNorthWest().lat},${this.map.getBounds().getNorthWest().lng}`;
            const SE = `${this.map.getBounds().getSouthEast().lat},${this.map.getBounds().getSouthEast().lng}`;
            const res = {
                view: {
                    NW,
                    SE,
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
        addMarkers(markers) {
            if(!markers || !markers.length || markers.length <= 0) return;
            markers.forEach((marker) => {
                const newMarker = L.marker([marker.position.lat, marker.position.lng]);

                // save trace in markerData
                this.markersData.push({data: marker, obj: newMarker});

                //click event
                newMarker.on('click', () => {
                    this.$emit('markerclick', {marker});
                });

                // mouse enter event
                newMarker.on('mouseover', () => {
                    this.$emit('markerin', {marker});
                });

                //mouse leave event
                newMarker.on('mouseout', () => {
                    this.$emit('markerout', {marker});
                });

                this.markersLayer.addLayer(newMarker);
            });
        },
        removeMarkers(markers) {
            if(!markers || !markers.length || markers.length <= 0) return;
            markers.forEach((marker) => {
                const {obj} = this.markersData.find(elem => elem.data === marker);
                console.log(obj);
                this.markersLayer.removeLayer(obj);
            });
        },
        setCircles() {
            this.circlesLayer.clearLayers();
            if(!this.circles || !this.circles.length || this.circles.length <= 0) return;
            this.circles.forEach((circle) => {
                const newCircle = L.circle([circle.position.lat, circle.position.lng], {radius: circle.radius});
                //click event
                newCircle.on('click', () => {
                    this.$emit('circleclick', {circle});
                });

                // mouse enter event
                newCircle.on('mouseover', () => {
                    this.$emit('circlein', {circle});
                });

                //mouse leave event
                newCircle.on('mouseout', () => {
                    this.$emit('circleout', {circle});
                });
                
                this.circlesLayer.addLayer(newCircle);
            });
        }
    },
    computed: {
        compMarkers() {
            if(!this.markers || !this.markers.length) return [];
            return this.markers.slice(0);
        },
        compCircles() {
            if(!this.circles || !this.circles.length) return [];
            return this.circles.slice(0);
        }
    },
    watch: {
        compMarkers: {
            handler(newMarker, oldMarker) {
                if(!oldMarker) oldMarker = [];
                if(!newMarker) newMarker = [];
                const toAdd = newMarker.filter(elem => !oldMarker.includes(elem));
                const toRemove = oldMarker.filter(elem => !newMarker.includes(elem));

                this.addMarkers(toAdd);
                this.removeMarkers(toRemove);
            },
            deep: true, 
        },
        circles: {
            handler(newCircle, oldCircle) {
                // if(!oldMarker) oldMarker = [];
                // if(!newMarker) newMarker = [];
                // const toAdd = newMarker.filter(elem => !oldMarker.includes(elem));
                // const toRemove = oldMarker.filter(elem => !newMarker.includes(elem));
                // console.log(toRemove);

                // this.addMarkers(toAdd);
                // this.removeMarkers(toRemove);
            },
            deep: true,
        }
    }
}
</script>

<style scoped>
#leaflet {
    height: 500px;
    z-index: 0;
}
</style>