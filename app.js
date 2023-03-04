const TargetScraper = require("./controllers/TargetScraper");
const StoreDBController = require("./controllers/StoreDBController");

const SDB = new StoreDBController();

SDB.updateCategoriesTable();

