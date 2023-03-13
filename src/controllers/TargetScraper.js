const axios = require('axios');
const fs = require('fs');
const { addListener } = require('process');
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

    async setup(headless_=true) {
        this.browser = await pup.launch({ headless: headless_ });

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

    async getCategoryURLs() {
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
        const categoryURLs = await this.page.evaluate(() =>
            Array.from(document.querySelectorAll("div[data-test='@web/CategoryMenu'] > div a")).map(a => a.href)
        );

        if (categoryURLs.length > 0) {
            console.log("Grabbed " + categoryURLs.length + " categories");
        } else {
            throw new Error("No categories were grabbed, did the site load properly?");
        }

        // Close browser
        await this.browser.close();
        console.log("Browser closed.");

        return categoryURLs;
    }

    async getItems(catCode, pageOffset_ = 0, maxRequestCount = 50) {
        await this.setup();

        this.pageOffset = pageOffset_;

        let itemsArray = [];
        let requestCount = 0;
        let blockedRequestCount = 0;
        let prod_num = 0;

        // while current request count is less then max request count and no block requests
        while (!blockedRequestCount) {
            const url = `http://redsky.target.com/redsky_aggregations/v1/web/plp_search_v2?key=9f36aeafbe60771e321a7cc95a78140772ab3e96&category=${catCode}&channel=WEB&count=24&default_purchasability_filter=true&offset=${this.pageOffset}&page=%2Fc%2F5xt0b&platform=desktop&pricing_store_id=3278&scheduled_delivery_store_id=3278&store_ids=3278%2C365%2C361%2C616%2C673&visitor_id=12343336896&zip=48823`;
            
            // Get target item API page request
            await axios.get(url)
                .then(response => {
                    // shorthand concat
                    let products = response.data.data.search.products;

                    for (let product of products) {
                        prod_num++;
                        // Try to add product to item array
                        itemsArray.push(this.tryAddItemProps(product));
                    }
                    
                    console.log("Added " + products.length + " to the array.");
                }).catch(error => {
                    if (error.code === "ERR_BAD_REQUEST") {
                        blockedRequestCount++;
                        console.error(new Error("Unable to add! Are API requests being blocked?"));
                        this.browser.close();
                    } else {
                        console.error('Error:', error);
                    }
                },
                requestCount++
                );
            this.pageOffset++;

            if (itemsArray.length > 100) {
                console.log("Over 100 items added, ending.");
                break;
            }
            if (requestCount > maxRequestCount) {
                console.log("Reached max request count -> " + maxRequestCount + "\nending.");
                break;
            }
            await sleep(5000);
        }
        console.log(itemsArray.length);
        var json = JSON.stringify(itemsArray);

        fs.writeFile('itemarray.json', json, function (err) {
            if (err) throw err;
            console.log("JSON written locally");
        });

        await this.browser.close();
        console.log("Browser closed.");

        return json;
    }

    tryAddItemProps(product) {
        let itemArray = new Map();

        const pathsArray = {
            'title': 'item.product_description.title',
            'price': 'price.formatted_current_price',
            'images_url': 'item.enrichment.images.primary_image_url',
            'buy_url': 'item.enrichment.buy_url',
            'ratings_average': 'ratings_and_reviews.statistics.rating.average',
            'ratings_count': 'ratings_and_reviews.statistics.rating.count',
            'item_categories': 'item.product_description.soft_bullets.bullets',
            'bullet_descriptors': 'item.product_description.bullet_descriptions',
            'dpci': 'item.dpci',
            'location': 'price.location_id'
        };
        
        for (const [key, value] of Object.entries(pathsArray)) {
            let val = value.split('.').reduce(function(o, k) {
                return o && o[k];
            }, product);
            if (val === undefined) {
                itemArray.set(key, null);
            } else {
                switch(key){
                    case 'price':
                        val = parseFloat(val.replace("$", ""));
                        break;
                    case 'ratings_average':
                        val = parseFloat(val);
                        break;
                    case 'ratings_count':
                    case 'location':
                        val = parseInt(val);
                        break;                
                };
                itemArray.set(key, val);
            }
        }

        return(Object.fromEntries(itemArray));
    }
}
