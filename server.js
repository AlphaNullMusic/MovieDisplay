var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    util = require('util'),
    app = express(),
    port = 8080;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use('/thumbnails', express.static('thumbnails'));
app.use('/list', express.static('list'));
app.use('/assets', express.static('assets'));

app.get('/', function (req, res, next) {
    var d = new Date(),
        day = d.getDate(),
        month = d.getMonth() + 1,
        year = d.getFullYear(),
        filename = day + '-' + month + '-' + year + '.json';

    var result = fs.readFileSync('list/' + filename, 'utf8');
    result = JSON.parse(result);
    res.render('index', { header: 'Session Times', movieList: result });
});

app.listen(port, function () {
    console.log('Express server listening on port ' + port);
});