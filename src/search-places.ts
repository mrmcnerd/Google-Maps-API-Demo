// This function fires when the user selects a searchbox picklist item.
// It will do a nearby search using the selected query string or place.
function searchBoxPlaces(searchBox, map: google.maps.Map, placeMarkers, currentPlace, currentPhoto) {
  hideMarkers(placeMarkers);
  var places = searchBox.getPlaces();
  if (places.length === 0) {
    window.alert('We did not find any places matching that search!');
  } else {
    // For each place, get the icon, name and location.
    createMarkersForPlaces(places, map, placeMarkers, currentPlace, currentPhoto);
  }
}

// This function fires when the user select "go" on the places search.
// It will do a nearby search using the entered query string or place.
function textSearchPlaces(map: google.maps.Map, placeMarkers, currentPlace, currentPhoto) {
  var bounds = map.getBounds();
  hideMarkers(placeMarkers);
  var placesService = new google.maps.places.PlacesService(map);
  placesService.textSearch({
      query: $('#places-search').val(),
      bounds: bounds
    }, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        createMarkersForPlaces(results, map, placeMarkers, currentPlace, currentPhoto);
      }
    }
  );
}

// This function creates markers for each place found in either places search.
function createMarkersForPlaces(places, map: google.maps.Map, placeMarkers, currentPlace, currentPhoto) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < places.length; i++) {
    var place = places[i];
    var icon = {
      url: place.icon,
      size: new google.maps.Size(35, 35),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 34),
      scaledSize: new google.maps.Size(25, 25)
    };
    // Create a marker for each place.
    var marker = new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
        //id: place.place_id
      }
    );

    // Create a single infowindow to be used with the place details information
    // so that only one is open at once.
    var placeInfoWindow = new google.maps.InfoWindow();

    // If a marker is clicked, do a place details search on it in the next function.
    //marker.addListener('click', function() {
    //   if (placeInfoWindow.marker == this) {
    //      console.log("This infowindow already is on this marker!");
    //    } else {
    //      getPlacesDetails(this, placeInfoWindow);
    //    }
    //  }
    //);
    addPlaceMarkerEvents(marker, place.place_id, placeInfoWindow, map, currentPlace, currentPhoto);
    placeMarkers.push(marker);
    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  }
  map.fitBounds(bounds);
}

// Function to add an event to a place marker.
function addPlaceMarkerEvents(marker:google.maps.Marker, place_id:string, infowindow, map: google.maps.Map, currentPlace, currentPhoto) {
  // If a marker is clicked, do a place details search on it in the next function.
  marker.addListener('click', function() {
      if (infowindow.marker == this) {
        console.log("This infowindow already is on this marker!");
      } else {
        getPlacesDetails(this, place_id, infowindow, map, currentPlace, currentPhoto);
      }
    }
  );
}

// This is the PLACE DETAILS search - it's the most detailed so it's only
// executed when a marker is selected, indicating the user wants more
// details about that place.
function getPlacesDetails(marker:google.maps.Marker, place_id:string, infowindow, map: google.maps.Map, currentPlace, currentPhoto) {
  var service = new google.maps.places.PlacesService(map);
  service.getDetails({
      placeId: place_id
    }, function(place, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // Set the marker property on this infowindow so it isn't created again.
        infowindow.marker = marker;
        var innerHTML = '<div>';
        if (place.name) {
          innerHTML += '<strong>' + place.name + '</strong>';
        }
        if (place.formatted_address) {
          innerHTML += '<br>' + place.formatted_address;
        }
        if (place.formatted_phone_number) {
          innerHTML += '<br>' + place.formatted_phone_number;
        }
        if (place.opening_hours) {
          innerHTML += '<br><br><strong>Hours:</strong><br>' +
            place.opening_hours.weekday_text[0] + '<br>' +
            place.opening_hours.weekday_text[1] + '<br>' +
            place.opening_hours.weekday_text[2] + '<br>' +
            place.opening_hours.weekday_text[3] + '<br>' +
            place.opening_hours.weekday_text[4] + '<br>' +
            place.opening_hours.weekday_text[5] + '<br>' +
            place.opening_hours.weekday_text[6];
        }
        if (place.photos) {
          innerHTML += '<br><br><img id="' + place.place_id + '_photo" src="' + place.photos[0].getUrl(
            {maxHeight: 100, maxWidth: 200}) + '">';
          if (place.photos.length > 1)
          {
            innerHTML += '<br>';
            innerHTML += place.photos.length + ' photos: ';
            innerHTML += '<a onclick="previousPhoto()">Prev</a> ';
            innerHTML += '<a onclick="nextPhoto()">Next</a>';           
          }
        }
        innerHTML += '</div>';
        infowindow.setContent(innerHTML);
        currentPlace = place;
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
          infowindow.marker = null;
          currentPlace = null;
          currentPhoto = 0;
        });
      }
    }
  );
}

// Get next photo
function nextPhoto(currentPlace, currentPhoto) {
  if (currentPlace) {
    var totalPhotos = currentPlace.photos.length;
    var next = currentPhoto + 1;
    if (next >= totalPhotos) next = 0;
    
    $('#' + currentPlace.place_id + '_photo').attr(
      'src',
      currentPlace.photos[next].getUrl({maxHeight: 100, maxWidth: 200})
    );
        
    currentPhoto = next;
  }
}

// Get previous photo
function previousPhoto(currentPlace, currentPhoto) {
  if (currentPlace) {
    var totalPhotos = currentPlace.photos.length;
    var next = currentPhoto - 1;
    if (next < 0) next = totalPhotos - 1;
    
    $('#' + currentPlace.place_id + '_photo').attr(
      'src',
      currentPlace.photos[next].getUrl({maxHeight: 100, maxWidth: 200})
    );
        
    currentPhoto = next;
  }
}