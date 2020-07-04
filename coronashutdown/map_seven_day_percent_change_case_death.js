mapboxgl.accessToken =
  "pk.eyJ1IjoiamF5eXpodSIsImEiOiJjazltNWY5MzAwamhuM21sNTVyYjFpaThzIn0.3dwMp5OMNBeUDhSNO_2rjg";

let start_date = new Date("02/28/2020");

let firstDate = start_date;
let today = new Date();

let start_date_format = "28.02.2020";
let display_date = format_date_display(new Date(today));
let selected_date = format_date_select(new Date(today));

let autoplayLoop = null;
let startup_loop = null;
let line_density = 0.1;

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

//List for state data
let list_state_data = null;

//Global variable to check if the data has been loading
let loaded_data_flag = false;

//Global variable to toggle between 7 day average for deaths or cases
//True - Toggle Cases
//False - Toggle Deaths
let cases_toggle = true

//Obj for different levels of cases
let cases_inter_values = {
  value_one: 0,
  color_one: "rgba(255, 187, 0,0)",
  value_two: 0.1,
  color_two: "rgba(255, 187, 0,.65)", 
  value_three: 0.2,
  color_three: "rgba(255, 37, 4,.65)",
  value_four: 0.3,
  color_four: "rgba(255, 37, 4,.75)"
};

let deaths_inter_values = {
	value_one: 0,
  color_one: "rgba(21, 31, 37, 0)",
  value_two: 0.1,
  color_two: "rgba(22, 42, 196, .18)",
  value_three: 0.2,
  color_three: "rgba(36, 187, 237, .45)",
  value_four: 0.3,
  color_four: "rgba(20, 255, 204, .85)"
}

let eventAuto = new Event("autoplay_slider");

//=================================================================================
function array_compare_sort(obj1, obj2) {
  if (obj1["confirmed"] > obj2["confirmed"]) {
    return -1;
  } else {
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
  // mapbox://styles/jayyzhu/ck7pqm66o0aja1is18jtymybb?optimize=true
  // mapbox://styles/jayyzhu/ck8hxjyyb07n91imsf1nbqhc7
  style: "mapbox://styles/jayyzhu/ck7pqm66o0aja1is18jtymybb?optimize=true", // stylesheet location
  center: [-100.04, 38.907],
  zoom: 3
});

