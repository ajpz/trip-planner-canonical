var map; 
var days = [];
var markers = [];
var ghostMarkers = []; 

/*
  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  var marker = new google.maps.Marker({
    position: uluru,
    map: map,
    title: 'Uluru (Ayers Rock)'
  });
  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
*/

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
}

function createInfoWindowContent (name, type) {
  var content = ''; 
  switch(type) {
    case 'Hotels':
      var thisHotel = all_hotels.filter(function(hotel) {
        return hotel.name === name; 
      })[0];     
      content = '<h1>' + thisHotel.name + '</h1>' +
                '<p>Rating: ' + thisHotel.num_stars + ' out of 5 stars</p>' + 
                '<p>' + thisHotel.amenities + '</p>' +
                '<p>' + thisHotel.place[0].address + '</p>' +
                '<p>' + thisHotel.place[0].city + '</p>' +
                '<p>' + thisHotel.place[0].state + '</p>' +
                '<p>' + thisHotel.place[0].phone + '</p>';  
      break;
    case 'Restaurants':
      var thisRes = all_restaurants.filter(function(restaurant) {
        return restaurant.name === name; 
      })[0];   
      content = '<h1>' + thisRes.name + '</h1>' +
                '<p>Price: ' + thisRes.price + ' on a scale of 4</p>' + 
                '<p>' + thisRes.cuisine + '</p>' +
                '<p>' + thisRes.place[0].address + '</p>' +
                '<p>' + thisRes.place[0].city + '</p>' +
                '<p>' + thisRes.place[0].state + '</p>' +
                '<p>' + thisRes.place[0].phone + '</p>'; 
      break;
    case 'Activities':
      var thisAct = all_activities.filter(function(activity) {
        return activity.name === name; 
      })[0];   
      content = '<h1>' + thisAct.name + '</h1>' +
                '<p>Age range: ' + thisAct.age_range + '</p>' + 
                '<p>' + thisAct.place[0].address + '</p>' +
                '<p>' + thisAct.place[0].city + '</p>' +
                '<p>' + thisAct.place[0].state + '</p>' +
                '<p>' + thisAct.place[0].phone + '</p>'; 
      break; 
  } 
  return content; 
}

// export function to create and draw some locations on the map
function drawLocation (location, opts) {


  if (typeof opts !== 'object') {
    opts = {};
  }
  if(opts.selectionType === 'Hotels') opts.icon = '/images/lodging_0star.png'; 
  else if (opts.selectionType === 'Restaurants') opts.icon = '/images/restaurant.png'; 
  else opts.icon = '/images/star-3.png'; 

  opts.position = new google.maps.LatLng(location[0], location[1]);
  opts.map = map;
  var marker = new google.maps.Marker(opts);
  marker.name = opts.name;
  

  
  var infowindow = new google.maps.InfoWindow({
    content: createInfoWindowContent(marker.name, opts.selectionType)
  });
  marker.addListener('mouseover', function() {
    infowindow.open(map, marker);
  }); 
  marker.addListener('mouseout', function() {
    infowindow.close(); 
  })

  if(opts.hasOwnProperty('temporary')) {
    ghostMarkers.push(marker); 
    infowindow.open(map, marker); 
  }
  else markers.push(marker);

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

  var ghostBusters = function() {
    ghostMarkers.forEach(function(marker) {
      marker.setMap(null); 
    })
    ghostMarkers = [];
  }

  //adding an itinerary item
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

    //change div to li
    
    // add to the current days itinerary
    if(selectionType === 'Hotels' && days[currentDay]['Hotels'].length) {
      alert('You can\'t sleep in two beds in one day!'); 
    } else if (selectionType === 'Restaurants' && days[currentDay]['Restaurants'].length > 2) {
      alert('You can\'t eat in four restaurants in one day!'); 
    } else {
      var thisMarker = drawLocation(selectionLocation, {name: selectionName, day: currentDay, selectionType: selectionType});
      var node = '<div class="itinerary-item"><span class="title">' + selectionName +'</span><button class="btn btn-xs btn-danger remove btn-circle" data='+thisMarker.name+'>x</button></div>'; 
      days[currentDay][selectionType].push(node);
      drawDay(days[currentDay]);
    }
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
  $('#adder').on('click', function() {
    $('.current-day').removeClass('current-day');
    var newDayNumber =($(this).siblings().length);
    var btnNode = '<button class="btn btn-circle day-btn current-day">'+newDayNumber+'</button>';
    currentDay = newDayNumber - 1;
    newDay();
    $(this).before(btnNode);
    drawDay(days[currentDay]);
    updateDayHeader();
    showMarkersForCurrentDay(); 
  })

  $('#swapper').on('click', function() {
    $(this).parent().append("<p class='tempForm'>Input Days to Swap, then Press Submit</p>");
    $(this).parent().append("<textarea class='tempForm' id='firstDaySwap' rows='1' cols='10'>Swap Me</textarea>");
    $(this).parent().append("<textarea class='tempForm' id='secondDaySwap' rows='1' cols='10'>Swap Me</textarea>");
    $(this).parent().append("<button class='tempForm' class='btn' id='submitter'>Submit</button>");
    $('.day-buttons').on('click', '#submitter', function() {
      var numDay1 = $('#firstDaySwap')[0].value;
      var numDay2 = $('#secondDaySwap')[0].value;
      if(isNaN(numDay1) || isNaN(numDay2) || numDay1 === numDay2 || numDay1 < 1 || numDay2 < 2 || numDay1 > days.length || numDay2 > days.length) {
        alert("You must provide valid numbers for swapping!");
        $('.tempForm').remove();
      } else {
        swapDays(numDay1, numDay2);
      }
    });
  })

  var swapDays = function(numberOfDay1, numberOfDay2) {
    var tempStorage = days[numberOfDay1 - 1];
    days[numberOfDay1 - 1] = days[numberOfDay2 - 1];
    days[numberOfDay2 - 1] = tempStorage;
    markers.forEach(function(marker) {
      if(marker.day === numberOfDay1 - 1) {
        marker.day = 'x';
      }
    })
    markers.forEach(function(marker) {
      if(marker.day === numberOfDay2 - 1) {
        marker.day = numberOfDay1 - 1;
      }
    })
    markers.forEach(function(marker) {
      if(marker.day === 'x') {
        marker.day = numberOfDay2 - 1;
      }
    })
    drawDay(days[currentDay]);
    showMarkersForCurrentDay();
    $('.tempForm').remove();
  }

  //switching days
  $('.day-buttons').on('click', '.day-btn', function() {
    // console.log(this.innerText);
    if(this.innerText === '+' || this.innerText === 'S') return;
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

  // removing temporary markers
  $('select').on('click', ghostBusters);  

  // adding temporary hover markers over selections
  $('select').hover(function() {
    var selectionType = $(this).prev().text(); 
    var selectionName = this.value; 
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
    drawLocation(selectionLocation, {name: selectionName, day: currentDay, selectionType: selectionType, temporary: true});
  }, ghostBusters); 
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
