import { chromium } from 'playwright';
import secret_manager from "./AWS/secret_manager.js";
import { updateDynamoDB } from "./AWS/dynamodb.js";
import config from "./config.js";


async function run() {

    const browser = await chromium.launch({ headless: false }); // Launches a visible browser

    const page = await browser.newPage();

    await page.goto('https://www.instagram.com');

    await page.fill('input[name="username"]', secret_manager.username);
    await page.fill('input[name="password"]', secret_manager.password);
    await page.click('text="Log in"');
    await page.waitForNavigation();

    await page.goto('https://www.instagram.com/aryanfrmva/?next=%2F');

    await page.click('text="Profile"');


}



run()