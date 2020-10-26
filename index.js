const parser = require('fast-xml-parser');
const fs = require('fs');
const {v4: uuid} = require('uuid');
const axios = require('axios').default;

const sparqler = require('sparqling-star');
var myquery = new sparqler.Query();
var album = {
    'type': 'dbo:Album',
    'dbo:artist' : 'dbr:Eminem'
};
myquery.registerVariable( 'album', album );
var sparqler = new sparqler.Client();
sparqler.send( myquery, function( error, data ) {
    console.log( data.results.bindings );
});



//constances de base pour rdfs
const schemeHeader = "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n" +
    "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.\n" +
    "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n\n" +
    "@prefix : <http://cui.unige.ch/> . \n\n"


console.log("TWS converter");

//parsage des point gpx -> des trackpt
function parseGPX(gpxFile) {
    let trackPoints = gpxFile.child.gpx[0].child.trk[0];
    let trackName = trackPoints.child.name[0].val;
    let points = trackPoints.child.trkseg[0].child.trkpt;

    //boucle sur les pointd parser et on récupère les infos des points qu'on mets dans une liste et on retourne une track avec des points comme on veut
    let parsedPoints = [];
    points.forEach(point => {
        let parsedPoint = {
            lat: Number(point.attrsMap["@_lat"]),
            lon: Number(point.attrsMap["@_lon"]),
            ele: point.child.ele[0].val,
            time: point.child.time[0].val
            // time: Date(point.child.time[0].val)
        };
        console.log(parsedPoint);
        parsedPoints.push(parsedPoint);
    });

    return {name: trackName, trackPoints: parsedPoints};
}
//creation d'un triple par points
function generateGraphDBPoint(point) {
    let pointId = ':swt-trkpt-' + uuid();
    let schemeString = pointId + ' a :trkpt . \n';
    schemeString += pointId + ' :lat ' + point.lat + ' .\n';
    schemeString += pointId + ' :lon ' + point.lon + ' .\n';
    schemeString += pointId + ' :ele ' + point.ele + ' .\n';
    schemeString += pointId + ' :time ' + point.time + ' .\n';

    if (point.poi) {
      let generatedPOI = generateGraphDBPoi(point.poi);
      schemeString += generatedPOI.value;
      schemeString += pointId + ' :hasClosePOI ' + generatedPOI.id + ' .\n';
    }

    return {id: pointId, value: schemeString};
}

function generateGraphDBPoi(poi) {
    let poiId = ':swt-poi-' + poi.id;
    let schemeString = poiId + ' a :POI . \n';
    schemeString += poiId + ' :lat ' + poi.lat + ' .\n';
    schemeString += poiId + ' :lon ' + poi.lon + ' .\n';
    if (poi.tags.name) {
        schemeString += poiId + ' :name "' + poi.tags.name + '" .\n';
        if (poi.tags.tourism) {
            schemeString += poiId + ' :type "tourism" .\n';
        } else if (poi.tags.natural) {
            schemeString += poiId + ' :type "natural" .\n';
        } else if (poi.tags.amenity) {
            schemeString += poiId + ' :type "amenity" .\n';
        } else if (poi.tags.sport) {
            schemeString += poiId + ' :type "sport" .\n';
        }
    }
    return {id: poiId, value: schemeString};
}

//creation de sequence de triple -> trk direct
function generateGraphDBScheme(gpx) {
    let trackId = ':swt-trk-' + uuid();
    let pointsScheme = '';
    let pointIds = [];
    gpx.trackPoints.forEach((point) => {
        let graphDbPoint = generateGraphDBPoint(point);
        pointsScheme += graphDbPoint.value + "\n";
        pointIds.push(graphDbPoint.id);
    });
    let schemeString = schemeHeader + pointsScheme + trackId + ' a :trk . \n';
    schemeString += trackId + ' :name "' + gpx.name + '" .\n';
    schemeString += ':trackpoints a rdf:Seq .\n';

    pointIds.forEach((id) => {
        schemeString += trackId + ' :trackpoints ' + id + ' .\n';
    });


    return schemeString;
}


//
async function fetchOSMData(bounds) {
    let response = await axios.get('https://api.openstreetmap.org/api/0.6/map?bbox=' + bounds.bottomLeft.lon + ',' + bounds.bottomLeft.lat + ',' + bounds.topRight.lon + ',' + bounds.topRight.lat);
    let elements = response.data.elements;
    let filteredElements = [];
    if (elements) {
        elements.forEach(element => {
            if (element.type === 'node' && element.tags && (element.tags.tourism || element.tags.natural || element.tags.amenity || element.tags.sport)) {
                filteredElements.push({id: element.id, lat: element.lat, lon: element.lon, tags: element.tags});
            }
        });
    }
    console.log(filteredElements);
    return filteredElements;
}

function findBounds(points) {
    let topRightPoint = points[0];
    let bottomLeftPoint = points[1];
    points.forEach((point) => {
        if (point.lat >= topRightPoint.lat) {
            topRightPoint.lat = point.lat;
        }
        if (point.lon >= topRightPoint.lon) {
            topRightPoint.lon = point.lon;
        }
        if (point.lat <= bottomLeftPoint.lat) {
            bottomLeftPoint.lat = point.lat;
        }
        if (point.lon <= bottomLeftPoint.lon) {
            bottomLeftPoint.lon = point.lon;
        }
    });

    return {topRight: topRightPoint, bottomLeft: bottomLeftPoint};
}

function linkPOIsNearTrack(points, pois) {
    pois.forEach(poi => {
        let nearestPoint;
        let nearestDistance = Number.MAX_VALUE;

        points.forEach(point => {
            let distance = distanceBetweenPoints(point.lat, point.lon, poi.lat, poi.lon);
            if (distance < 0.5 && distance < nearestDistance) {
                nearestPoint = point;
                nearestDistance = distance;
            }
        });
        if (nearestPoint) {
            nearestPoint.poi = poi;
        }
    });
}

//distance between point in KM -> https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
function distanceBetweenPoints(lat1, lon1, lat2, lon2) {
    let R = 6371; // km
    let dLat = toRad(lat2 - lat1);
    let dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return d;
}

function toRad(Value) {
    return Value * Math.PI / 180;
}



fs.readFile('gpx/4sDDFdd4cjA.gpx', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    let root = parser.getTraversalObj(data, {ignoreAttributes: false});
    let parsedGpx = parseGPX(root);
    let bounds = findBounds(parsedGpx.trackPoints);
    fetchOSMData(bounds).then(osmPOIs => {
        linkPOIsNearTrack(parsedGpx.trackPoints, osmPOIs)
        //TODO: generate scheme with linked POIs
        let scheme = generateGraphDBScheme(parsedGpx);
        fs.writeFile('gpx.ttl', scheme, function (err) {
            if (err) throw err;
            console.log('Saved!');
        });

    });

});
