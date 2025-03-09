import { chromium } from 'playwright';
import secret_manager from "./AWS/secret_manager.js";
import { updateDynamoDB } from "./AWS/dynamodb.js";
import config from "./config.js";


async function getProfileToDelete() {

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
    let lastHeight = 0;

    const modalSelector = config.instagram.modal_selector.popup;
    await page.waitForSelector(modalSelector, { state: 'visible' });

    // Updated scrollable selector using the provided class
    const scrollableSelector = config.instagram.modal_selector.scroll;
    await page.waitForSelector(scrollableSelector, { state: 'visible' });

    while (true) {
        const newHeight = await page.evaluate((sel) => {
            const scrollable = document.querySelector(sel);
            if (scrollable) {
                scrollable.scrollTop = scrollable.scrollHeight;
                return scrollable.scrollHeight;
            }
            return 0;
        }, scrollableSelector);

        await page.waitForTimeout(config.instagram.lazy_load_time);  // Wait for any lazy-loaded content

        if (newHeight === lastHeight) {
            break;  // Stops if the scroll height hasn't changed, indicating the end of the content
        }
        lastHeight = newHeight;

        let currentLinks = await page.evaluate((sel) => {
            const anchors = Array.from(document.querySelectorAll(`${sel} a`));
            return anchors.map(a => a.href).filter(href => href && href.trim());
        }, scrollableSelector);

        currentLinks.forEach(link => links.add(link));
    }

    return [...links];
}

export default getProfileToDelete;