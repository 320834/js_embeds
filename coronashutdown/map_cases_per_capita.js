mapboxgl.accessToken =
"pk.eyJ1IjoiamF5eXpodSIsImEiOiJjanA3ZmtnaWoxb2VlM3FwN2VxaGNzamZ1In0.lyXwK7yHSlpWOSSfAXhFhA";

let start_date = new Date("02/28/2020");

let firstDate = start_date;
let today = new Date();

let start_date_format = "28.02.2020";
let display_date = format_date_display(new Date(today));
let selected_date = format_date_select(new Date(today));

let autoplayLoop = null;
let startup_loop = null;
let line_density = 0.4;

//Pause play variables
let pause = true
let value_left = 0
let use_input = false

let play_button_src = "https://raw.githubusercontent.com/jasonlzhu/COVID/master/Yellow_Play.png"

let pause_button_src = "https://raw.githubusercontent.com/jasonlzhu/COVID/master/Yellow_Pause.png"

//Auto loop fields, in milliseconds
let autoplay_loop_time = 800;
let delay_playloop_time = 4000;

//Density fields for interplation on map
let interpolation_min = 0;
let interpolation_max = 40;

//List for state data
let list_state_data = null

//Global variable to check if the data has been loading
let loaded_data_flag = false;

//Obj for different levels of cases
let inter_values = {
    value_one: 0,
    color_one: "rgba(18, 219, 112,0)",
    value_two: 10,
    color_two: "rgba(6, 148, 131,.3)", 
    value_three: 100,
    color_three: "rgba(105, 194, 16,.65)",
    value_four: 1000,
    color_four: "rgba(246, 255, 0,.93)"
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
    data:"https://raw.githubusercontent.com/320834/Geojson_data/master/counties-per-capita-cases.geojson"
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
    }
    );  // Place polygon under these labels.

    let hoverId = null;

    let popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
    });

    map.on("click", "county_layer", function(e) {
    console.log(e)
    });

    // Change it back to a pointer when it leaves.
    map.on("mouseleave", "county_layer", function() {
    map.getCanvas().style.cursor = "";

    popup.remove();
    });

    map.on("mousemove", "county_layer", function(e) {
        popup.remove()
        console.log(e)

        map.getCanvas().style.cursor = "cursor";

        var displayStr;

        if (e["features"][0]["properties"][selected_date] != undefined) {
            displayStr =
            e["features"][0]["properties"]["COUNTY"] +
            " County " + "(" + display_date + ")" +
            "<br>" +
            e["features"][0]["properties"][selected_date] +
            " Cases Per 100,000 People";
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

//Code for slider time
document.getElementById("slider-new").addEventListener("input", function(e) {

    use_input = true;
    document.getElementById("img_play_pause").src = play_button_src;
    pause = true;
    value_left = e.target.value;
    
    let millitime = start_date.getTime() + 86400000 * e.target.value;
    let dateObj = new Date(millitime);

    let filterDate = format_date_select(dateObj)
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

document.getElementById("slider-new").addEventListener("autoplay_slider", function(e) {
    let millitime = start_date.getTime() + 86400000 * e.target.value;
    let dateObj = new Date(millitime);

    let filterDate = format_date_select(dateObj)
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

document.getElementById("img_play_pause").addEventListener("click", function(){
	if(pause)
  {
		document.getElementById("img_play_pause").src = pause_button_src;
  	pause = false;

  }
  else
  {
		document.getElementById("img_play_pause").src = play_button_src;
    pause = true;

  }
})

//Code for autoplay

//Code to do autoplay as default
let index = days;
autoplayLoop = setInterval(function() {

	if(loaded_data_flag && !pause)
  {
  	if (index == days) {
      index = 0;
    }
    
    if(use_input)
    {
    	use_input = false;
      index = value_left;
    }

    index++;
    document.getElementById("slider-new").value = index;
    document.getElementById("slider-new").dispatchEvent(eventAuto);
  }
  
}, autoplay_loop_time);

startup_loop = setInterval(function(){
	loaded_data_flag = map.isSourceLoaded("county")
	if(loaded_data_flag)
  {
  	document.getElementById("active-date-new").innerText = display_date;
    clearInterval(startup_loop)
  }
  else
  {
  	document.getElementById("active-date-new").innerText = "Loading Data"
  }
}, 100)