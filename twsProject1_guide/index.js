const parser = require('fast-xml-parser');
const fs = require('fs');
const {v4: uuid} = require('uuid');

//connection a graphdb -> serveur
const GraphDB = require('graphdb-js');

let graphdb = new GraphDB({
    hostname: "localhost",
    repository: "tws_laetitia_valentin"
});

//definition des préfix -> pas utilisé
const schemeHeader = "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n" +
    "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.\n" +
    "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n\n" +
    "@prefix : <http://cui.unige.ch/> . \n\n"

//connection dbpedia
var sparqler = require('sparqling-star');
var sparqler = new sparqler.Client();


/**
 * Query a DBpedia
 *
 */

// query sur les alentours des tracks
//tableau des bounds de chaque track: [nom de la track, [latmin, latmax], [lonmin, lonmax]]
var bounds = [["Le Môle", [46.098716, 46.11035], [6.438214, 6.457551]],
    ["La Tournette", [45.821642, 45.832557], [6.262702, 6.28652]],
    ["Le Mont Charvin en boucle", [45.797068, 45.809523], [6.38742, 6.42494]],
    ["Pic de Marcelly", [46.128024, 46.139094], [6.572387, 6.59701]],
    ["Le tour du pic du Jalouvre", [45.980146, 45.999655], [6.429688, 6.468717]],
    ["Balcon du Léman par le Signal des Voirons", [46.189796, 46.234077], [6.33679, 6.358298]],
    ["La Croix des 7 frères depuis Agy", [46.025684, 46.078739], [6.621539, 6.663864]],
    ["Refuge Maison Vieille - Refuge Bertone", [45.788124, 45.808638], [6.931023, 6.985976]]];

var range = 0.02; //pour agrandir la zone
var resultsDBpedia = [];

bounds.forEach(bound => {
    var myquery = 'SELECT DISTINCT * WHERE ' +
        '{ ?s geo:lat ?la . ?s geo:long ?lo . FILTER(' +
        '?la>' + (bound[1][0]-range) + ' AND ' +
        '?la<' + (bound[1][1]+range) + ' AND ' +
        '?lo>' + (bound[2][0]-range) + ' AND ' +
        '?lo<' + (bound[2][1]+range) + ') . }';

    sparqler.send( myquery, function( error, data ) {

        if(data.results.bindings[0]){
            var dbPediaPOIArray = [];
            data.results.bindings.forEach(dbPediaPOI =>{
                dbPediaPOIArray.push(dbPediaPOI.s.value);
            });

            resultsDBpedia.push([bound[0], dbPediaPOIArray]);
        }
        else{
            resultsDBpedia.push([bound[0], []]);
        }
    });
});

/**
 * Query a GraphDB
 *
 */

const prefix = "prefix xsd: <http://www.w3.org/2001/XMLSchema#> \n" +
            "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n" +
            "prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n" +
            "prefix cui: <http://cui.unige.ch/> \n"


// query pour récupérer tous les trackname
const allTrackName = prefix +
    "select ?trk where {" +
	"?s a cui:trk." +
    "?s cui:name ?trk." +
    "}";

const resAllTrackName = [];
vari = '';

async function getAllTrackName() {
    await graphdb.Query.query(allTrackName, (err, data) => {
                const i = JSON.parse(data);

                i.results.bindings.forEach((name, a) => {
                    vari = i.results.bindings[a].trk.value;
                    resAllTrackName.push(vari);

                });
            });
};

getAllTrackName().then();

// query pour récuperer tous les pois par track
var resAllPOIsByTrack = [];
var tracksInfoArray = [];
var vara ='';
var tempo ='';

async function getAllPOIsByTrack(trackname) {
    resAllPOIsByTrack = [];
    vara ='';
    tempo ='';

    var allPOIsByTrack = prefix +
        "select ?namepoi where {" +
    	"?s a cui:trk." +
        "?s cui:name \"" + trackname + "\"." +
        "?poi a cui:POI." +
        "?t a cui:trkpt." +
        "?t cui:hasClosePOI ?poi." +
        "?s cui:trackpoints ?t." +
        "?poi cui:lat ?lat." +
        "?poi cui:lon ?lon." +
        "?poi cui:name ?namepoi" +
        "}";

    await graphdb.Query.query(allPOIsByTrack, (err, data) => {
        var obj = JSON.parse(data)

        obj.results.bindings.forEach((name, a) => {
           vara = obj.results.bindings[a].namepoi.value;
           resAllPOIsByTrack.push(vara);
        });

        tracksInfoArray.push([trackname, resAllPOIsByTrack]);
        resAllPOIsByTrack = [];
    });
};

//attend pour être sur d'avoir les résultats
setTimeout(function(){
    resAllTrackName.forEach(trackname => {
        getAllPOIsByTrack(trackname).then();
    });
}, 2000);

/**
 * Affichage sur page HTML
 *
 */
const http = require('http');
const server = http.createServer();
server.listen(4000, 'localhost');

server.on('request', (request, response) => {
  const content_type = 'text/html; charset=utf-8';
  response.setHeader('Content-Type', content_type); // (1)

  response.write('<h1>Guide touristique des alentours des Montagnes autour du Mont Blanc</h1>');

  tracksInfoArray.forEach(tracksInfo => {
      response.write('<h2>Itinéraire: ' + tracksInfoArray[tracksInfoArray.indexOf(tracksInfo)][0] + '</h2>');
      response.write('<p>');
      response.write(tracksInfoArray[tracksInfoArray.indexOf(tracksInfo)][1].reduce((a,b)=>a+' <br> '+b,''));
      response.write('<br>');
      resultsDBpedia.forEach(dbPediaPOIs => {
          if(dbPediaPOIs[0] == tracksInfoArray[tracksInfoArray.indexOf(tracksInfo)][0]){
              dbPediaPOIs[1].forEach(POIs => {
                  response.write('<a href=\"' + POIs + '\">' + POIs + '</a>');
                  response.write('<br>');
              });
          }
      });

      response.write('</p>');
  });

  response.end();
});
