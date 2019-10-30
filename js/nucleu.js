

const eps = 0.0000000000001; // eroarea acceptata
const inf =  1000000; // o valoare foarte mare, folosita pentru initializarea unor variabile, utila la calcularea intersectiilor de drepte


// functie care verifica ordinea varfurilor poligonului
function checkOrder(poligon, n)
{
  var i;
  var order = 0;
  for (i = 0; i < n; i++) // se insumeaza laturile poligonului
    order += poligon[i].lat*poligon[i+1].lng - poligon[i].lng*poligon[i+1].lat;
  if(order > 0) return 1; // ordine antitrigonometrica (in sensul miscarii acelor de ceasornic)
  else return -1; // ordine trigonometrica
}


// functia primeste trei puncte ca argumente si verifica pozitia lui c fata de latura orientata ab
// return -1 => punct interior
// return 1 => punct exterior
function sign( a,  b,  c)
{
  var det = a.lat*b.lng + b.lat*c.lng + c.lat*a.lng - c.lat*b.lng - a.lat*c.lng - b.lat*a.lng;
  if (Math.abs(det) <= eps) return 1;
  if (det > eps) return 1;
  if (det < eps) return -1;
}



// determina punctul de intersectie al dreptelor determinate de punctele primite ca parametri
function intersect(a, b, c, d)
{
  var a1, b1, c1, a2, b2, c2, X = -inf, Y = -inf;
  //verificare perpendicularitate
  if (a.lat === b.lat) X = a.lat;
  if (c.lat === d.lat) X = c.lat;
  if (a.lng === b.lng) Y = a.lng;
  if (c.lng === d.lng) Y = c.lng;

  // se calculeaza coeficientii ecuatiilor generale ale celor doua drepte
  a1 = b.lng-a.lng;
  b1 = a.lat-b.lat;
  c1 = a.lng*(a.lat-b.lat) + a.lat*(b.lng-a.lng);
  a2 = d.lng-c.lng;
  b2 = c.lat-d.lat;
  c2 = c.lng*(c.lat-d.lat) + c.lat*(d.lng-c.lng);

  // se calculeaza coordonatele punctului de intersectie
  if (Y === -inf)
    Y = (c1 - a1*c2/a2)/(b1-a1*b2/a2);
  if (X === -inf)
    X = (c1-Y*b1)/a1;
  return {lat:X, lng:Y};
}


// functia principala, apelata din main.js, care va calcula coordonatele varfurilor nucleului poligonului desenat si le va salva in lista 'kernel'
// poligon = lista varfurilor poligonului, n = numarul de varfuri, kernel = lista varfurilor nucleului
function getKernel(poligon, n, kernel)
{

  var count = -1; // va numara varfurile nucleului
  var temp = []; // solutie temporara
  var box = []; // "bounding box", solutia curenta
  var m; // contor pentru temp
  var order; // identifica ordinea varfurilor poligonului
  var a, b; // a = indice vf. curent; b = indice vf. urmator
  var  signa, signb; // var folosite pt aflarea pozitionarii unui punct fata de o latura
  var i, j;
  
  poligon[n] = poligon[0]; // pentru a putea parcurge ultima latura
  order = checkOrder(poligon, n); // determina ordinea in care vor fi parcurse laturile
 
  // initializare dreptunghi care include poligonul dat
  var minlat = poligon[0].lat;
  var maxlat = poligon[0].lat;
  var minlng = poligon[0].lng;
  var maxlng = poligon[0].lng;

  for (i = 1; i < n; i++) 
  {
    if (poligon[i].lat < minlat) minlat = poligon[i].lat;
    if (poligon[i].lat > maxlat) maxlat = poligon[i].lat;
    if (poligon[i].lng < minlng) minlng = poligon[i].lng;
    if (poligon[i].lng > maxlng) maxlng = poligon[i].lng;
  }
  count = 3;
  box[0] = {lat:minlat, lng:minlng};
  box[1] = {lat:maxlat, lng:minlng};
  box[2] = {lat:maxlat, lng:maxlng};
  box[3] = {lat:minlat, lng:maxlng};
  //terminat initializare dreptunghi

  for (i = 0; i < n; i++) // se parcurge fiecare latură a poligonului
  {
    a = 0; b = 1;
    m = -1;
    if (count >= 2)
      do
      {
        signa = sign(poligon[i], poligon[i+1], box[a]); // verificare pozitionare varf curent fata de latura parcursa
        signb = sign(poligon[i], poligon[i+1], box[b]); // verificare pozitionare varf urmator fata de latura parcursa
        if (signa !== -order && signb !== -order) // ambele in interior
          temp[++m] = box[b]; // adaugam solutiei punctul urmator
        if (signa !== -order && signb === -order) // a interior, b exterior 
          temp[++m] = intersect(poligon[i], poligon[i+1], box[a], box[b]);  // adaugam solutiei punctul de intersectie 
        if (signa === -order && signb !== -order) // a exterior, b interior
        {
          temp[++m] = intersect(poligon[i], poligon[i+1], box[a], box[b]); // adaugam punctul de intersectie
		  temp[++m] = box[b]; // adaugam punctul urmator
        }
        ++a; if (a > count) a = 0;
        ++b; if (b > count) b = 0;
      }
      while (a !== 0);

    for (j = 0; j <= m; j++) // se salveaza solutia temporara in cea curenta
      box[j] = temp[j];
	count = m;
  }

  var k=0;
  for (i = 0; i <= count; i++) { //salvez solutia in lista kernel
	for (j=0; j<k; j++)
		if( (Math.abs(box[i].lat - kernel[j].lat) < eps*1000) && (Math.abs(box[i].lng - kernel[j].lng) < eps*1000)) // pentru a evita duplicatele
			break;
	if (j===k) {
		kernel[k] = box[i];
		k++;
	}
  }
}
