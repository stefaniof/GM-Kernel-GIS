

// cod jQuery

// activare tooltips
$('[data-toggle="tooltip"]').each(function(){
    var options = { 
    	html: true 
    };
	// setari colorare tooltips
    if ($(this)[0].hasAttribute('data-type')) {
        options['template'] = 
        	'<div class="tooltip ' + $(this).attr('data-type') + '" role="tooltip">' + 
        	'	<div class="tooltip-arrow"></div>' + 
        	'	<div class="tooltip-inner"></div>' + 
        	'</div>';
    }

    $(this).tooltip(options);
});




//sidebar
$("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled"); //schimbare clasa la activarea butonului de "toggle"	
		$("i", this).toggleClass("fas fa-door-open fa-lg fas fa-door-closed fa-lg"); // schimbare pictograma 
    });


//final cod JQuery


	
// inceput Javascript	
	
// variabile globale
var map; // harta Google
var drawingManager; // obiectul care cuprinde majoritatea metodelor si proprietatilor necesare pentru desenare
var selectedShape; // ajuta la identificarea formei selectate
var selectedKernel; // ajuta la identificarea nucleului selectat
var gmarkers = []; // lista cu markerele care vor fi pozitionate in varfurile nucleului
var coordinates = []; // lista cu coordonatele varfurilor poligonului selectat
var infowindow = new google.maps.InfoWindow({
  size: new google.maps.Size(150, 50)
}); // infowindow care apare cand se da click pe markere
var allShapes = []; // lista cu toate formele desenate pe harta - ajuta pentru stergerea lor in acelasi timp
var shapeColor = "#007cff"; // culoare forma desenata
var kernelColor = "#000"; // culoare nucleu




// functie care copiaza textul primit ca parametru in clipboard
// Primeste ca parametri:
// text - document.getElementById('id-element').innerHTML, 
// copymsg - document.getElementById('id-element')
function copyToClipboard(text, copymsg){
	var temp = document.createElement('input');
	temp.type='input';
	temp.setAttribute('value',text);
	document.body.appendChild(temp);
    temp.select();
	document.execCommand("copy");
	temp.remove();
	copymsg.innerHTML = "Copiat în clipboard!"; // mesaj care se va afisa la executarea functiei
	setTimeout(function(){ copymsg.innerHTML="" }, 1000); // timp afisare mesaj
}


// schimba opacitatea containerului "opcard" atunci cand utilizatorul trece cursorul peste acest element
function changeOpacityHover(){
	var element = document.getElementById("opcard");
	element.classList.remove("ccard");
	element.classList.add("vcard");
}

// schimba opacitatea containerului "opcard" la forma initiala dupa ce cursorul nu se mai afla peste elementul "opcard"
function changeOpacityOut() {
    var element = document.getElementById("opcard");
	element.classList.remove("vcard");
	element.classList.add("ccard");
}





// Atribuie fiecarui marcator o harta
// parametrul "map" va fi trimis cu valoarea hartii Google sau cu "null"
function setMapOnAll(map) {
    for (var i = 0; i < gmarkers.length; i++) {
        gmarkers[i].setMap(map);
    }
}

// Ascunde toti marcatorii de pe harta
function clearMarkers() {
    setMapOnAll(null);
}

// Afiseaza toti marcatorii
function showMarkers() {
    setMapOnAll(map);
}

// Sterge toti marcatorii
function deleteMarkers() {
    clearMarkers();
    gmarkers = [];
}


// functie care sterge forma selectata
function deleteSelectedShape () {
  if (selectedShape) {
    selectedShape.setMap(null);
    document.getElementById('info').innerHTML = ""; // actualizează lista de coordonate afisata
  }
  
  if (selectedKernel) {
    selectedKernel.setMap(null);
    document.getElementById('info').innerHTML = ""; // actualizează lista de coordonate afisata
  }  
}



