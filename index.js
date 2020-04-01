let fs = require("fs");
const http = require('http');
const port = 80;

const requestListener = function (req, res) {

    console.log(req.method + ": " + req.url);

    if(req.method === "GET" && req.url === "/")
    {

        fs.readFile("./home.html", function(err, data) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(data);
            res.end();
          });
    }
    else if(req.method === "GET" && req.url === "/map_script")
    {
        fs.readFile("./coronashutdown/map_script.js", function(err, data) {
            res.writeHead(200, { "Content-Type": "text/js" });
            res.write(data);
            res.end();
          });
    }
    
  
}

const server = http.createServer(requestListener);
server.listen(port, (err) => {
    if(err)
    {
        return console.log("An error has occurred", err)
    }

    console.log(`Server Listening on ${port}`)
});