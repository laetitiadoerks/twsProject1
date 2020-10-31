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
var myquery = 'SELECT DISTINCT * WHERE { ?s geo:lat ?la . ?s geo:long ?lo . FILTER(?la>45.7970 AND ?la<45.8096 AND ?lo>6.3874 AND ?lo<6.4250) . }';
sparqler.send( myquery, function( error, data ) {
    // console.log( data.results.bindings );
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



// query pour récupérer tous les trackname

const allTrackName = prefix +
    "select ?trk where {" +
	"?s a cui:trk." +
    "?s cui:name ?trk." +
    "}";

const resAllTrackName = [];
vari = '';

async function getAllTrackName() {
    // const allPOIsByTrack = "PREFIX : <http://cui.unige.ch/> prefix xsd: <http://www.w3.org/2001/XMLSchema#> prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix cui: <http://cui.unige.ch/> select * where { ?s a cui:trk. ?s :name ?o. ?poi a cui:POI. ?t a cui:trkpt. ?t cui:hasClosePOI ?poi. ?s cui:trackpoints ?t. ?poi cui:lat ?lat. ?poi cui:lon ?lon. }";

    await graphdb.Query.query(allTrackName, (err, data) => {
                // console.log(data[125]);
                const i = JSON.parse(data);
                // const obj = JSON.parse(data)
                // console.log(obj.poi);
                // resAllTrackName += data;
                // console.log(typeof(i));
                // console.log(i.results.bindings[1].trk.value);
                i.results.bindings.forEach((name, a) => {
                    // console.log(i.results.bindings[a].trk.value);
                    vari = i.results.bindings[a].trk.value;
                    resAllTrackName.push(vari);

                });

                // console.log(data);
            });
            // console.log(resAllPOIsByTrack);
            // return resAllTrackName;
};
getAllTrackName().then();



// query pour récuperer tous les pois par track


const resAllPOIsByTrack = [];
var vara ='';
var tempo ='';

/*
*TODO: le faire pour la liste des trackname
*enlever lon et lat de la query
*/
async function getAllPOIsByTrack(trackname) {
    // const allPOIsByTrack = "PREFIX : <http://cui.unige.ch/> prefix xsd: <http://www.w3.org/2001/XMLSchema#> prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> prefix cui: <http://cui.unige.ch/> select * where { ?s a cui:trk. ?s :name ?o. ?poi a cui:POI. ?t a cui:trkpt. ?t cui:hasClosePOI ?poi. ?s cui:trackpoints ?t. ?poi cui:lat ?lat. ?poi cui:lon ?lon. }";
    var trackname2 = 'Refuge Maison Vieille - Refuge Bertone';
    // console.log(trackname);
    const allPOIsByTrack = prefix +
        "select ?namepoi ?lat ?lon where {" +
    	"?s a cui:trk." +
        "?s cui:name \"" + trackname2 + "\"." +
        "?poi a cui:POI." +
        "?t a cui:trkpt." +
        "?t cui:hasClosePOI ?poi." +
        "?s cui:trackpoints ?t." +
        "?poi cui:lat ?lat." +
        "?poi cui:lon ?lon." +
        "?poi cui:name ?namepoi" +
        "}";
    await graphdb.Query.query(allPOIsByTrack, (err, data) => {
                // console.log(data);
                // const obj = JSON.parse(data)
                // console.log(obj.poi);
                tempo += data;
                console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
                console.log(typeof(tempo));
                // console.log(tempo);
                // const b = JSON.parse(tempo);
                // // console.log(b);
                // b.results.bindings.forEach((name, a) => {
                //     // console.log(i.results.bindings[a].trk.value);
                //     vara = b.results.bindings[a].trk.value;
                //     resAllTrackName.push(vara);

                // });
            });
            /*
            *TODO: faire tableau de poi pour une track
            */
            setTimeout(function(){
                const b = JSON.parse(tempo);
                console.log('b');
                console.log(typeof(b));
                b.results.bindings.forEach((name, a) => {
                   // console.log(b.results.bindings[a].lon.value); -> pas utile pour le retour a l'utilisateur
                   console.log(b.results.bindings[a].namepoi.value);
                   // console.log(b.results.bindings[a].lat.value); -> pas utile pour le retour a l'utilisateur
                   vara = b.results.bindings[a].namepoi.value;
                   resAllPOIsByTrack.push(vara);
                   });

                }, 500);



};
var tracksInfoArray = [];
setTimeout(function(){
    resAllTrackName.forEach(trackname => {
        console.log(resAllTrackName.indexOf(trackname));
        console.log(trackname);
        getAllPOIsByTrack(trackname).then();
        setTimeout(function(){
            tracksInfoArray.push(resAllPOIsByTrack);
            var resAllPOIsByTrack = [];

        }, 600);
    });
}, 2000);

// getAllPOIsByTrack(resAllTrackName[0]).then()


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

  response.write('<h1>Guide touristique des alentours des Montagnes autour du Mont Blanc</h1>');

  response.write('<h2>Premier itinéraire</h2>');
  response.write('<h3>' + tracksInfoArray + '</h3>');
  response.write('<p>');
  response.write(resAllPOIsByTrack.reduce((a,b)=>a+' \n '+b,''));
  response.write('</p>');


  response.write('<h2>Second itinéraire</h2>');
  response.write('<h3>' + resAllTrackName[1] + '</h3>');
  response.write('<p>');
  response.write(tempo);
  response.write('</p>');


  // response.write('<h2>Troisième itinéraire</h2>');
  // response.write('<h3>' + resAllTrackName[2] + '</h3>');
  // response.write('<p>');
  // response.write(resAllPOIsByTrack);
  // response.write('</p>');
  //
  //
  // response.write('<h2>Qutrième itinéraire</h2>');
  // response.write('<h3>' + resAllTrackName[3] + '</h3>');
  // response.write('<p>');
  // response.write(resAllPOIsByTrack);
  // response.write('</p>');
  //
  //
  // response.write('<h2>Cinquième itinéraire</h2>');
  // response.write('<h3>' + resAllTrackName[4] + '</h3>');
  // response.write('<p>');
  // response.write(resAllPOIsByTrack);
  // response.write('</p>');
  //
  //
  // response.write('<h2>Sixième itinéraire</h2>');
  // response.write('<h3>' + resAllTrackName[5] + '</h3>');
  // response.write('<p>');
  // response.write(resAllPOIsByTrack);
  // response.write('</p>');
  //
  //
  // response.write('<h2>Septième itinéraire</h2>');
  // response.write('<h3>' + resAllTrackName[6] + '</h3>');
  // response.write('<p>');
  // response.write(resAllPOIsByTrack);
  // response.write('</p>');
  //
  //
  // response.write('<h2>Huitième itinéraire</h2>');
  // response.write('<h3>' + resAllTrackName[7] + '</h3>');
  // response.write('<p>');
  // response.write(resAllPOIsByTrack);
  // response.write('</p>');


  response.end();
});