map.on("load", () => {
  map.addSource("county", {
    type: "geojson",
    data:
      "https://raw.githubusercontent.com/320834/Geojson_data/master/counties-average.geojson"
  });

  map.addLayer({
    id: "county_layer",
    type: "fill",
    source: "county",
    paint: {
      "fill-outline-color": "rgba(216, 216, 216," + line_density + ")",
      //'rgba(255,180,255,1)'
      "fill-color": [
        "interpolate",
        ["linear"],
        ["number", ["get", selected_date], -1],
        cases_inter_values.value_one,
        cases_inter_values.color_one,
        cases_inter_values.value_two,
        cases_inter_values.color_two,
        cases_inter_values.value_three,
        cases_inter_values.color_three,
        cases_inter_values.value_four,
        cases_inter_values.color_four
      ],
      "fill-opacity": 1
    }
  }); // Place polygon under these labels.

  let hoverId = null;

  let popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on("click", "county_layer", function(e) {
    
  });

  // Change it back to a pointer when it leaves.
  map.on("mouseleave", "county_layer", function() {
    map.getCanvas().style.cursor = "";

    popup.remove();
  });

  map.on("mousemove", "county_layer", function(e) {
    popup.remove();
  

    map.getCanvas().style.cursor = "cursor";

    var displayStr; 
    
    let death_percentage = e["features"][0]["properties"][selected_date + ".d"] * 100;
    
    let case_percentage = e["features"][0]["properties"][selected_date] * 100;
    
    death_percentage = parseFloat(death_percentage.toFixed(2))
    case_percentage = parseFloat(case_percentage.toFixed(2))

    if (e["features"][0]["properties"][selected_date] != undefined && e["features"][0]["properties"][selected_date + ".d"] != undefined) {
			
      if(cases_toggle)
      {
      	displayStr =
          e["features"][0]["properties"]["NAME"] +
          " County " +
          "(" +
          display_date +
          ")" +
          "<br>" +
          case_percentage +
          "% change (7 day average cases)"
      }
      else
      {
      	displayStr =
          e["features"][0]["properties"]["NAME"] +
          " County " +
          "(" +
          display_date +
          ")" +
          "<br>" +
          death_percentage +
          "% change (7 day average deaths)"
      }
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
  if(cases_toggle)
  {
  	map.setPaintProperty("county_layer", "fill-color", [
      "interpolate",
      ["linear"],
      ["number", ["get", filterDate], -1],
      cases_inter_values.value_one,
      cases_inter_values.color_one,
      cases_inter_values.value_two,
      cases_inter_values.color_two,
      cases_inter_values.value_three,
      cases_inter_values.color_three,
      cases_inter_values.value_four,
      cases_inter_values.color_four
  	]);
  }
  else
  {
  	map.setPaintProperty("county_layer", "fill-color", [
      "interpolate",
      ["linear"],
      ["number", ["get", filterDate + ".d"], -1],
      deaths_inter_values.value_one,
      deaths_inter_values.color_one,
      deaths_inter_values.value_two,
      deaths_inter_values.color_two,
      deaths_inter_values.value_three,
      deaths_inter_values.color_three,
      deaths_inter_values.value_four,
      deaths_inter_values.color_four
  	]);
  }
  

  document.getElementById("active-date-new").innerText = display_date;

});

document
  .getElementById("slider-new")
  .addEventListener("autoplay_slider", function(e) {
    let millitime = start_date.getTime() + 86400000 * e.target.value;
    let dateObj = new Date(millitime);

    let filterDate = format_date_select(dateObj);
    display_date = format_date_display(dateObj);

    selected_date = filterDate;

    //Setting the property of county for each date
    if(cases_toggle)
    {
      map.setPaintProperty("county_layer", "fill-color", [
        "interpolate",
        ["linear"],
        ["number", ["get", filterDate], -1],
        cases_inter_values.value_one,
        cases_inter_values.color_one,
        cases_inter_values.value_two,
        cases_inter_values.color_two,
        cases_inter_values.value_three,
        cases_inter_values.color_three,
        cases_inter_values.value_four,
        cases_inter_values.color_four
      ]);
    }
    else
    {
      map.setPaintProperty("county_layer", "fill-color", [
        "interpolate",
        ["linear"],
        ["number", ["get", filterDate + ".d"], -1],
        deaths_inter_values.value_one,
        deaths_inter_values.color_one,
        deaths_inter_values.value_two,
        deaths_inter_values.color_two,
        deaths_inter_values.value_three,
        deaths_inter_values.color_three,
        deaths_inter_values.value_four,
        deaths_inter_values.color_four
      ]);
    }

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

document.getElementById("button-toggle-cases").addEventListener("click", function(){
	cases_toggle = true;
  
  map.setPaintProperty("county_layer", "fill-color", [
      "interpolate",
      ["linear"],
      ["number", ["get", selected_date], -1],
      cases_inter_values.value_one,
      cases_inter_values.color_one,
      cases_inter_values.value_two,
      cases_inter_values.color_two,
      cases_inter_values.value_three,
      cases_inter_values.color_three,
      cases_inter_values.value_four,
      cases_inter_values.color_four
  	]);
    
    document.getElementsByClassName("gradient-sq")[0].style["background-image"] = "linear-gradient(135deg, rgba(255, 187, 0,0), rgba(255, 187, 0,.65) 33%, rgba(255, 37, 4,.65) 66%, rgba(255, 37, 4,.75))";
})

document.getElementById("button-toggle-deaths").addEventListener("click", function(){
	cases_toggle = false;
  
  map.setPaintProperty("county_layer", "fill-color", [
        "interpolate",
        ["linear"],
        ["number", ["get", selected_date + ".d"], -1],
        deaths_inter_values.value_one,
        deaths_inter_values.color_one,
        deaths_inter_values.value_two,
        deaths_inter_values.color_two,
        deaths_inter_values.value_three,
        deaths_inter_values.color_three,
        deaths_inter_values.value_four,
        deaths_inter_values.color_four
      ]);
  
  document.getElementsByClassName("gradient-sq")[0].style["background-image"] = "linear-gradient(135deg, rgba(21, 31, 37, 0), rgba(22, 42, 196, .18) 33%, rgba(36, 187, 237, .45) 66%, rgba(20, 255, 204, .85)";
})

//Code for autoplay

//Code to do autoplay as default
let index = days;
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