// functie care sterge toate formele de pe harta
function clearMap(){
	if(allShapes.length > 0) {  // verific daca exista forme desenate
		$('#clearmap').modal('show'); // afiseaza mesaj de avertizare
		
		$( "#yes" ).click(function() {
			$('#clearmap').modal('hide'); // ascunde mesajul de avertizare
			for (var i=0; i < allShapes.length; i++) // sterge toate formele
				{
					allShapes[i].setMap(null);
				}
			allShapes = [];
			deleteMarkers();
			document.getElementById('info').innerHTML = "Desenează un poligon. Aici vor apărea coordonatele vârfurilor sale și vor fi actualizate în timp real."; // actualizează lista de coordonate afisata
		});
	}
}	


// functie care seteaza culoarea formei selectate ca fiind cea aleasa de utilizator prin Color Picker
function update(picker) {
    shapeColor = picker.toHEXString();
	if (selectedShape) {
		selectedShape.setOptions({fillColor: shapeColor});
	}
}



// functie care seteaza culoarea nucleului selectat ca fiind cea aleasa de utilizator prin Color Picker
function updateK(picker) {
    kernelColor = picker.toHEXString();
	if (selectedKernel) {
		selectedKernel.setOptions({fillColor: kernelColor});
	}
}



// functie care anuleaza selectia curenta
function clearSelection () {
  if (selectedShape) { //verifica daca forma selectata este un poligon
    if (selectedShape.type !== 'marker') {
      selectedShape.setEditable(false);
    }
    selectedShape = null;
  }
  
  if (selectedKernel) { // verifica daca forma selectata este un nucleu
    if (selectedKernel.type !== 'marker') {
      selectedKernel.setEditable(false);
    }
    selectedKernel = null;
  }  
}

// functie care selecteaza o forma si primeste ca parametri:
// shape - forma care trebuie selectata
// check - 0 = poligon, 1 = nucleu
function setSelection (shape, check) {
  clearSelection();
  shape.setEditable(true);
  if (check) {
	  selectedKernel = shape;
  } else {selectedShape = shape; }
}



//functie care salveaza in lista "coordinates" coordonatele varfurilor poligonului dat ca parametru
function getCoordinates (polygon) {
  var path = polygon.getPath();
  coordinates = [];
  var mesajcoord = "Coordonatele punctelor poligonului selectat sunt: <br>";
  for (var i = 0 ; i < path.length ; i++) {
    coordinates.push({
      lat: path.getAt(i).lat(),
      lng: path.getAt(i).lng()
    });
    mesajcoord+= "("+ (i+1) + "): " + "Lat: " + coordinates[i].lat + " <br>   Lng: " + coordinates[i].lng + "<br>";
  }
  //afisare coordonate
  document.getElementById('info').innerHTML = mesajcoord;
}



// functie care creeaza un marker si primeste ca parametri
// coord = coordonatele unde va fi creat marker-ul
// nr = numarul marker-ului
// map = harta Google Maps
function createMarker(coord, nr, map) {
  var mesaj = "<h6>Vârf " + nr + "</h6><br>" + "Lat: " + coord.lat + "<br>" + "Lng: " + coord.lng;
  var marker = new google.maps.Marker({
    position: coord,
    map: map,
    //zIndex: Math.round(coord.lat * -100000) << 5
  });
  // afisare informatii marker la "click"
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(mesaj);
    infowindow.open(map, marker);
  });
  google.maps.event.addListener(marker, 'dblclick', function() { // sterge marker la "dublu click"
    marker.setMap(null);
  });
  return marker;
}



