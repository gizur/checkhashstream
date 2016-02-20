// Imports
// =======

var http = require('http');
var CheckHashStream = require('./checkhashstream.js');

// Setup logging
// =============

var log = console.log.bind(console);
var debug = console.log.bind(console, 'DEBUG');
var info = console.info.bind(console);
var error = console.error.bind(console);

// HTTP server
// ==========

var server = http.Server();

server.on('request', function (req, res) {

  var ws = new CheckHashStream({
    hashAlg: 'md5',
    hashDigest: 'hex'
  }, req.headers['if-none-match']);

  req.on('end', function () {
    log('end in request');

    var result = ws.get();
    debug(result);
    
    if (result.match) {
      debug('NOT MODIFIED')
      res.writeHead(304);
      res.end();
      return;
    }

    res.setHeader('etag', result.newHash);
    res.end(result.buffer.toString());
  });

  res.on('finish', function () {
    log('finish in response')
  });

  log('processing request: ', req.url, ' headers: ', req.headers);

  req.pipe(ws, {
    end: false
  });
});


// Plumming below ...
// ===================

server.on('clientError', function (exception, socket) {
  log('clientError occured ', exception);
});

server.on('close', function () {
  log('Closing http server');
});

process.on('SIGINT', function () {
  log("Caught interrupt signal");
  server.close();
  setTimeout(process.exit, 1000);
});

process.on('exit', function (code) {
  log('About to exit with code:', code);
});

var port = 3000;
server.listen(port);

log('listening on port', port);
log('Test with: curl -d "hej hej" http://localhost:3000/hej')
