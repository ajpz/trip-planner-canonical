var map; 

function initialize_gmaps() {

  // initialize new google maps LatLng object
  var myLatlng = new google.maps.LatLng(40.705189, -74.009209);

  // set the map options hash
  var mapOptions = {
    center: myLatlng,
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: styleArr
  };

  // get the maps div's HTML obj
  var map_canvas_obj = document.getElementById('map-canvas');

  // initialize a new Google Map with the options
  // defined this map globally
  map = new google.maps.Map(map_canvas_obj, mapOptions);

  // add the marker to the map
  var marker = new google.maps.Marker({
    position: myLatlng,
    title: 'Hello World!'
  });



  // var hotelLocation = [40.705137, -74.007624];
  // var restaurantLocations = [
  //       [40.705137, -74.013940],
  //       [40.708475, -74.010846]
  //     ];
  // var activityLocations = [
  //       [40.716291, -73.995315],
  //       [40.707119, -74.003602]
  //     ];

  // drawLocation(hotelLocation, {
  //   icon: '/images/lodging_0star.png'
  // });
  // restaurantLocations.forEach(function(loc) {
  //   drawLocation(loc, {
  //     icon: '/images/restaurant.png'
  //   });
  // });
  // activityLocations.forEach(function(loc) {
  //   drawLocation(loc, {
  //     icon: '/images/star-3.png'
  //   });
  // });
}

// export function to create and draw some locations on the map
function drawLocation (location, opts) {
  if (typeof opts !== 'object') {
    opts = {};
  }
  opts.position = new google.maps.LatLng(location[0], location[1]);
  opts.map = map;
  var marker = new google.maps.Marker(opts);
}; 

// wait for document to load before making map
$(document).ready(function() {
  initialize_gmaps();

  $('.panel-body .btn').on('click', function() {
    var selectionType = $(this).prev().prev().text(); 
    var selectionName = $(this).prev()[0].value; 
    var selectionLocation; 

    //array of two coordinates
    if(selectionType === 'Hotels') {
      selectionLocation = all_hotels.filter(function(hotel) {
        return hotel.name === selectionName; 
      })[0].place[0].location; 
    } else if (selectionType === 'Restaurants') {
      selectionLocation = all_restaurants.filter(function(restaurant) {
        return restaurant.name === selectionName; 
      })[0].place[0].location; 
    } else {
      selectionLocation = all_activities.filter(function(activity) {
        return activity.name === selectionName; 
      })[0].place[0].location; 
    }
    drawLocation(selectionLocation)

    var node = '<div class="itinerary-item"><span class="title">' + selectionName +'</span><button class="btn btn-xs btn-danger remove btn-circle">x</button></div>'; 
    // add to the current days itinerary
    if(selectionType === 'Hotels') {
      $('#hotel-itin').append(node); 
    } else if (selectionType === 'Restaurants') {
      $('#restaurant-itin').append(node); 
    } else {
      $('#activity-itin').append(node);       
    }
  })
});

var styleArr = [{
  featureType: 'landscape',
  stylers: [{ saturation: -100 }, { lightness: 60 }]
}, {
  featureType: 'road.local',
  stylers: [{ saturation: -100 }, { lightness: 40 }, { visibility: 'on' }]
}, {
  featureType: 'transit',
  stylers: [{ saturation: -100 }, { visibility: 'simplified' }]
}, {
  featureType: 'administrative.province',
  stylers: [{ visibility: 'off' }]
}, {
  featureType: 'water',
  stylers: [{ visibility: 'on' }, { lightness: 30 }]
}, {
  featureType: 'road.highway',
  elementType: 'geometry.fill',
  stylers: [{ color: '#ef8c25' }, { lightness: 40 }]
}, {
  featureType: 'road.highway',
  elementType: 'geometry.stroke',
  stylers: [{ visibility: 'off' }]
}, {
  featureType: 'poi.park',
  elementType: 'geometry.fill',
  stylers: [{ color: '#b6c54c' }, { lightness: 40 }, { saturation: -40 }]
}];