# GM-Kernel-GIS
![GMKernel interface](https://github.com/stefaniof/GM-Kernel-GIS/blob/master/img/Picture1.jpg)
GIS created in Javascript, HTML 5, CSS 3 and Bootstrap 4, which uses the Google Maps API and allows users to draw geometric shapes on the map. More specifically, this app includes an O(n2) implementation in Javascript of an algorithm which computes the kernel of a polygon drawn by the user on the map.
This app was created as a project for my Bachelor's Thesis, in order to demonstrate some concepts in the field of computational geometry.

Note: Google has recently made some policy changes to their maps. The map will display with the watermark "For development purposes only" unless you get a Google API Key and replace my API key in index.html.

All comments and explanations are provided in Romanian.

------------------------------------------------------------------

Problema calculării nucleului unui poligon simplu, derivată din cea a intersecției de semiplane,  presupune determinarea locului geometric care  conține punctele din care toate vârfurile poligonului sunt vizibile. Reprezentantă a unei clase mai vaste, cea a problemelor 
de vizibilitate, aceasta apare într-o varietate de aplicații în grafică, analiză de scenă, robotică etc.

Determinarea  precisă a  unor poziții din teren de unde sunt vizibile toate împrejurimile are un potențial enorm pentru numeroase domenii, dintre care pot fi amintite:
-  Militar: amplasarea unor elemente de supraveghere, de cercetare sau de protecție a forței;
-  Turism: amplasarea unor obiective turistice (hoteluri, pensiuni, platforme de vizualizare etc.);
-  Jocuri: poziționarea turnurilor de apărare în jocurile de strategie, poziționarea AI în jocuri tip ”shooter” etc. ;
-  Robotică: deplasarea unui robot către o zonă de unde poate vedea întregul mediu.

![GMKernel screenshot](https://github.com/stefaniof/GM-Kernel-GIS/blob/master/img/Picture2.jpg)