// functie care primeste ca parametru harta Google Maps si deseneaza nucleul poligonului
function DrawKernel(map){
  if(allShapes.length >0 && coordinates.length > 2) { // verific daca exista un poligon 
	  var kernelPoints = [];
	  getKernel( coordinates, coordinates.length, kernelPoints);
	  var kernelForm = new google.maps.Polygon({
		map: map,
		paths:kernelPoints,
		fillColor: kernelColor,
		strokeWidth:2,
		fillOpacity:0.5,
		strokeColor:"#0000FF",
		strokeOpacity:0.5,
		zIndex:1000
	  });
		allShapes.push(kernelForm); // salveaza forma in lista allShapes
	  // creare markere in varfurile nucleului
	  for(i=0;i<kernelPoints.length;i++)
	  {
		var marker = createMarker(kernelPoints[i], i+1, map);
		gmarkers.push(marker);
	  }
	  // listener pentru selectarea nucleului la 'click'
	  google.maps.event.addListener(kernelForm, 'click', function (e) {
			setSelection(kernelForm, 1);
			var mesajcoord = "Coordonatele punctelor nucleului selectat sunt: <br>";
				for (var i = 0 ; i < kernelPoints.length; i++) {
				mesajcoord+= "("+ (i+1) + "): " + "Lat: " + kernelPoints[i].lat + " <br>   Lng: " + kernelPoints[i].lng + "<br>";
				}
			//afisare coordonate
			document.getElementById('info').innerHTML = mesajcoord;
		});  
  
	}
	else {
		$('#kernel').modal('show');
	}

}



// functie care ofera functionalitate casetei de cautare
function searchBox() {
	// Creare caseta de căutare
	var input = document.getElementById('search-box');
    var searchBox = new google.maps.places.SearchBox(input);

    // Rezultate relevante locului curent
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

        
    // Obține mai multe detalii despre locul selectat
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();
      if (places.length == 0) {
        return;
       }

      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(place) {
      if (!place.geometry) {
            return;
        }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
        };

      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
		} else {
              bounds.extend(place.geometry.location);
			}
          });
      map.fitBounds(bounds);
    });	
	
}



// functie care initializeaza harta Google Maps, stabileste optiunile sale si apeleaza alte functii
function initMap () {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: new google.maps.LatLng(44.435649, 26.101634),
	mapTypeControl: false, // dezactivat
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: google.maps.ControlPosition.LEFT_CENTER
    },
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
    },
    scaleControl: false, // dezactivat
	scaleControlOptions: {
		position: google.maps.ControlPosition.RIGHT_CENTER
    },
    streetViewControl: false, // dezactivat
    fullscreenControl: false // dezactivat
  });

	searchBox();
  // setari pentru formele desenate
  var shapeOptions = {
    strokeWeight: 1,
    fillOpacity: 0.4,
    editable: true,
    draggable: true
  };

  // initializare Drawing Manager
  drawingManager = new google.maps.drawing.DrawingManager({
    // setare direct desenare poligon
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: false, //dezactivat
    drawingControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER,
      drawingModes: ['polygon'] //  se mai pot adauga: 'marker', 'polyline', 'rectangle', 'circle'
    },
    polygonOptions: shapeOptions,
    map: map
  });
  google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
    var newShape = e.overlay;
	allShapes.push(newShape); // salveaza forma in lista allShapes
	
	newShape.setOptions({fillColor: shapeColor}); // colorare forma cu valoarea actuala a shapeColor
    getCoordinates(newShape); // aflare coordonate varfuri

    // iesire mod desenare dupa terminarea poligonului
    drawingManager.setDrawingMode(null);
	setSelection(newShape, 0);
    // selectare poligon la "click"
    google.maps.event.addListener(newShape, 'click', function (e) {
        if (e.vertex !== undefined) {
            var path = newShape.getPaths().getAt(e.path);
            path.removeAt(e.vertex);
            getCoordinates(newShape);
            if (path.length < 3) {
              newShape.setMap(null);
            }
        }
        setSelection(newShape, 0);
      });


    //actualizare coordonate  
    google.maps.event.addListener(newShape, 'click', function (e){getCoordinates(newShape);});
    google.maps.event.addListener(newShape, "dragend", function (e){getCoordinates(newShape);});
    google.maps.event.addListener(newShape.getPath(), "insert_at", function (e){getCoordinates(newShape);});
    google.maps.event.addListener(newShape.getPath(), "remove_at", function (e){getCoordinates(newShape);});
    google.maps.event.addListener(newShape.getPath(), "set_at", function (e){getCoordinates(newShape);});

  });
  // Deselectare forma cand se schimba modul de desenare sau cand utilizatorul face click pe harta
  google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
  google.maps.event.addListener(map, 'click', clearSelection);

    
}
// start aplicatie
google.maps.event.addDomListener(window, 'load', initMap);


