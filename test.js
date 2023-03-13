const { Connection, Request } = require('tedious');
const config = require('./privatestuff/config');

var client = new Connection(config);

client.on('connect', function(err) {
  if(err) throw err;
  console.log("SQL Client Connected");
})

client.connect();