'use strict';

var _ = require('underscore');
var request = require('request');
var Datastore = require('nedb');
var socketIo = require('socket.io');

var fs = require('fs');
var http = require('http');
var path = require('path');


var FLICKR_API_KEY = process.env.FLICKR_API_KEY;
if (!FLICKR_API_KEY) {
    console.log('No FLICKR_API_KEY set.');
    process.exit(-1);
}

var FLICKR_END_POINT = 'https://api.flickr.com/services/rest/';

var flickr = {};

var db = new Datastore({filename: 'photos.db', autoload: true});
db.ensureIndex({fieldName: 'id', unique: true});

function lonLatToFloat(s) {
    var LON_LAT_RE = /(\d+)\s+deg\s+(\d+)'\s+([\d\.]+)"\s+([NESW])/;
    var m = LON_LAT_RE.exec(s);
    if (!m) {
        return 0;
    }
    var hours = parseFloat(m[1]);
    var minutes = parseFloat(m[2]);
    var seconds = parseFloat(m[3]);
    var dir = m[4];
    minutes /= 60;
    seconds /= 3600;
    var v = hours + minutes + seconds;
    if (dir === 'S' || dir === 'W') {
        v = -v;
    }
    return v;
}

flickr.getRecent = function (callback) {
    var args = {
        method: 'flickr.photos.getRecent',
        api_key: FLICKR_API_KEY,
        format: 'json',
        nojsoncallback: '1'
    };
    request({url: FLICKR_END_POINT, qs: args}, callback);
};

flickr.getExif = function (photoId, callback) {
    var args = {
        method: 'flickr.photos.getExif',
        api_key: FLICKR_API_KEY,
        photo_id: photoId,
        format: 'json',
        nojsoncallback: '1'
    };
    request({url: FLICKR_END_POINT, qs: args}, callback);
};

function processPhotos(photos) {
    for (var i = 0; i < photos.length; i++) {
        var photo = photos[i];
        flickr.getExif(photo.id, function (err, res, body) {
            if (err) {
                console.log('ERR getExif', err);
                return;
            }
            if (res.statusCode !== 200) {
                console.log('ERR getExif', res.statusCode);
                return;
            }
            var json = JSON.parse(body);
            if (json.stat !== 'ok') {
                return;
            }
            // console.log(json.photo.id);
            var exif = json.photo.exif;
            //console.log(_.pluck(exif, 'label'));
            var lonString = _.findWhere(exif, {tag: 'GPSLongitude'});
            var latString = _.findWhere(exif, {tag: 'GPSLatitude'});
            var timestampString = _.findWhere(exif, {tag: 'GPSTimeStamp'});
            if (!lonString || !latString || !timestampString) {
                return;
            }
            var lon = lonLatToFloat(lonString.clean._content);
            var lat = lonLatToFloat(latString.clean._content);
            var timestamp = timestampString.raw._content;
            var url = 'http://farm' + json.photo.farm + '.staticflickr.com/' + json.photo.server + '/' + json.photo.id + '_' + json.photo.secret + '_s.jpg';
            console.log(timestamp, json.photo.id, lon, lat);
            var doc = {
                id: json.photo.id,
                secret: json.photo.secret,
                server: json.photo.server,
                farm: json.photo.farm,
                url: url,
                longitude: lon,
                latitude: lat,
                timestamp: timestamp,
                exif: JSON.stringify(exif)
            };
            // Inserting could fail if the photo already exists. Just let it fail.
            db.insert(doc);
            if (io) {
                io.emit('photo', doc);
            }
        });
    }
}


function fetchRecentPhotos() {
    console.log('Fetching recent photos');
    flickr.getRecent(function (err, res, body) {
        if (err) {
            console.log(err);
        } else if (res.statusCode === 200) {
            var json = JSON.parse(body);
            processPhotos(json.photos.photo);
        } else {
            console.log('ERROR getRecent', res.statusCode);
        }
    });
}

setInterval(fetchRecentPhotos, 30 * 1000);

var CONTENT_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.png': 'image/png',
    '.js': 'text/javascript'
};

var server = http.createServer(function (req, res) {
    console.log('HTTP', req.url);
    var url = req.url;
    if (url === '/') {
        url = 'index.html';
    }
    var filePath = path.join('static', url);
    fs.readFile(filePath, function (err, data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Error: ' + err);
        } else {
            var contentType = CONTENT_TYPES[path.extname(filePath)] || 'text/plain';
            res.writeHead(200, {'Content-Type': contentType});
            res.end(data);
        }
    });
});

var io = socketIo(server);

io.on('connection', function (socket) {
    console.log('a user connected');
    db.find({}, function (err, docs) {
        if (err) {
            console.log('DB err', err);
        } else {
            for (var i = 0; i < docs.length; i += 1) {
                var doc = docs[i];
                socket.emit('photo', doc);
            }
        }
    });
});

var SERVER_PORT = process.env.PORT || 8080;
server.listen(SERVER_PORT, function () {
    console.log('listening on http://localhost:' + SERVER_PORT + '/');
});




