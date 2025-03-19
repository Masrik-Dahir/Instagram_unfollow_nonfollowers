import {log, updateDynamoDB} from "./AWS/dynamodb.js";
import config from "./config.js";

/**
 * Opens followers/following modal and retrieves user profile links.
 * @param {object} page - Playwright page object
 * @param {string} type - Either "followers" or "following"
 * @returns {Promise<Array>} - List of profile links
 */
async function getUserLinks(page, type) {
    try {
        await page.click(`text=" ${type}"`);
        const links = await grabLinks(page);
        await page.click('svg[aria-label="Close"]'); // Close modal
        return links;
    } catch (error) {
        log(`Error getting user links for ${type}: ${error}`, "error");
        throw error;
    }
}

/**
 * Scrolls modal to bottom and grabs profile links.
 * @param {object} page - Playwright page object
 * @returns {Promise<Array>} - List of unique profile links
 */
async function grabLinks(page) {
    const links = new Set();

    const modalSelector = config.instagram.modal_selector.popup;
    const scrollableSelector = config.instagram.modal_selector.scroll;

    await page.waitForSelector(modalSelector, { state: 'visible' });
    await page.waitForSelector(scrollableSelector, { state: 'visible' });

    let lastHeight = 0;

    // Scroll until no new content is loaded
    while (true) {
        const newHeight = await page.evaluate((sel) => {
            const scrollable = document.querySelector(sel);
            if (!scrollable) return 0;

            scrollable.scrollTop = scrollable.scrollHeight;
            return scrollable.scrollHeight;
        }, scrollableSelector);

        if (newHeight === lastHeight) break;
        lastHeight = newHeight;

        await page.waitForTimeout(config.instagram.lazy_load_time);
    }

    // Fetch all profile links
    const currentLinks = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));

    currentLinks.forEach(link => links.add(link));

    return [...links];
}

/**
 * Fetches the profiles that don't follow back and stores them.
 * @param {object} page - Playwright page object
 */
async function getProfileToDelete(page) {
    await log("Looking for Following: Start")
    const following = await getUserLinks(page, "following");
    await log("Looking for Follower: Start")
    const followers = await getUserLinks(page, "followers");

    const notFollowingBack = following.filter(user => !followers.includes(user));

    await updateNonFollowers(notFollowingBack);
}

/**
 * Updates DynamoDB with profiles to potentially delete.
 * @param {Array} profiles - List of profile links to store
 */
async function updateNonFollowers(profiles) {
    try {
        await updateDynamoDB(profiles);
    } catch (error) {
        console.error("Error updating DynamoDB:", error);
        log(`Error updating DynamoDB: ${error}`, "error");
    }
}

export default getProfileToDelete;
