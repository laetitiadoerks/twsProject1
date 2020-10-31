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

 /*
 *TODO: faire la requete dbpedia pour chaqune des tracks
 */

// query sur les alentours des tracks
var resultsDBpedia ='';
var myquery = 'SELECT DISTINCT * WHERE { ?s geo:lat ?la . ?s geo:long ?lo . FILTER(?la>45.7970 AND ?la<45.8096 AND ?lo>6.3874 AND ?lo<6.4250) . }';
sparqler.send( myquery, function( error, data ) {
    // console.log( data.results.bindings[0].s.value );
    // console.log(typeof(data.results.bindings[0]));
    resultsDBpedia = data.results.bindings[0].s.value;
});
console.log('dbpedia query');
console.log(myquery);

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
        //console.log(trackname);

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

//pareil
// setTimeout(function () {
//     console.log(tracksInfoArray);
// }, 4100);

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
      response.write('<h2>Itinéraire:' + tracksInfoArray[tracksInfoArray.indexOf(tracksInfo)][0] + '</h2>');
      response.write('<p>');
      response.write(tracksInfoArray[tracksInfoArray.indexOf(tracksInfo)][1].reduce((a,b)=>a+' <br> '+b,''));
      response.write('<br>');
      response.write('<a href=\"' + resultsDBpedia + '\">' + resultsDBpedia + '</a>');
      response.write('</p>');
  });

  response.end();
});
