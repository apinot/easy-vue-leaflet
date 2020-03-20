<template>
    <div id="leaflet"></div>
</template>

<script>
import L from 'leaflet';
export default {
    name: 'leaflet',
    props: ['options', 'markers', 'circles', 'disabled'],
    data() {
        return {
            map: null,
            markersLayer: null,
            markersData: [],
            circlesLayer: null,
            circlesData: [],
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
        this.addCircles(this.compCircles);
        

        // init markers
        L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.6.0/dist/images/';
        this.markersLayer = L.layerGroup().addTo(this.map);
        this.addMarkers(this.compMarkers);

        this.changeDisabled();

        // emit ready
        this.$emit('ready');
        this.onViewChange();
    },
    methods: {
        onViewChange() {
            const NW = `${this.map.getBounds().getNorthWest().lat},${this.map.getBounds().getNorthWest().lng}`;
            const SE = `${this.map.getBounds().getSouthEast().lat},${this.map.getBounds().getSouthEast().lng}`;
            const  {lat, lng} = this.map.getCenter();
            const res = {
                view: {
                    NW,
                    SE,
                    zoom: this.map.getZoom(),
                    center: {
                        lat,
                        lng,
                    },
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
                if(marker.updated) {
                    delete marker.updated;
                }

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

                //add Popup
                if(marker.popup) {
                    newMarker.bindPopup(
                        marker.popup.content,
                        {closeOnClick: false, closeButton: false, autoClose: false}
                    );

                    if(marker.popup.show !== false) {
                        newMarker.openPopup();
                    }
                }

            });
        },
        updateMarkers(markers) {
            if(!markers || !markers.length || markers.length <= 0) return;
            markers.forEach((marker) => {
                const data = this.markersData.find((elem) => {
                    if(elem.data === marker){
                        return true;
                    }
                    return false;
                });
            
                const layer = data.obj;
                //postion
                layer.setLatLng(L.latLng(marker.position.lat, marker.position.lng));
                
                //popup
                if(marker.popup) {
                    layer.setPopupContent(
                        marker.popup.content
                    );

                    if(marker.popup.show !== false) {
                        layer.openPopup();
                    }else {
                        layer.closePopup();
                    }
                }else{
                    layer.unbindPopup();
                }
            });
        },
        removeMarkers(markers) {
            if(!markers || !markers.length || markers.length <= 0) return;
            markers.forEach((marker) => {
                const data = this.markersData.find((elem, index) => {
                    if(elem.data === marker){
                        elem.index = index;
                        return true;
                    }
                    return false;
                });
            
                this.markersLayer.removeLayer(data.obj);
                this.markersData.splice(data.index, 1);
            });
        },
        addCircles(circles) {
            if(!circles || !circles.length || circles.length <= 0) return;
            circles.forEach((circle) => {
                //style of circle
                const color = circle.color || '#3388ff';

                const newCircle = L.circle([circle.position.lat, circle.position.lng], {radius: circle.radius, color});
                
                // save trace in circleData
                this.circlesData.push({data: circle, obj: newCircle});
                if(circle.updated) {
                    delete circle.updated;
                }
                
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

                //add Popup
                if(circle.popup) {
                    newCircle.bindPopup(
                        circle.popup.content,
                        {closeOnClick: false, closeButton: false, autoClose: false}
                    );

                    if(circle.popup.show !== false) {
                        newCircle.openPopup();
                    }
                }
            });
        },
        updateCircles(circles) {
            if(!circles || !circles.length || circles.length <= 0) return;
            circles.forEach((circle) => {
                const data = this.circlesData.find((elem) => {
                    if(elem.data === circle){
                        return true;
                    }
                    return false;
                });
                const layer = data.obj;
                layer.setRadius(circle.radius);
                layer.setLatLng(L.latLng(circle.position.lat, circle.position.lng));

                //update style
                const color = circle.color || '#3388ff';
                layer.setStyle({color});

                //popup
                if(circle.popup) {
                    layer.setPopupContent(
                        circle.popup.content
                    );

                    if(circle.popup.show !== false) {
                        layer.openPopup();
                    }else {
                        layer.closePopup();
                    }
                }else{
                    layer.unbindPopup();
                }
            });
        },
        removeCircles(circles) {
            if(!circles || !circles.length || circles.length <= 0) return;
            circles.forEach((circle) => {
                const data = this.circlesData.find((elem, index) => {
                    if(elem.data === circle){
                        elem.index = index;
                        return true;
                    }
                    return false;
                });
            
                this.circlesLayer.removeLayer(data.obj);
                this.circlesData.splice(data.index, 1);
            });
        },
        changeDisabled() {
            if(!!this.disabled) {
                this.map.dragging.disable();
                this.map.touchZoom.disable();
                this.map.doubleClickZoom.disable();
                this.map.scrollWheelZoom.disable();
                this.map.boxZoom.disable();
                this.map.keyboard.disable();
                if (this.map.tap) this.map.tap.disable();
            }else{
                this.map.dragging.enable();
                this.map.touchZoom.enable();
                this.map.doubleClickZoom.enable();
                this.map.scrollWheelZoom.enable();
                this.map.boxZoom.enable();
                this.map.keyboard.enable();
                if (this.map.tap) this.map.tap.enable();
            }
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
        disabled: {
            handler() {
                this.changeDisabled();
            },
        },
        compMarkers: {
            handler(newMarker, oldMarker) {
                if(!oldMarker) oldMarker = [];
                if(!newMarker) newMarker = [];
                const toAdd = newMarker.filter(elem => !oldMarker.includes(elem));
                const toRemove = oldMarker.filter(elem => !newMarker.includes(elem));

                const toUpdate = newMarker.filter(elem => elem.updated);
                this.updateMarkers(toUpdate);

                this.addMarkers(toAdd);
                this.removeMarkers(toRemove);
            },
            deep: true, 
        },
        compCircles: {
            handler(newCircle, oldCircle) {
                if(!oldCircle) oldCircle = [];
                if(!newCircle) newCircle = [];
                const toAdd = newCircle.filter(elem => !oldCircle.includes(elem));
                const toRemove = oldCircle.filter(elem => !newCircle.includes(elem));

                const toUpdate = newCircle.filter(elem => elem.updated);

                this.addCircles(toAdd);
                this.removeCircles(toRemove);
                this.updateCircles(toUpdate);
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