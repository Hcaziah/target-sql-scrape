const { Connection, Request, TYPES } = require('tedious');

const config = require('./config');

var connection = new Connection(config); 



function insertCategories(categoryArray) {
  const bulkLoad = connection.newBulkLoad('ProductCategories',  (err, rowCount) => {
    if(err) throw err;
    console.log("inserted %d rows", rowCount);
  });

  bulkLoad.addColumn('ID', TYPES.Int, { nullable: false });
  bulkLoad.addColumn('category', TYPES.VarChar, { length: 50, nullable: false });
  bulkLoad.addColumn('url', TYPES.VarChar, { length: 200, nullable: false });
  bulkLoad.addColumn('code', TYPES.VarChar, { length: 10, nullable: false });

  // bulkLoad.addRow({
  //   ID: categoryArray['id'],s
  //   category: categoryArray['name'],
  //   url: categoryArray['url'],
  //   code: categoryArray['code']
  // });

  connection.execBulkLoad(bulkLoad, categoryArray);
}

module.exports = { insertCategories };



