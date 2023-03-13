const TargetScraper = require("./controllers/TargetScraper");
const StoreDBController = require("./controllers/StoreDBController");

const SDB = new StoreDBController();
const TS = new TargetScraper();



TS.getItems("5xt1n");

// SDB.setupCategoriesTable();

