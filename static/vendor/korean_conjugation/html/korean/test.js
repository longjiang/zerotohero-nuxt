var sys = require('util'),
    fs  = require('fs');

fs.readdir('./test', function(err, files) {
    files.forEach(function(file) {
        if (file.indexOf('.js') > 0 && file.indexOf('.swp') == -1) {
            sys.puts(file);
            f = require('./test/' + file.replace('.js', ''));
        }
    });
});
