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
var myquery = 'SELECT DISTINCT * WHERE { ?s geo:lat ?la . ?s geo:long ?lo . FILTER(?la>48.85 AND ?la<48.86 AND ?lo>2.351 AND ?lo<2.352) . } LIMIT 100';
sparqler.send( myquery, function( error, data ) {
    // console.log( data.results.bindings );
});
console.log('a');
console.log(myquery);






/**
 * Query a GraphDB
 *
 */

const prefix = "prefix xsd: <http://www.w3.org/2001/XMLSchema#> \n" +
            "prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n" +
            "prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n" +
            "prefix cui: <http://cui.unige.ch/> \n"
            // console.log(prefix);


// query pour récupérer tous les POIs
const allPOIs = prefix + "select * where { ?s a cui:POI. }";

graphdb.Query.query(allPOIs, (err, data) => {
    // console.log(data);
    // console.log(err);
});

// query pour récuperer tous les POIs et leurs noms
const allPOIsName = prefix + "select * where {?s a cui:POI. ?s :name ?o .}";

graphdb.Query.query(allPOIsName, (err, data) => {

    // console.log(data);
    // console.log(err);
});

//plus utile
// var select2 = "PREFIX : <http://cui.unige.ch/> prefix xsd: <http://www.w3.org/2001/XMLSchema#> prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix cui: <http://cui.unige.ch/> select * where { ?s a cui:trk. ?s :name ?o. ?poi a cui:POI. ?t a cui:trkpt. ?t cui:hasClosePOI ?poi. ?s cui:trackpoints ?t. ?poi cui:lat ?lat. ?poi cui:lon ?lon. }";
//
// graphdb.Query.query(select2, (err, data) => {
//     resAllPOIsByTrack = data;
//     console.log(typeof(data));
//     // console.log(data);
//     // console.log(err);
// });
// var select2 = "PREFIX : <http://cui.unige.ch/> prefix xsd: <http://www.w3.org/2001/XMLSchema#> prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix cui: <http://cui.unige.ch/> select * where { ?s a cui:trk. ?s :name ?o. ?poi a cui:POI. ?t a cui:trkpt. ?t cui:hasClosePOI ?poi. ?s cui:trackpoints ?t. ?poi cui:lat ?lat. ?poi cui:lon ?lon. }";


// query pour récupérer tous les trackname

const allTrackName = prefix +
    "select ?trk where {" +
	"?s a cui:trk." +
    "?s cui:name ?trk." +
    "}";

var resAllTrackName ='';


async function getAllTrackName() {
    // const allPOIsByTrack = "PREFIX : <http://cui.unige.ch/> prefix xsd: <http://www.w3.org/2001/XMLSchema#> prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix cui: <http://cui.unige.ch/> select * where { ?s a cui:trk. ?s :name ?o. ?poi a cui:POI. ?t a cui:trkpt. ?t cui:hasClosePOI ?poi. ?s cui:trackpoints ?t. ?poi cui:lat ?lat. ?poi cui:lon ?lon. }";

    await graphdb.Query.query(allTrackName, (err, data) => {
                // console.log(data);
                // const obj = JSON.parse(data)
                // console.log(obj.poi);
                resAllTrackName += data;
                // console.log(typeof(data));
                // console.log(data);
            });
            // console.log(resAllPOIsByTrack);
};
getAllTrackName().then();



// query pour récuperer tous les pois par track

// const allPOIsByTrackTT = "PREFIX : <http://cui.unige.ch/> prefix xsd: <http://www.w3.org/2001/XMLSchema#> prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix cui: <http://cui.unige.ch/> select * where { ?s a cui:trk. ?s :name ?o. ?poi a cui:POI. ?t a cui:trkpt. ?t cui:hasClosePOI ?poi. ?s cui:trackpoints ?t. ?poi cui:lat ?lat. ?poi cui:lon ?lon. }";
const allPOIsByTrack = prefix +
    "select ?trk ?namepoi ?lat ?lon where {" +
	"?s a cui:trk." +
    "?s cui:name ?trk." +
    "?poi a cui:POI." +
    "?t a cui:trkpt." +
    "?t cui:hasClosePOI ?poi." +
    "?s cui:trackpoints ?t." +
    "?poi cui:lat ?lat." +
    "?poi cui:lon ?lon." +
    "?poi cui:name ?namepoi" +
    "}";

var resAllPOIsByTrack ='';


async function getAllPOIsByTrack() {
    // const allPOIsByTrack = "PREFIX : <http://cui.unige.ch/> prefix xsd: <http://www.w3.org/2001/XMLSchema#> prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix cui: <http://cui.unige.ch/> select * where { ?s a cui:trk. ?s :name ?o. ?poi a cui:POI. ?t a cui:trkpt. ?t cui:hasClosePOI ?poi. ?s cui:trackpoints ?t. ?poi cui:lat ?lat. ?poi cui:lon ?lon. }";

    await graphdb.Query.query(allPOIsByTrack, (err, data) => {
                // console.log(data);
                // const obj = JSON.parse(data)
                // console.log(obj.poi);
                resAllPOIsByTrack += data;
                // console.log(typeof(data));
                // console.log(data);
            });
            // console.log(resAllPOIsByTrack);
};
getAllPOIsByTrack().then();


// QUERY de tous les POIs groupe par track
// PREFIX : <http://cui.unige.ch/>
// prefix xsd: <http://www.w3.org/2001/XMLSchema#>
// prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
// prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
//
// prefix cui: <http://cui.unige.ch/>
//
// select * where {
// 	?s a cui:trk.
//     ?s :name ?o.
//     ?poi a cui:POI.
//     ?t a cui:trkpt.
//     ?t cui:hasClosePOI ?poi.
//     ?s cui:trackpoints ?t.
//
// }

//ajout lat et lon de poi
// select * where {
// 	?s a cui:trk.
//     ?s :name ?o.
//     ?poi a cui:POI.
//     ?t a cui:trkpt.
//     ?t cui:hasClosePOI ?poi.
//     ?s cui:trackpoints ?t.
//     ?poi cui:lat ?lat.
//     ?poi cui:lon ?lon.
//
// }


// QUERY DES POIs
// PREFIX : <http://cui.unige.ch/>
// prefix xsd: <http://www.w3.org/2001/XMLSchema#>
// prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
// prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
//
// prefix cui: <http://cui.unige.ch/>
//
// select * where {
// 	?s a cui:POI.
// }

// QUERY DES NAME DE POIs
// PREFIX : <http://cui.unige.ch/>
// prefix xsd: <http://www.w3.org/2001/XMLSchema#>
// prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
// prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
//
// prefix cui: <http://cui.unige.ch/>
//
// select * where {
// 	?s a cui:POI.
//     ?s :name ?o .
// }
// console.log('a');
// // console.log(resAllPOIsByTrack);
// console.log('b');

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

  response.write('<h1>Salut à toi</h1>');
  response.write('<p>');
  response.write(essai);
  response.write('<p>');
  response.end();
});
