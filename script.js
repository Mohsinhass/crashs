const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');

puppeteer.use(StealthPlugin());

const urls = [
    'https://www.adsbinfree.com/p/fake-address-generator-us-us-address.html'
];

const referers = [
    'https://www.google.com/',
    // Add more referers if needed
];

const proxyUrl = 'residential-unlimited.geonode.com:9000';
const proxyUsername = 'geonode_HkVMLKf7KO';
const proxyPassword = '7950b4db-8283-4cfd-b243-a28e0e311810';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function visitAndInteract(browser, url) {
    const page = await browser.newPage();
    const userAgent = randomUseragent.getRandom();
    const referer = referers[Math.floor(Math.random() * referers.length)];

    await page.setUserAgent(userAgent);
    await page.setExtraHTTPHeaders({ referer });

    try {
        await page.authenticate({ username: proxyUsername, password: proxyPassword });
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        console.log(`Visiting URL: ${url}`);

        // Quick click on a random link
        const links = await page.$$('a');
        if (links.length > 0) {
            const randomLink = links[Math.floor(Math.random() * links.length)];
            try {
                await randomLink.click();
                console.log('Clicked a link');
            } catch (err) {
                console.log('Error clicking link:', err);
            }
        }

        await page.waitForTimeout(getRandomInt(100, 300)); // Short wait time before closing
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        console.log('Closing page');
        await page.close();
    }
}

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            `--proxy-server=${proxyUrl}`,
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
        ],
        ignoreHTTPSErrors: true,
    });

    const concurrentPages = 10; // Number of concurrent pages
    const requestsPerSecond = 100; // Adjust the number of requests per second
    const interval = 1000 / requestsPerSecond; // Time between each request in ms

    const launchPages = async () => {
        for (let i = 0; i < concurrentPages; i++) {
            urls.forEach(async (url) => {
                await visitAndInteract(browser, url);
            });
        }
    };

    setInterval(launchPages, interval);
})();
