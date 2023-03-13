const Connection = require('tedious').Connection;
const config = require('../../privatestuff/config');

const TargetScraper = require("./TargetScraper");


module.exports = class StoreDBController {
    constructor() {
        this.isConnected = false;
    };
  
    
    async setupCategoriesTable() {

        client.connect();
        this.isConnected = true;

        client.query(`
            CREATE TABLE IF NOT EXISTS categories (
                ID INT NOT NULL PRIMARY KEY,
                lastupdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                category VARCHAR(40) NOT NULL,
                url VARCHAR(200) NOT NULL);`
                );
                
        console.log("Categories table has been created if it wasn't already there.");
        await client.connect();
        
        // Delete all records from table categories
        await client.query(`DELETE FROM categories`);
        console.log("Deleted all records from categories.");
        
        // Get categories from TargetScraper
        const tScraper = new TargetScraper();
        const categoryURLs = await tScraper.getCategoryURLs();

        let x = 0;
        // Loop through grabbed categories and format names from URL
        for (let URL of categoryURLs) {
            // Get name of each category
            const Name = URL.substring(URL.search('/c/') + 3, URL.search('/-/'));
            const code = URL.substring(URL.search('/N-') + 3, URL.length);
            
            // Add values to db
            await client.query(`
            INSERT INTO categories (id, category, url, code) VALUES (${x++}, '${Name}', '${URL}' , '${code}')`);
        };
        // End client connection with db
        await client.end();
        this.isConnected = false;
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