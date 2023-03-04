const pup = require("puppeteer");

module.exports = class TargetScraper {
    constructor() {
        this.url = "https://www.target.com/";
        this.geoLocation = [42.7333177, -84.4807494];
    };

    async delay(time) {
        // Delay func from stack overflow
        // https://stackoverflow.com/a/46965281
        return new Promise(function(resolve) {
            setTimeout(resolve, time)
        });
    }

    async getCategories() {
        this.browser = await pup.launch({ headless: false });

        // create a new blank page
        this.page = await this.browser.newPage();
        console.log("Browser started");

        // Set east lansing client
        // this.client = await this.page.target().createCDPSession();

        // await this.client.send('Emulation.setGeolocationOverride', {
        //     accuracy: 100,
        //     latitude: this.geoLocation[0],
        //     longitude: this.geoLocation[1]
        // });

        // set page size for css selectors
        await this.page.setViewport({ width: 1920, height: 1080 });

        console.log("Page Loaded");

        // go to target page
        await this.page.goto(this.url, {
        // wait for content to load
            waitUntil: 'networkidle0',
        });

        // Select categories button
        await this.page.click('aria/Categories');
        console.log("Categories clicked");

        // wait for categories to load
        console.log("waiting for categories to load.");
        await this.page.waitForSelector("div[data-test='@web/CategoryMenu'] > div a", {
            visible: true,
        });
        

        // Get category urls
        const categories = await this.page.evaluate(() =>
            Array.from(document.querySelectorAll("div[data-test='@web/ CategoryMenu'] > div a")).map(a => a.href)
        );

        if (categories.length > 0) {
            console.log("Grabbed " + categories.length + " categories");
        } else {
            console.log("No categories were grabbed, did the site load properly?");
        }

        // Close browser
        await this.browser.close();
        console.log("Browser closed.");

        return categories;  
    }
}
