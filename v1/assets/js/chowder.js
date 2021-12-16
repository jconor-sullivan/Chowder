let md;
md = window.markdownit({ html: true }).use(window.markdownitFootnote);
let map, tileLayer;
map = L.map("chowder-map").setView([40.730833, -73.9975], 16);
tileLayer = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='http://carto.com/attribution'>CARTO</a>",
  subdomains: "abcd",
  maxZoom: 18
}).addTo(map);
$.getJSON("/v1/chowder-nantucket.geo.json", function (data) {
  let chowderLayer, chowderFeatures;
  chowderFeatures = data.features.map(function (feature) {
    return {
      note: feature.properties.note,
      zoom: feature.properties.zoom,
      name: feature.properties.name,
      more: feature.properties.more,
      tab: feature.properties.tab,
      latLng: L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
    };
  });
  let chowderMarkers = chowderFeatures.map(function (feature) {
    let popupContent; 
    popupContent = "<h4>" + feature.name + "</h4>";
    popupContent = popupContent + "<p>" + "Learn more about this location in the description below." + ".<br />";
    popupContent = popupContent + "Coordinates: " + feature.more + "</p>";
    let marker = L.circleMarker(feature.latLng, {
      radius: 10, 
      color: "#d33682",
      fillColor: "#d33682"
    }).bindPopup(popupContent);

    marker.bindTooltip(
      feature.name,
      {
        permanent: true,
        className: 'markerLabel'
      });

    return marker;
  });
  let ishmaelRoute, queequegRoute
  ishmaelRoute = [[41.287236427952095, -70.09695962946495],
  [41.28678103861776, -70.09761989776112],
  [41.28585107578351, -70.0973168761537],
  [41.28563361, -70.0983518],
  [41.286078104511496, -70.0985976462326],
  [41.28561551658042, -70.09944291726715],
  [41.285759326655004, -70.0996087817923],
  [41.28556278614405, -70.10114302846345],
  [41.28529913330701, -70.1010888035642],
  [41.28527276796524, -70.10169484692783],
  [41.28590553322773, -70.10171398513931],
  [41.28594388244035, -70.10236787403166]];
  queequegRoute = [[41.287236427952095, -70.09695962946495],
  [41.287236427952095, -70.09695962946495],
  [41.28678103861776, -70.09761989776112],
  [41.28585107578351, -70.0973168761537],
  [41.28563361, -70.0983518],
  [41.28548004075669, -70.09834081869762],
  [41.284964071745, -70.10072262024863],
  [41.28501849054325, -70.10074676012842],
  [41.284958025209065, -70.10069848036886],
  [41.284385617260696, -70.10031224231506],
  ];
  const iroute = L.polyline(ishmaelRoute, { color: "red" });
  const qroute = L.polyline(queequegRoute, { color: "green" });
  $("button").click(function () {
    let route;
    if ($(this).attr("id")==="ishmael"){
      route=iroute;
    }
    else {
      route=qroute;
    }
    if ($(this).hasClass("btn-primary")) {
      route.remove(map)
      $(this).removeClass("btn-primary")
      $(this).addClass("btn-secondary")
    }
    else {
      route.addTo(map);
      $(this).removeClass("btn-secondary")
      $(this).addClass("btn-primary")
    }
  })
  chowderLayer = L.featureGroup(chowderMarkers).addTo(map);
  loadchowder(chowderFeatures);
  loadNavTabs(chowderFeatures);
  let bounds = chowderLayer.getBounds()
  $(".markerLabel").css("display", "none"); 
  map.fitBounds(bounds);
  map.zoomOut(1);
  $("#nav-tabs a[href='#introduction']").click(function () {
    $(".markerLabel").css("display", "none"); 
    map.fitBounds(bounds);
    map.zoomOut(1);
  })

});

let loadchowder, loadNavTabs;
loadchowder = function (featuresArray) {
  $.ajax({
    url: "/v1/examples/markdown/chowder.md", 
    success: function (markdown) {

      let html;
      html = md.render(markdown);
      $("#chowder").html(html);
      featuresArray.forEach(function (feature) {
        $("#chowder").html(function (_, oldHtml) {
          let regex, newHtml;
          regex = RegExp(feature.note, "g");
          newHtml = "<a href='#' data-tab='" +
            feature.tab +
            "' data-lat='" +
            feature.latLng.lat +
            "' data-lng='" +
            feature.latLng.lng +
            "' data-zoom='" +
            feature.zoom +
            "' data-name='" +
            feature.name +
            "'>" + feature.note + "</a>";
          return oldHtml.replace(regex, newHtml);
        });
        $("#nav-tabs a[href='#" + feature.tab + "']").click(function () {
          $(".markerLabel").css("display", "none"); 

          $(".markerLabel").each((_, element) => {
            if (element.innerText === feature.name) {
              $(element).css("display", "block") 
            }
          });
          map.setView(feature.latLng, feature.zoom);
          

        });
      });
      $("#chowder a").click(function () {

        let tab, name, lat, lng, zoom;
        tab = $(this).data("tab");
        name = $(this).data("name");
        $("#nav-tabs a[href='#" + tab + "']").tab("show");
        lat = $(this).data("lat");
        lng = $(this).data("lng");
        zoom = $(this).data("zoom");
        map.setView([lat, lng], zoom);
        $(".markerLabel").css("display", "block");
        $(".markerLabel").css("display", "none");

        $(".markerLabel").each((_, element) => {
          if (element.innerText === name) {
            $(element).css("display", "block")
          }
        });
        });
    }
  });
};

loadNavTabs = function (featuresArray) {
 featuresArray.map(function (feature) {
    return feature.tab;
  }).concat(["introduction"]).forEach(function (tab) {
      $.ajax({
      url: "/v1/examples/markdown/" + tab + ".md",
      success: function (markdown) {
        let html;
        html = md.render(markdown);
        $("#" + tab).html(html);
      }
    });
  });
};

