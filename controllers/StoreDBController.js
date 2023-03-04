const { Client }  = require("pg");
const TargetScraper = require("./TargetScraper");

module.exports = class StoreDBController {
    constructor() {
        this.client = new Client(process.env.DATABASE_URL);
        this.isConnected = false;
    };

    async updateCategoriesTable() {
        const tScraper = new TargetScraper();

        await this.client.connect();
        this.isConnected = true;

        await this.client.query(`
            CREATE TABLE IF NOT EXISTS categories (
                CategoryID UUID NOT NULL PRIMARY KEY,
                Category VARCHAR(40) NOT NULL,
                url VARCHAR(100) NOT NULL
            );`);

        const categories = await tScraper.getCategories();

        for (let URL of categories) {
            // Get name of each category
            const Name = URL.substring(URL.search('/c/') + 3, URL.search('/-/'));

            await this.client.query(`INSERT INTO categories ("Category", "url")
            VALUES ($1, $2)`, [Name, URL]);
        };
        await this.client.end();
        this.isConnected = false;
    }
}