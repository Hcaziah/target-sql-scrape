const axios = require('axios');
const fs = require('fs');
const pup = require('puppeteer');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = class TargetScraper {
    constructor() {
        this.geoLocation = [42.7333177, -84.4807494];
    };

    async setup() {
        this.browser = await pup.launch({ headless: true });

        // create a new blank page
        this.page = await this.browser.newPage();
        console.log("Browser started");

        // Set east lansing client
        this.client = await this.page.target().createCDPSession();

        await this.client.send('Emulation.setGeolocationOverride', {
            accuracy: 100,
            latitude: this.geoLocation[0],
            longitude: this.geoLocation[1]
        });

        // set page size for css selectors
        await this.page.setViewport({ width: 1920, height: 1080 });

        console.log("Page Loaded");
    }

    async getCategories() {
        await this.setup();

        // go to target page
        await this.page.goto("https://www.target.com/", {
            // wait for content to load
            waitUntil: 'networkidle0',
        });

        // Select categories button
        await this.page.click('aria/Categories');
        console.log("Categories clicked");

        // wait for categories to load
        console.log("Waiting for categories to load.");
        await this.page.waitForSelector("div[data-test='@web/CategoryMenu'] > div a", {
            visible: true,
        });

        // Get category urls
        const categories = await this.page.evaluate(() =>
            Array.from(document.querySelectorAll("div[data-test='@web/CategoryMenu'] > div a")).map(a => a.href)
        );

        if (categories.length > 0) {
            console.log("Grabbed " + categories.length + " categories");
        } else {
            throw new Error("No categories were grabbed, did the site load properly?");
        }

        // Close browser
        await this.browser.close();
        console.log("Browser closed.");

        return categories;
    }

    async getItems(catCode, pageOffset = 0, maxRequestCount = 24 * 4) {
        await this.setup();
        let itemArray = [];
        let i = 0;

        while (i <= maxRequestCount) {
            const url = `http://redsky.target.com/redsky_aggregations/v1/web/plp_search_v2?key=9f36aeafbe60771e321a7cc95a78140772ab3e96&category=${catCode}&channel=WEB&count=24&default_purchasability_filter=true&offset=${pageOffset}&page=%2Fc%2F5xt0b&platform=desktop&pricing_store_id=3278&scheduled_delivery_store_id=3278&store_ids=3278%2C365%2C361%2C616%2C673&visitor_id=12343336896&zip=48823`;

            // Get target item API page request
            await axios.get(url)
                .then(response => {
                    let products = response.data.data.search.products;;
                    for (let product of products) {
                        itemArray.push({
                            'title': product.item.product_description.title,
                            'price': parseFloat(product.price.formatted_current_price.replace("$", "")),
                            'images_url': product.item.enrichment.images.primary_image_url,
                            'buy_url': product.item.enrichment.buy_url,
                            'ratings': {
                                'average': parseFloat(product.ratings_and_reviews.statistics.rating.average),
                                'count': parseFloat(product.ratings_and_reviews.statistics.rating.count),
                            },
                            'descriptions': {
                                'item_categories': product.item.product_description.soft_bullets.bullets,
                                'bullet_descriptors': product.item.product_description.bullet_descriptions,
                            },
                            'dpci': product.item.dpci,
                            'location': product.price.location_id,
                        });
                    }
                    console.log("Added " + products.length + " to the array.");
                    itemArray.push();
                })
                .catch(error => {
                    if (error.code === "ERR_BAD_REQUEST") {
                        this.browser.close();
                        throw new Error("Unable to add! Are API requests being blocked?");
                    } else {
                        console.error('Error:', error);
                    }
                });

            pageOffset++;
            console.log(itemArray.length);

            if (itemArray.length > 1000) {
                console.log("done.")
                break;
            }
            await sleep(5000);
        }
        console.log(itemArray.length);
        var json = JSON.stringify(itemArray);

        fs.writeFile('itemarray.json', json, function (err) {
            if (err) throw err;
            console.log("JSON written locally");
        });


        await this.browser.close();
        console.log("Browser closed.");
    }
}
