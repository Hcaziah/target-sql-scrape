const TargetScraper = require("./src/controllers/TargetScraper");
const StoreDBController = require("./src/controllers/StoreDBController");

const SDB = new StoreDBController();
const TS = new TargetScraper();



TS.getItems("5xt1n");
//SDB.setupCategoriesTable();

// SDB.setupCategoriesTable();

