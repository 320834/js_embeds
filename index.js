let static = require('node-static');
 
//
// Create a node-static server instance to serve the './public' folder
//
let file = new static.Server('./coronashutdown');
 
let server = require('http').createServer(function (request, response) {

    

    request.addListener('end', function () {
        console.log(request.method + "\t" + request.url)

        file.serve(request, response, function(e,res){
            if(e && (e.status === 404))
            {
                file.serveFile("../error.html",404,{},request,response);
            }
        });
    }).resume();
}).listen(process.env.PORT || 3000);

//process.env.PORT || 3000

module.exports = server;