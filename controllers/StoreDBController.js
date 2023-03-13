const { Client }  = require("pg");
const TargetScraper = require("./TargetScraper");
const { v4: uuidv4 } = require('uuid');


module.exports = class StoreDBController {
    constructor() {
        this.isConnected = false;
    };
    
    async setupCategoriesTable() {
        const client = new Client(process.env.DATABASE_URL);
        await client.connect();
        this.isConnected = true;

        await client.query(`
            CREATE TABLE IF NOT EXISTS categories (
                ID INT NOT NULL PRIMARY KEY,
                lastupdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                category VARCHAR(40) NOT NULL,
                url VARCHAR(200) NOT NULL);`);
                
        console.log("Categories table has been created if it wasn't already there.");

        await client.end();
        this.isConnected = false;
        this.updateCategories();
        }

    async updateCategories() {
        // New SQL client environment 
        // Database url
        const client = new Client(process.env.DATABASE_URL);
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
    }

    async updateItems() {
        // New SQL client from environment 
        // Database url
        const client = new Client(process.env.DATABASE_URL);
        await client.connect();

        const tScraper = new TargetScraper();
        const items = await tScraper.getItems();

    }
}