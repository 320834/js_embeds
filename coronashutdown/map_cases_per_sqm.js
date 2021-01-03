mapboxgl.accessToken =
  "pk.eyJ1IjoiamF5eXpodSIsImEiOiJjazltNWY5MzAwamhuM21sNTVyYjFpaThzIn0.3dwMp5OMNBeUDhSNO_2rjg";

/* mapboxgl.accessToken = "pk.eyJ1IjoieWVsbG93cGFuZGEiLCJhIjoiY2s4cm4ybmI0MGR5YjNucTViNW92emF3ZiJ9.NzPSHQ2FV49jPZtaK19EKg" */

let start_date = new Date("02/28/2020");

let firstDate = start_date;
let today = new Date();

let start_date_format = "28.02.2020";
let display_date = format_date_display(new Date(today));
let selected_date = format_date_select(new Date(today));

let autoplayLoop = null;
let startup_loop = null;
let line_density = 1;

//Pause play variables
let pause = true;
let value_left = 0;
let use_input = false;

let play_button_src =
  "https://raw.githubusercontent.com/jasonlzhu/COVID/master/Yellow_Play.png";
let pause_button_src =
  "https://raw.githubusercontent.com/jasonlzhu/COVID/master/Yellow_Pause.png";

//Auto loop fields, in milliseconds
let autoplay_loop_time = 800;
let delay_playloop_time = 4000;

//Density fields for interplation on map
let interpolation_min = 0;
let interpolation_max = 40;

//Global variable to check if the data has been loading
let loaded_data_flag = false;

//Obj for different levels of cases
let inter_values = {
  value_one: 0,
  color_one: "rgba(18, 219, 112,.0)",
  value_two: 0.1,
  color_two: "rgba(6, 148, 131,.5)",
  value_three: 1,
  color_three: "rgba(20, 184, 26,.8)",
  value_four: 10,
  color_four: "rgba(246, 255, 0,.9)"
};

let eventAuto = new Event("autoplay_slider");

//=================================================================================
function format_date_display(dateObj) {
  let date = "";
  let month = parseInt(dateObj.getMonth()) + 1;
  let year = dateObj.getFullYear();

  if (parseInt(dateObj.getDate()) < 10) {
    date = "0" + dateObj.getDate();
  } else {
    date = dateObj.getDate();
  }

  if (month == 1) {
    month = "Jan"
  } else if (month == 2) {
    month = "Feb";
  } else if (month == 3) {
    month = "Mar";
  } else if (month == 4) {
    month = "Apr";
  } else if (month == 5) {
    month = "May";
  } else if (month == 6) {
    month = "June";
  } else if (month == 7) {
    month = "Jul";
  } else if (month == 8) {
    month = "Aug";
  } else if (month == 9) {
    month = "Sept";
  } else if (month == 10) {
    month = "Oct";
  } else if (month == 11) {
    month = "Nov";
  } else if (month == 12) {
    month = "Dec";
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
let days = Math.floor((today - firstDate) / 1000 / 60 / 60 / 24);

document.getElementById("active-date-new").innerText = display_date;
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
  style: "mapbox://styles/jayyzhu/ck8hxjyyb07n91imsf1nbqhc7?optimize=true", // stylesheet location
  /* style: "mapbox://styles/yellowpanda/ck8rojb760vfl1inxfk8hlkco", */
  /* style: "mapbox://styles/mapbox/streets-v11", */
  center: [-100.04, 38.907],
  zoom: 3
});

map.on("load", () => {
  map.addSource("county", {
    type: "geojson",
    data:
      "https://raw.githubusercontent.com/320834/Geojson_data/master/counties-per-sqm-cases.geojson"
    /* data: "mapbox://tileset-source/yellowpanda/11b83i88" */
    /* url: "https://js-css-hoster.herokuapp.com/out.mbtiles" */
    /* data: "mapbox://mapbox.2opop9hr" */
  });

  map.addLayer(
    {
      id: "county_layer",
      type: "fill",
      source: "county",
      paint: {
        "fill-outline-color": "rgba(45, 57, 67," + line_density + ")",
        //'rgba(255,180,255,1)'
        "fill-color": [
          "interpolate",
          ["linear"],
          ["number", ["get", selected_date], -1],
          inter_values.value_one,
          inter_values.color_one,
          inter_values.value_two,
          inter_values.color_two,
          inter_values.value_three,
          inter_values.color_three,
          inter_values.value_four,
          inter_values.color_four
        ],
        "fill-opacity": 1
      }
    }
    /* 'settlement-label' */
  ); // Place polygon under these labels.

  let popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on("click", "county_layer", function(e) {});

  // Change it back to a pointer when it leaves.
  map.on("mouseleave", "county_layer", function() {
    map.getCanvas().style.cursor = "";

    popup.remove();
  });

  map.on("mousemove", "county_layer", function(e) {
    popup.remove();

    map.getCanvas().style.cursor = "cursor";

    var displayStr;

    if (e["features"][0]["properties"][selected_date] != undefined) {
      displayStr =
        e["features"][0]["properties"]["NAME"] +
        " County " +
        "(" +
        display_date +
        ")" +
        "<br>" +
        e["features"][0]["properties"][selected_date] +
        " Cases Per Sq Mile";
    } else {
      displayStr =
        e["features"][0]["properties"]["NAME"] +
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

  let filterDate = format_date_select(dateObj);
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
});

document
  .getElementById("slider-new")
  .addEventListener("autoplay_slider", function(e) {
    /* if(use_input)
    	      {
    	        document.getElementById("slider-new").value = value_left;
    	        use_input = false
    	      } */

    console.log("Autoplay: " + e.target.value);

    let millitime = start_date.getTime() + 86400000 * e.target.value;
    let dateObj = new Date(millitime);

    let filterDate = format_date_select(dateObj);
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
  });

document.getElementById("img_play_pause").addEventListener("click", function() {
  if (pause) {
    document.getElementById("img_play_pause").src = pause_button_src;
    pause = false;
  } else {
    document.getElementById("img_play_pause").src = play_button_src;
    pause = true;
  }
});

window.addEventListener("resize", function(e) {
  /* document.getElementById("left-wrapper-id").style["margin-top"] =  */

  if (document.documentElement.clientWidth < 1180) {
    document.getElementById("left-wrapper-id").style["margin-top"] = "90vh";
  } else {
    document.getElementById("left-wrapper-id").style["margin-top"] = "12vh";
  }
});

//Code for autoplay

//Code to do autoplay as default
let index = days;

//A delay to make sure the person loads the page first before autoplaying

autoplayLoop = setInterval(function() {
  if (loaded_data_flag && !pause) {
    if (index == days) {
      index = 0;
    }

    if (use_input) {
      use_input = false;
      index = value_left;
    }

    index++;
    document.getElementById("slider-new").value = index;
    document.getElementById("slider-new").dispatchEvent(eventAuto);
  }
}, autoplay_loop_time);

startup_loop = setInterval(function() {
  loaded_data_flag = map.isSourceLoaded("county");
  if (loaded_data_flag) {
    document.getElementById("active-date-new").innerText = display_date;
    clearInterval(startup_loop);
  } else {
    document.getElementById("active-date-new").innerText = "Loading Data";
  }
}, 100);

let triggerUp = false;
