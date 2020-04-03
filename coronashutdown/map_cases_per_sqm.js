mapboxgl.accessToken =
"pk.eyJ1IjoiamF5eXpodSIsImEiOiJjanA3ZmtnaWoxb2VlM3FwN2VxaGNzamZ1In0.lyXwK7yHSlpWOSSfAXhFhA";

let start_date = new Date("02/28/2020");

let firstDate = start_date;
let today = new Date();

let start_date_format = "28.02.2020";
let display_date = format_date_display(new Date(today));
let selected_date = format_date_select(new Date(today));

let autoplayLoop = null;
let line_density = 0.4;

//Auto loop fields, in milliseconds
let autoplay_loop_time = 800;
let delay_playloop_time = 4000;

//Density fields for interplation on map
let interpolation_min = 0;
let interpolation_max = 40;

//List for state data
let list_state_data = null

//Obj for different levels of cases
let inter_values = {
    value_one: 0,
    color_one: 'rgba(35, 46, 57,.25)',
    value_two: 0.1,
    color_two: 'rgba(66, 49, 122, .7)',
    value_three: 1,
    color_three: "rgba(240, 79, 105, .85)",
    value_four: 10,
    color_four: "rgba(254, 246, 138, .95)"
}

let eventAuto = new Event("autoplay_slider");

//=================================================================================
function array_compare_sort(obj1, obj2)
{
    if(obj1["confirmed"] > obj2["confirmed"])
    {
    return -1;
    }
    else
    {
    return 1;
    }
}

function format_date_display(dateObj) {
    let date = "";
    let month = parseInt(dateObj.getMonth()) + 1;
    let year = dateObj.getFullYear();

    if (parseInt(dateObj.getDate()) < 10) {
    date = "0" + dateObj.getDate();
    } else {
    date = dateObj.getDate();
    }

    if (month == 2) {
    month = "Feb";
    } else if (month == 3) {
    month = "Mar";
    } else if (month == 4) {
    month = "Apr";
    }
    return month + "\t" + date;
}

function format_date_select(dateObj) {
    let date = "";
    let month = parseInt(dateObj.getMonth()) + 1;
    let year = dateObj.getFullYear();

    if (parseInt(dateObj.getDate()) < 10) {
    date = "0" + dateObj.getDate();
    } else {
    date = dateObj.getDate();
    }

    if (month < 10) {
    month = "0" + month;
    }

    return date + "." + month + "." + year;
}


//=================================================================================

document.getElementById("active-date-new").innerText = display_date;

let days = Math.floor((today - firstDate) / 1000 / 60 / 60 / 24);

document.getElementById("slider-new").max = days;
document.getElementById("slider-new").value = days;

if (screen.width <= 500) {
    line_density = 0.8;
}

if (screen.width >= 500) {
    line_density = 0.35;
}

const map = new mapboxgl.Map({
    container: "map", // container id
    style: "mapbox://styles/jayyzhu/ck8hxjyyb07n91imsf1nbqhc7", // stylesheet location
    center: [-100.04, 38.907],
    zoom: 3
});

