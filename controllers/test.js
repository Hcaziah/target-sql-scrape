const request = require('request');

const url = "https://www.target.com/c/chocolate-candy-grocery/-/N-5xt0b";

request({url: url, json: true}, (error,response) => {
  var data = response.toJSON()
  //console.log(data)
})