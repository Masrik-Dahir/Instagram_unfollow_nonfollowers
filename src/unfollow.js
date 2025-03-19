import {chromium} from 'playwright';
import {
    getFirstNItems,
    deleteItem,
    isTableEmpty,
    getDiffInDays,
    updateCurrentDate,
    addDateIfNotExists,
    log
} from "./AWS/dynamodb.js";
import config from "./config.js";
import getProfileToDelete from "./find.js";
import getSecret from "./AWS/secret_manager.js";

/**
 * Logs into Instagram and navigates to the profile page.
 * @param {object} page - Playwright page object
 */
async function loginInstagram(page) {
    try {
        await page.goto('https://www.instagram.com');
        const secret = await getSecret();
        await page.fill('input[name="username"]', secret.username);
        await page.fill('input[name="password"]', secret.password);
        await page.click('text="Log in"');
        await page.waitForTimeout(10000);
        await page.waitForNavigation();
        await page.click('text="Profile"');
    } catch (error) {
        console.error("Error logging into Instagram:", error);
        log(`Error logging into Instagram: ${error}`, "error");
        return [];
    }
}

/**
 * Fetches items to unfollow from DynamoDB.
 * @returns {Promise<Array>} - Array of items to process
 */
async function fetchProfilesToUnfollow() {
    try {
        return await getFirstNItems(config.instagram.profile_unfollow_count);
    } catch (error) {
        console.error("Error fetching profiles:", error);
        log(`Error fetching profiles: ${error}`, "error");
        return [];
    }
}

/**
 * Unfollows a given Instagram profile.
 * @param {object} page - Playwright page object
 * @param {string} profileLink - Profile URL to unfollow
 */
async function unfollowProfile(page, profileLink) {
    await page.goto(profileLink);
    try {
        await page.click('text="Following"', {timeout: 2000});
        await page.click('text="Unfollow"');
    } catch (error) {
        console.error(`Error unfollowing ${profileLink}:`, error);
        log(`Error unfollowing ${profileLink}: ${error}`, "error");
    }
    await deleteItem(profileLink);
}

/**
 * Main function that runs the Instagram unfollow automation.
 */
async function runAutomation() {
    const browser = await chromium.launch({headless: true});
    const page = await browser.newPage();
    await addDateIfNotExists()

    await loginInstagram(page);

    const empty = await isTableEmpty();
    const diff = await getDiffInDays();

    if (empty && diff >= config.app.grace_period_days) {
        await getProfileToDelete(page);
        await updateCurrentDate()
    }

    const profiles = await fetchProfilesToUnfollow();

    for (const item of profiles) {
        await unfollowProfile(page, item.profile_link);
    }

    await page.close();
    await browser.close();
}

export default runAutomation;
