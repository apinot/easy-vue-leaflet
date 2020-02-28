# easy-vue-leaflet
A vue.js component for an easier usage of Leaflet

**Contact me if you need more fonctionnalities by posting an issue on github**

## Table of content
 - [Installation](#Install)
 - [Usage](#Usage)
     - [Props](#Props)
         * [Options](#Options)
         * [Markers](#Markers)
         * [Circles](#Circles)
         * [Popup](#Popup)
     - [Events](#Events)
         * [Ready](#ready)
         * [View Changed](#viewchanged)
         * [Map Click](#mapclick)
         * [Marker Click](#markerclick)
         * [Marker In](#markerin)
         * [Marker Out](#markerout)
         * [Circle In](#circlein)
         * [Circle Out](#circleout)

## Install
How to install easy-vue-leaflet ?  
  
First, you need to import this module in your vue project with npm :
```
    npm install --save easy-vue-leaflet leaflet
```  
Then, go in your vue template and import the component in your Vue.js project and import the easy-vue-leaflet component like the code below.  
  
**Don't forget to set the whished start view in the options (View the [Options prop](#Options)).**   
**Don't forget to add the css import**  
  
```
<template>
    <div>
        <leaflet :options="options></leaflet>
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
            options : {
                view : {
                    lat: 48.5,
                    lng: 0.5,
                    zoom: 3,
                }
            }
            ...
        };
    },
    methods: { 
        ...
    }
}
</script>

<style>
    @import url('https://unpkg.com/leaflet@1.6.0/dist/leaflet.css');
</style>
```  
Now, you are ready to use it. Follow the [Usage section](#Usage) for more details.
You don't need to import any other CSS or JS file.  

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
                    lat : ..., // the latitude of the marker
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
The markers display is automatically refresh when array of markers change.  
But if you modify data in marker which was already added to the array, you should specify the update to 
easy-vue-leaflet by adding a property `updated: true` to the modified marker.
```
// Method call when markerin event (@markerin)
onMarkerIn(event) {
    const {marker} = event; // get the hovered marker
    marker.position.lat += 0.5; // add 0.5° to the latitude
    marker.position.lng -= 0.5; // remove 0.5° to the longitude
    marker.updated = true; // apply change 
}
```

#### Circles : 
`circles` is an array of circle object which contains :
```
<leaflet :circles="circles"></leaflet>

...
data() {
    return  {
        ...
        circles : [
            {
                ...,
                position : {
                    lat : ..., // the latitude of the marker
                    lng : ... // the longitude of the marker
                },
                radius: ... // the radius of the circle (in meters)
                ...
            },
            ...
        ]
        ...
    };
}
```
The circles display is automatically refresh when array of circles change.  
But if you modify data in circle which was already added to the array, you should specify the update to 
easy-vue-leaflet by adding a property `updated: true` to the modified circle.
```
// Method call when circlein event (@circlein)
onMarkerIn(event) {
    const {circle} = event; // get the hovered circle
    circle.radius += 2000; // add 2 km to his radius
    circle.updated = true; // apply change 
}
```

Circle have an **optional** property `color` to change the color of the circle.  
It can take a name of color : `red`, `blue`, `black`, ...  
or a hexa code : `#fff`, `#3388ff`, ...  
or you can set it to `null` to have the default color.   
  
You can set it to `*` or other invalid color to make a circle without border.

**By default color property is set to `#3388ff`**
```
...
data() {
    return  {
        ...
        circles : [
            {
                ...,
                position : { ... },
                radius: ... // the radius of the circle (in meters)
                color: 'red', // [optional] the color of the circle (#3388ff by default)
                ...
            },
            ...
        ]
        ...
    };
}
```

#### Popup
You can bind popup to markers and circles by adding to them a property `popup`.  
This property take some parameters : 
 - content : the content of the popup
 - show : if the popup is open or not (optional : true by default)

```
...
data() {
    return  {
        ...
        markers : [
            {
                ...,
                position : {
                    lat : ..., // the latitude of the marker
                    lng : ... // the longitude of the marker
                },
                popup: {
                    content: 'blou', // an open popup that have with the 'blou' text
                }
                ...
            },
            ...
        ],
        circles : [
            {
                ...,
                position : {
                    lat : ..., // the latitude of the marker
                    lng : ... // the longitude of the marker
                },
                radius: ..., // the radius of the circle (in meters)
                popup: { 
                    content: 'blou', // a popup that have with the 'blou' text
                    show: false, // set the popup closed
                }
                ...
            },
            ...
        ]
        ...
    };
}
```
**If you modify the state or the content of the popup** don't forget to set the proporty `updated` to `true` of the parent object (namely **the marker or the circle**)  
  
```
onMarkerIn(event) {
    const {marker} = event; // get the hovered marker
    marker.position.popup.show = true; //open the popup
    marker.updated = true; // apply change 
}
```

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
        NW: "54.188155,17.841797", // the north west postion in lat,lng format
        SE: "39.266284,13.579102", // the south east position in lat,lng format
        zoom: 5 // the new zoom level
    }
}
```

#### mapclick
`mapclick` event is fire when user click on the map, but not on a layer (like marker, etc ...).  
This is usefull to give the posibility to set a new marker for example.
This event return an object with a postion object, like this :
```
{
    position: {
        lat: 45.5, // the latitude of the click
        lng: 6.8 // the longitude of the click
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
                    lat : 45, // the latitude of the marker
                    lng : 5 // the longitude of the marker
                },
                color: black
            },
            {
                id: 2
                position : {
                    lat : 44, // the latitude of the marker
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
            lat : 45,
            lng : 5
        },
        color: black
    },
}
```
#### markerin : 
`markerin` event is fire when the mouse enter on a marker.
This event return the inital object with a marker field which contains the original object used to create the marker.  
For example, 
```
data() {
    return  {
        markers : [
            {
                id: 1
                position : {
                    lat : 45, // the latitude of the marker
                    lng : 5 // the longitude of the marker
                },
                color: black
            },
            {
                id: 2
                position : {
                    lat : 44, // the latitude of the marker
                    lng : 6 // the longitude of the marker
                },
                color: white
            },
        ]
    };
}
```
If you hover the first marker, you will have the object : 
```
{
    marker : {
        id: 1
        position : {
            lat : 45,
            lng : 5
        },
        color: black
    },
}
```
#### markerout : 
`markerout` event is fire when the mouse leave from a marker.
This event return the inital object with a marker field which contains the original object used to create the marker.  
For example, 
```
data() {
    return  {
        markers : [
            {
                id: 1
                position : {
                    lat : 45, // the latitude of the marker
                    lng : 5 // the longitude of the marker
                },
                color: black
            },
            {
                id: 2
                position : {
                    lat : 44, // the latitude of the marker
                    lng : 6 // the longitude of the marker
                },
                color: white
            },
        ]
    };
}
```
If you put out your mouse of the first marker, you will have the object : 
```
{
    marker : {
        id: 1
        position : {
            lat : 45,
            lng : 5
        },
        color: black
    },
}
```
#### circleclick : 
`circleclick` event is fire when the user click on a circle.
This event return the inital object with a marker field which contains the original object used to create the marker.  
For example, 
```
data() {
    return  {
        circles : [
            {
                id: 1
                position : {
                    lat : 45, // the latitude of the marker
                    lng : 5 // the longitude of the marker
                },
                radius: 10000,
            },
            {
                id: 2
                position : {
                    lat : 44, // the latitude of the marker
                    lng : 6 // the longitude of the marker
                },
                radius: 10000,
            },
        ]
    };
}
```
If you click on the first circle, you will have the object : 
```
{
    circle : {
        id: 1
        position : {
            lat : 45,
            lng : 5
        },
        radius: 10000,
    },
}
```
#### circlein : 
`circlein` event is fire when the mouse enter on a circle.
This event return the inital object with a circle field which contains the original object used to create the circle.  
For example, 
```
data() {
    return  {
        circles : [
            {
                id: 1
                position : {
                    lat : 45, // the latitude of the circle
                    lng : 5 // the longitude of the circle
                },
                radius: 10000 // the radius of the circle
            },
            {
                id: 2
                position : {
                    lat : 44, // the latitude of the circle
                    lng : 6 // the longitude of the circle
                },
                radius: 15000 // the radius of the circle
            },
        ]
    };
}
```
If you hover the first circle, you will have the object : 
```
{
    circle : {
        id: 1
        position : {
            lat : 45,
            lng : 5
        },
        radius: 10000 // the radius of the circle
    },
}
```
#### circleout : 
`circleout` event is fire when the mouse leave from a circle.
This event return the inital object with a circle field which contains the original object used to create the circle.  
For example, 
```
data() {
    return  {
        circles : [
            {
                id: 1
                position : {
                    lat : 45, // the latitude of the circle
                    lng : 5 // the longitude of the circle
                },
                radius: 10000 // the radius of the circle
            },
            {
                id: 2
                position : {
                    lat : 44, // the latitude of the circle
                    lng : 6 // the longitude of the circle
                },
                radius: 15000 // the radius of the circle
            },
        ]
    };
}
```
If you put out your mouse of the first circle, you will have the object : 
```
{
    circle : {
        id: 1
        position : {
            lat : 45,
            lng : 5
        },
        radius: 10000
    },
}
```