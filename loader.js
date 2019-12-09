const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

var url = 'https://shoreline.nz/whats-on-today/';

function checkInternet(cb) {
    require('dns').lookup('google.com', function (err) {
        if (err && err.code == "ENOTFOUND") {
            cb(false);
        } else {
            cb(true);
        }
    })
}
function cI() {
    checkInternet(function (isConnected) {
        if (isConnected) {
            function loadMovies() {
                request(url, function (err, resp, body) {
                    if (err) {
                        console.log(err);
                        console.log('An error occurred, trying again soon.');
                    }
                    $ = cheerio.load(body);
                    var divlist = $('.information .movie-list').html();
					
                    var children = $('.information .movie-list').children().length;
					console.log(children);
                    var child;
                    let movies = [];

                    var download = function (uri, filename, callback) {
                        request.head(uri, function (err, res, body) {
                            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
                        });
                    };

                    for (child = 0; child < children; child++) {
                        var obj = {};
                        var title = $('.featured-poster div a').first().next().text();
                        var url = $('.featured-poster div a img').first().attr('src');
                        var time = $('.featured-poster div p strong').first().text();
                        if ($('.featured-poster div p strong').first().text().match(/.+,.+,.+/)) {
                            var time1 = time.replace(/,.+/, '');
                            var time2 = time.replace(/,.+/, '');
                            var time3 = time.replace(/,.+/, '');
                        } else if ($('.featured-poster div p strong').first().text().match(/.+,.+/)) {
                            var time1 = time.replace(/,.+/, '');
                            var time2 = time.replace(/,.+/, '');
                        } else {
                            var time1 = time;
                        }

                        var savelocation = url;
                        savelocation = 'thumbnails/' + savelocation.replace('https://posters.shoreline.nz/', '');
                        download(url, savelocation, function () {
                        });

                        $('.featured-poster div').first().remove();

                        obj['title'] = title;
                        obj['thumbnail'] = savelocation;
                        obj['time'] = time;
                        movies.push(obj);
                    }
                    console.log('Data gathered and images downloaded');
                    var d = new Date();
                    var day = d.getDate();
                    var month = d.getMonth() + 1;
                    var year = d.getFullYear();
                    let data = JSON.stringify(movies, null, 2);
                    var filename = year + '-' + month + '-' + day + '.json';
                    if (fs.existsSync('list/' + filename)) {
                        fs.readFile('list/' + filename, function (err, filedata) {
                            if (err) throw err;
                            if (filedata.toString('utf8') == data) {
                                console.log('File exists, moving on.');
                            } else {
                                fs.writeFileSync('list/' + filename, data);
                                console.log('Data written to file');
                            }
                        });
                    } else {
                        fs.writeFileSync('list/' + filename, data);
                        console.log('Data written to file');
                    }
                });
            }
            loadMovies();
            console.log('Will update data every minute.');
            console.log('------------------------------');

        } else {
            console.log('No internet connection. Will try again soon.');
            console.log('------------------------------');
        }
    });
}
cI();
setInterval(cI, 60000);

