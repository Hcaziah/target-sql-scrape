const { Connection, Request, TYPES } = require('tedious');
const config = require('./config');

var client = new Connection(config);

client.on('connect', (err) => {
  if(err) throw err;
  console.log("SQL Client Connected");
})

client.connect();

var request = new Request("INSERT INTO categories (id, category, url, code) VALUES (0, 'cat', 'www.url.com', 'code')", function(err) {
    if (err) throw err;
});
client.executeRequest(request);