map.on("load", () => {
    map.addSource("county", {
    type: "geojson",
    data:"https://raw.githubusercontent.com/320834/Geojson_data/master/counties-per-sqm-cases.geojson"
    /* data: "https://raw.githubusercontent.com/320834/Geojson_data/master/counties-per-capita-cases.geojson" */
    });

    map.addLayer({
        'id': 'county_layer',
        'type': 'fill',
        'source': 'county',
        'paint': {
        'fill-outline-color': 'rgba(45, 57, 67,' + line_density + ')',
        //'rgba(255,180,255,1)'
        'fill-color': [
            'interpolate',
            ['linear'],
            ['number', ["get", selected_date], -1],
            inter_values.value_one,
            inter_values.color_one,
            inter_values.value_two,
            inter_values.color_two,
            inter_values.value_three,
            inter_values.color_three,
            inter_values.value_four,
            inter_values.color_four,
        ],
        "fill-opacity": 1
        }
    },
    /* 'settlement-label' */
    );  // Place polygon under these labels.

    //Code for slider time
    document.getElementById("slider-new").addEventListener("input", function(e) {
    clearInterval(autoplayLoop);

    let millitime = start_date.getTime() + 86400000 * e.target.value;
    let dateObj = new Date(millitime);

    let date = "";
    let month = parseInt(dateObj.getMonth()) + 1;
    let year = dateObj.getFullYear();

    if (parseInt(dateObj.getDate()) < 10) {
        date = "0" + dateObj.getDate();
    } else {
        date = dateObj.getDate();
    }

    if (month < 10) {
        month = "0" + month;
    }

    let filterDate = date + "." + month + "." + year;
    // display_date = month + "/" + date + "/" + year;
    display_date = format_date_display(dateObj);

    selected_date = filterDate;

    //Setting the property of county for each date
    map.setPaintProperty("county_layer", "fill-color", [
        "interpolate",
        ["linear"],
        ["number", ["get", filterDate], -1],
        inter_values.value_one,
        inter_values.color_one,
        inter_values.value_two,
        inter_values.color_two,
        inter_values.value_three,
        inter_values.color_three,
        inter_values.value_four,
        inter_values.color_four
    ]);

    document.getElementById("active-date-new").innerText = display_date;

    const myNode = document.getElementsByClassName("collection-list w-dyn-items")[0];
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }

    load_data(filterDate)
    });

    document
    .getElementById("slider-new")
    .addEventListener("autoplay_slider", function(e) {
        let millitime = start_date.getTime() + 86400000 * e.target.value;
        let dateObj = new Date(millitime);

        let date = "";
        let month = parseInt(dateObj.getMonth()) + 1;
        let year = dateObj.getFullYear();

        if (parseInt(dateObj.getDate()) < 10) {
        date = "0" + dateObj.getDate();
        } else {
        date = dateObj.getDate();
        }

        if (month < 10) {
        month = "0" + month;
        }

        let filterDate = date + "." + month + "." + year;
        display_date = format_date_display(dateObj);

        selected_date = filterDate;

        //Setting the property of county for each date
        map.setPaintProperty("county_layer", "fill-color", [
        "interpolate",
        ["linear"],
        ["number", ["get", filterDate], -1],
        inter_values.value_one,
        inter_values.color_one,
        inter_values.value_two,
        inter_values.color_two,
        inter_values.value_three,
        inter_values.color_three,
        inter_values.value_four,
        inter_values.color_four,
        ]);

        document.getElementById("active-date-new").innerText = display_date;

        const myNode = document.getElementsByClassName("collection-list w-dyn-items")[0];
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }

    load_data(filterDate)
    });

    let hoverId = null;

    let popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
    });

    map.on("click", "county_layer", function(e) {
    /* console.log(e) */
    });

    // Change it back to a pointer when it leaves.
    map.on("mouseleave", "county_layer", function() {
    map.getCanvas().style.cursor = "";

    popup.remove();
    });

    map.on("mousemove", "county_layer", function(e) {
    /* popup.remove() */
    /* console.log(e) */

    map.getCanvas().style.cursor = "cursor";

    var displayStr;

    if (e["features"][0]["properties"][selected_date] != undefined) {
        displayStr =
        e["features"][0]["properties"]["COUNTY"] +
        " County" +
        "<br>" +
        e["features"][0]["properties"][selected_date] +
        " Cases Per Ten-Thousand Capita " +
        "(" +
        display_date +
        ")";
    } else {
        displayStr =
        e["features"][0]["properties"]["COUNTY"] +
        " County" +
        "<br>" +
        "Dataset not available for this date " +
        "(" +
        display_date +
        ")";
    }

    popup
        .setLngLat(e.lngLat)
        .setHTML(displayStr)
        .addTo(map);
    });
});

//Code for autoplay

//Code to do autoplay as default
let index = days;
setTimeout(function() {
    autoplayLoop = setInterval(function() {

    if (index == days) {
        index = 0;
    }

    index++;
    document.getElementById("slider-new").value = index;
    document.getElementById("slider-new").dispatchEvent(eventAuto);
    }, autoplay_loop_time);
}, delay_playloop_time);