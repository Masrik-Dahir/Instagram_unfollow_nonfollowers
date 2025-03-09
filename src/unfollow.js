import { chromium } from 'playwright';
import secret_manager from "./AWS/secret_manager.js";
import { getFirstNItems, deleteItem, isTableEmpty } from "./AWS/dynamodb.js";
import config from "./config.js";
import getProfileToDelete from "./find.js";

async function run() {

    const browser = await chromium.launch({ headless: false }); // Launches a visible browser

    const page = await browser.newPage();

    await page.goto('https://www.instagram.com');

    await page.fill('input[name="username"]', secret_manager.username);
    await page.fill('input[name="password"]', secret_manager.password);
    await page.click('text="Log in"');
    await page.waitForNavigation();
    await page.click('text="Profile"');

    const empty = await isTableEmpty();

    if (empty) {
        await getProfileToDelete()
    }

    const fetchData = async () => {
        try {
            return await getFirstNItems(config.instagram.profile_unfollow_count); // Return fetched items
        } catch (error) {
            console.error("Error:", error);
            return []; // Return empty array on error to prevent undefined issues
        }
    };
    const items = await fetchData(); // Wait for data to be fetched


    for (let i = 0; i < items.length; i++) {
        const profile_to_unfollow = items[i]["profile_link"]
        await page.goto(profile_to_unfollow);
        try {
            await page.click('text="Following"', { timeout: 2000 });
            await page.click('text="Unfollow"');

        } catch (error) {
            console.error("Error clicking on 'Following':", error);
        }
        await deleteItem(items[i]["profile_link"]); // Replace with the actual primary key value
    }

}

export default run;