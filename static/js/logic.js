// Create the 'basemap' tile layer that will be the background of our map.
// Create the 'basemap' tile layer that will be the default background of our map.
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
});

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let street = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors, Humanitarian OpenStreetMap Team'
});

// Create the map object with center and zoom options.
let map = L.map('map', {
  center: [20, 0], // Center of the world
  zoom: 2,
  layers: [basemap] // Default layer
});

// Then add the 'basemap' tile layer to the map.

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
// Add a control to the map that will allow the user to change which layers are visible.
let earthquakes = new L.LayerGroup();
let tectonic_plates = new L.LayerGroup();

let baseMaps = {
  "Base Map": basemap,
  "Street Map": street
};

let overlays = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonic_plates
};

L.control.layers(baseMaps, overlays, {
  collapsed: false // Ensures the icon is always visible
}).addTo(map);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      radius: getRadius(feature.properties.mag),
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000",
      weight: 0.5,
      opacity: 1,
      fillOpacity: 0.8
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    return depth > 90 ? "#FF0000" :
           depth > 70 ? "#FF4500" :
           depth > 50 ? "#FF8C00" :
           depth > 30 ? "#FFD700" :
           depth > 10 ? "#ADFF2F" :
                        "#00FF00";
  }

  

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude ? magnitude * 4 : 1; // Ensure radius is at least 1 for very small magnitudes
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake.
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<h3>${feature.properties.place}</h3>
         <hr>
         <p>Magnitude: ${feature.properties.mag}</p>
         <p>Depth: ${feature.geometry.coordinates[2]} km</p>
         <p>Date: ${new Date(feature.properties.time)}</p>`
      );
    }
  // Add the data to the earthquake layer instead of directly to the map.
  }).addTo(earthquakes);

  // Add the earthquake layer to the map.
  earthquakes.addTo(map);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    const depthRanges = [-10, 10, 30, 50, 70, 90];
    const colors = ["#00FF00", "#ADFF2F", "#FFD700", "#FF8C00", "#FF4500", "#FF0000"];

    // Loop through depth ranges to generate labels with colored squares.
    for (let i = 0; i < depthRanges.length; i++) {
      div.innerHTML +=
        `<i style="background:${colors[i]}"></i> ${depthRanges[i]}${depthRanges[i + 1] ? `&ndash;${depthRanges[i + 1]} km<br>` : "+ km"}`;
    }
    return div;
  };
  // Finally, add the legend to the map.
  legend.addTo(map);

  //  OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate GeoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the GeoJSON data, along with style information, to the tectonic_plates layer.
    L.geoJson(plate_data, {
      style: {
        color: "orange",
        weight: 2
      }
    }).addTo(tectonic_plates);

    // Add the tectonic_plates layer to the map.
    tectonic_plates.addTo(map);
  });
});

