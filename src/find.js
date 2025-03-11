import { chromium } from 'playwright';
import secret_manager from "./AWS/secret_manager.js";
import { updateDynamoDB } from "./AWS/dynamodb.js";
import config from "./config.js";


async function getProfileToDelete(page) {

    // Open following list
    await page.click('text=" following"');
    const following = await grabLinks(page);

    // Cross teh popup
    await page.click('svg[aria-label="Close"]');

    // Open followers list
    await page.click('text=" followers"');
    const followers = await grabLinks(page);

    const notFollowingBack = following.filter(user => !followers.includes(user));
    console.log('People not following back:', notFollowingBack);

    await updateDynamoDB(notFollowingBack)
}

async function grabLinks(page) {
    let links = new Set();

    const modalSelector = config.instagram.modal_selector.popup;
    await page.waitForSelector(modalSelector, { state: 'visible' });

    const scrollableSelector = config.instagram.modal_selector.scroll;
    await page.waitForSelector(scrollableSelector, { state: 'visible' });

    let lastHeight = 0;

    // Keep scrolling until no new content loads
    while (true) {
        let newHeight = await page.evaluate((sel) => {
            const scrollable = document.querySelector(sel);
            if (!scrollable) return 0;

            scrollable.scrollTop = scrollable.scrollHeight;
            return scrollable.scrollHeight;
        }, scrollableSelector);

        if (newHeight === lastHeight) {
            break; // Stop when no new content is loaded
        }

        lastHeight = newHeight;
        await page.waitForTimeout(config.instagram.lazy_load_time); // Wait briefly for lazy-loading
    }

    // Fetch links after ensuring we have reached the bottom
    let currentLinks = await page.evaluate((sel) => {
        return Array.from(document.querySelectorAll(`${sel} a`))
            .map(a => a.href)
            .filter(href => href && href.trim());
    }, scrollableSelector);

    // Store unique links
    currentLinks.forEach(link => links.add(link));

    return [...links];
}

export default getProfileToDelete;