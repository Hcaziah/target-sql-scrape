const StoreDBController = require("./src/controllers/StoreDBController");

const SDB = new StoreDBController();

SDB.setupCategoriesTable();