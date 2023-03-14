const { insertCategories } = require("../sql/sqlClient");

const TargetScraper = require("./TargetScraper");


module.exports = class StoreDBController {
    constructor() {};
  
    async setupCategoriesTable() {
        let categories = [];
        // Get categories from TargetScraper
        const tScraper = new TargetScraper();
        const categoryURLs = await tScraper.getCategoryURLs();

        let x = 0;
        // Loop through grabbed categories and format names from URL
        for (let URL of categoryURLs) {
            let category = {};
            // Get name of each category
            category['id'] = x++;
            category['name'] = URL.substring(URL.search('/c/') + 3, URL.search('/-/'));
            category['url'] = URL;
            category['code'] = URL.substring(URL.search('/N-') + 3, URL.length);
            
            // Add values to db
            //exec(`
            // INSERT INTO ProductCategories (id, category, url, code) VALUES (${x++}, '${Name}', '${URL}' , '${code}')`);
            categories.push(category);
        };
        insertCategories(categories);
    };

    async updateItems() {
        // New SQL client from environment 
        // Database url
        const client = new Client({
            host: '127.0.0.1',
            port: 1433,
            user: 'sa',
            password: 'DinosWithTacos4',
        })
        await client.connect();

        const tScraper = new TargetScraper();
        const items = await tScraper.getItems();

    }
}