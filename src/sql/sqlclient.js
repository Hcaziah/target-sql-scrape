const { Connection, Request, TYPES } = require('tedious');

const config = require('./config');

var connection = new Connection(config);  


function insertCategories(categoryArray) {
  const bulkLoad = connection.newBulkLoad('ProductCategories',  (err, rowCount) => {
    if(err) throw err;
    console.log("inserted %d rows", rowCount);
  });

  bulkLoad.addColumn('ID', TYPES.Int, { nullable: false });
  bulkLoad.addColumn('lastupdate', TYPES.SmallDateTime, { nullable: false });
  bulkLoad.addColumn('category', TYPES.VarChar, { nullable: false });
  bulkLoad.addColumn('url', TYPES.VarChar, { nullable: false });
  bulkLoad.addColumn('code', TYPES.VarChar, { nullable: false });

  // bulkLoad.addRow({
  //   ID: categoryArray['id'],
  //   category: categoryArray['name'],
  //   url: categoryArray['url'],
  //   code: categoryArray['code']
  // });

  connection.execBulkLoad(bulkLoad, categoryArray);
}

module.exports = { insertCategories };



