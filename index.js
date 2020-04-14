let static = require('node-static');
 
//
// Create a node-static server instance to serve the './public' folder
//
let file = new static.Server('./coronashutdown');
 
let server = require('http').createServer(function (request, response) {

    

    request.addListener('end', function () {
        
        

        console.log(request.method + "\t" + request.url)

        if(request.url = "/")
        {
            file.serve("../home.html",200,{},request,response)
        }

        file.serve(request, response, function(e,res){
            if(e && (e.status === 404))
            {
                file.serveFile("../error.html",404,{},request,response);
            }
        });
    }).resume();
}).listen(3000);

//process.env.PORT || 3000

module.exports = server;