var static = require('node-static');
 
//
// Create a node-static server instance to serve the './public' folder
//
var file = new static.Server('./coronashutdown');
 
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        console.log(request.method + "\t" + request.url)
        file.serve(request, response);
    }).resume();
}).listen(80);