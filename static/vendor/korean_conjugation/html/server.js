var http       = require('http'),
    fs         = require('fs'),
    conjugator = require('./korean/conjugator'),
    uri        = require('url');

http.createServer(function (req, res) {
    var url = uri.parse(req.url);
    var pathname = (url.pathname || '/');
    var clean_pathname = pathname.
    replace(/\.\.\//g,''). //disallow parent directory access
    replace(/\%20/g,' ').
    replace(/^\//g, '');
    if (clean_pathname == '') {
        clean_pathname = 'index.html';
    }
    if (clean_pathname == 'ajax') {
        var infinitive = '하다';
        if (url.search) {
            infinitive = decodeURIComponent(url.search.split('=')[1]);
        }
        res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
        conjugator.display_conjugations(infinitive, function(output) {
            res.end(output);
        });
    }
    fs.readFile(clean_pathname, function(err, data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('File not found.');
        }
        res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
        res.end(data);
    });
}).listen(8124, "127.0.0.1");
console.log('Server running at http://127.0.0.1:8124/');
