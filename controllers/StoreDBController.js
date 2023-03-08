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
        this.updateCategories();
        }

    async updateCategories() {
        const client = new Client(process.env.DATABASE_URL);
        await client.connect();
        
        const tScraper = new TargetScraper();

        const categories = await tScraper.getCategories();

        let x = 0;

        for (let URL of categories) {
            // Get name of each category
            const Name = URL.substring(URL.search('/c/') + 3, URL.search('/-/'));

            await client.query(`
            INSERT INTO categories (id, category, url) VALUES (${x++}, '${Name}', '${URL}')`);
        };
        await client.end();
        this.isConnected = false;
    }
}