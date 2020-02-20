# easy-vue-leaflet
A vue.js component for an easier usage of Leaflet

**Contact me if you need more fonctionnalities by posting an issue on github**

## Table of content
 - [Installation](#Install)
 - [Usage](#Usage)
     - [Props](#Props)
         * [Options](#Options)
         * [Markers](#Markers)
     - [Events](#Events)
         * [Ready](#ready)
         * [View Changed](#viewchanged)
         * [Marker Click](#markerclick)
         * [Map Click](#mapclick)

## Install
How to install easy-vue-leaflet ?  
  
First, you need to import this module in your vue project with npm :
```
    npm install --save easy-vue-leaflet 
```  
Then, go in your vue template and import the component in your Vue.js project.
```
<template>
    <div>
        <leaflet></leaflet>
    </div>
</template>

<script>
import Leaflet from 'easy-vue-leaflet';

export default {
    name: ...,
    components: {
        Leaflet,
    },
    data() {
        return  {
            ...
        };
    },
    methods: { 
        ...
    }
}
</script>
```  
Now, you are ready to use it. Follow the [Usage section](#Usage) for more details.
You don't need to import any CSS or any other JS file.  

***Optional***  
By default, the leaflet map have a this size : 
 - width : 100%
 - height: 500px
 - z-index: 0
  
But your could redefine these properties by adding a style property and modify the `#leaflet` element.   
```
<template>...</template>

<script>...</script>

<style scoped>
    #leaflet {
        width: 50%;
        height: 90vh;
    }
</style>
```

## Usage 

### Props

#### Options :

`options` is an object with some parameters :
 * `view` define the initialisation view, it requires tree params : 
    * `lat`, the latitude of the center of the vue
    * `lng`, the longitude of the center of the vue 
    * `zoom`, the zoom level of the map
  
```
<leaflet :options="options"></leaflet>

...
data() {
    return  {
        ...
        options : {
            view : {
                lat: 48.5,
                lng: 0.5,
                zoom: 3,
            }
        }
        ...
    };
}
...
```

#### Markers : 
`markers` is an array of marker object which contains :
```
<leaflet :markers="markers"></leaflet>

...
data() {
    return  {
        ...
        markers : [
            {
                ...,
                position : {
                    lat : ... // the latitude of the marker
                    lng : ... // the longitude of the marker
                },
                ...
            },
            ...
        ]
        ...
    };
}
```
The markers display is automatically refresh when markers array change.

### Events

#### ready : 
`ready` event is fire when the map was being initialized and is ready to interract with it. 

#### viewchanged : 
`viewchanged` event is fire when zoom change or when map is moved. It is also fire at the initialisation state (after the [`ready`](#ready) event)
This event return an object with the new bounds and the new zoom level
Result :  
```
{
    view : {
        NW: "54.188155,17.841797" // the north west postion in lat,lng format
        SE: "39.266284,13.579102" // the south east position in lat,lng format
        zoom: 5 // the new zoom level
    }
}
```

#### markerclick : 
`markerclick` event is fire when the user click on a marker.
This event return the inital object with a marker field which contains the original object used to create the marker.  
For example, 
```
data() {
    return  {
        markers : [
            {
                id: 1
                position : {
                    lat : 45 // the latitude of the marker
                    lng : 5 // the longitude of the marker
                },
                color: black
            },
            {
                id: 2
                position : {
                    lat : 44 // the latitude of the marker
                    lng : 6 // the longitude of the marker
                },
                color: white
            },
        ]
    };
}
```
If you click on the first marker, you will have the object : 
```
{
    marker : {
        id: 1
        position : {
            lat : 45
            lng : 5
        },
        color: black
    },
}
```

#### mapclick
`mapclick` event is fire when user click on the map, but not on a layer (like marker, etc ...).  
This is usefull to give the posibility to set a new marker for example.
This event return an object with a postion object, like this :
```
{
    position: {
        lat: 45.5 // the latitude of the click
        lng: 6.8 // the longitude of the click
    }
}
```