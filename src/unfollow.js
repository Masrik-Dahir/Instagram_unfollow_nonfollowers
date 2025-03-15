import { chromium } from 'playwright';
import secret_manager from "./AWS/secret_manager.js";
import { getFirstNItems, deleteItem, isTableEmpty } from "./AWS/dynamodb.js";
import config from "./config.js";
import getProfileToDelete from "./find.js";

/**
 * Logs into Instagram and navigates to the profile page.
 * @param {object} page - Playwright page object
 */
async function loginInstagram(page) {
    await page.goto('https://www.instagram.com');
    await page.fill('input[name="username"]', secret_manager.username);
    await page.fill('input[name="password"]', secret_manager.password);
    await page.click('text="Log in"');
    await page.waitForNavigation();
    await page.click('text="Profile"');
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
        await page.click('text="Following"', { timeout: 2000 });
        await page.click('text="Unfollow"');
    } catch (error) {
        console.error(`Error unfollowing ${profileLink}:`, error);
    }
    await deleteItem(profileLink);
}

/**
 * Main function that runs the Instagram unfollow automation.
 */
async function runAutomation() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await loginInstagram(page);

    const empty = await isTableEmpty();
    if (empty) {
        await getProfileToDelete(page);
    }

    const profiles = await fetchProfilesToUnfollow();

    for (const item of profiles) {
        await unfollowProfile(page, item.profile_link);
    }

    await page.close();
    await browser.close();
}

export default runAutomation;
