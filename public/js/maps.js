var map; 
var days = [];
var markers = [];

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
  marker.name = opts.name;
  markers.push(marker);
  return marker;
}; 

// wait for document to load before making map
$(document).ready(function() {
  initialize_gmaps();
  var currentDay = 0;
  var newDay = function() {
    days.push({Hotels: [], Restaurants: [], Activities: []});
  }
  //newDay called once always, because there is one day at the start
  newDay();
  var drawDay = function(dayObj) {
    $('#hotel-itin').empty();
    $('#restaurant-itin').empty();
    $('#activity-itin').empty();
    if(dayObj.Hotels) {
      $('#hotel-itin').append(dayObj.Hotels); 
    }
    if(dayObj.Restaurants.length) {
      dayObj.Restaurants.forEach(function(restaurantSingle) {
        $('#restaurant-itin').append(restaurantSingle);        
      })
    }
    if(dayObj.Activities.length) {
      dayObj.Activities.forEach(function(ActivitySingle) {
        $('#activity-itin').append(ActivitySingle);        
      })
    }
  }

  var updateDayHeader = function() {
    $("#day-title").find("span").text("Day "+(currentDay+1));
  }

  var showMarkersForCurrentDay = function() {
    markers.forEach(function(marker) {
      if(marker.day === currentDay) marker.setMap(map); 
      else marker.setMap(null); 
    }); 
  }; 

  $('#selector .btn').on('click', function() {
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
    var thisMarker = drawLocation(selectionLocation, {name: selectionName, day: currentDay});

    //change div to li
    var node = '<div class="itinerary-item"><span class="title">' + selectionName +'</span><button class="btn btn-xs btn-danger remove btn-circle" data='+thisMarker.name+'>x</button></div>'; 
    // add to the current days itinerary
    days[currentDay][selectionType].push(node);
    drawDay(days[currentDay]);
  })

  // deleting itinerary items individually
  $('#itin').on('click', '.btn', function() {
    var markerNameToRemove = $(this).prev()[0].textContent;
    console.log(typeof markerNameToRemove, markerNameToRemove); 
    var category = $(this).parent().parent().attr('id').split('-')[0]; 
    if(category === 'hotel') category = 'Hotels'; 
    else if (category === 'restaurant') category = 'Restaurants'; 
    else category = 'Activities'; 
    var indexWeWant = [];
    markers.filter(function(marker, i) {
      if(marker.name === markerNameToRemove) indexWeWant.push(i);
      return marker.name === markerNameToRemove;
    })[0].setMap(null);
    markers.splice(indexWeWant[0], 1);
    days[currentDay][category] = days[currentDay][category].filter(function(item) {
      console.log(item); 
      return item.indexOf(markerNameToRemove) <= -1; 
    }); 
    $(this).parent().remove();
  })

  //add day
  $('.day-btn').last().on('click', function() {
    $('.current-day').removeClass('current-day');
    var newDayNumber =($(this).siblings().length+1);
    var btnNode = '<button class="btn btn-circle day-btn current-day">'+newDayNumber+'</button>';
    currentDay = newDayNumber - 1;
    newDay();
    $(this).before(btnNode);
    drawDay(days[currentDay]);
    updateDayHeader();
    showMarkersForCurrentDay(); 
  })

  //switching days
  $('.day-buttons').on('click', '.day-btn', function() {
    // console.log(this.innerText);
    if(this.innerText === '+') return;
    $('.current-day').removeClass('current-day');
    $(this).addClass('current-day');
    currentDay = this.innerText - 1;
    drawDay(days[currentDay]);
    updateDayHeader();
    showMarkersForCurrentDay(); 
  })

  // remove entire day
  $('#day-title').find('.remove').on('click', function() {
    days[currentDay] = {Hotels: [], Restaurants: [], Activities: []};
    markers = markers.filter(function(marker) {
      if(marker.day === currentDay) marker.setMap(null); 
      return marker.day !== currentDay; 
    }); 
    drawDay(days[currentDay]);
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
