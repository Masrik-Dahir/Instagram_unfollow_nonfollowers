import AWS from 'aws-sdk';
import config from '../config.js';

const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: config.aws.region });
const tableName = config.dynamodb.table;
const updateTableName = config.dynamodb.updateTable;
const updateTableKeyName = config.dynamodb.updateTableKey;

/**
 * Retrieves a limited number of items from DynamoDB.
 * @param {number} limit - Number of items to fetch
 * @returns {Promise<Array>} - Items fetched
 */
async function getFirstNItems(limit) {
    const params = {
        TableName: tableName,
        Limit: limit,
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        return data.Items;
    } catch (error) {
        console.error('Error fetching items:', error);
        throw error;
    }
}

/**
 * Deletes an item from DynamoDB.
 * @param {string} profileLink - Primary key of the item to delete
 */
async function deleteItem(profileLink) {
    const params = {
        TableName: tableName,
        Key: {
            profile_link: profileLink,
        },
    };

    try {
        await dynamoDB.delete(params).promise();
        console.log(`Deleted profile: ${profileLink}`);
    } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
}

/**
 * Checks if the DynamoDB table is empty.
 * @returns {Promise<boolean>} - True if table is empty
 */
async function isTableEmpty() {
    const params = {
        TableName: tableName,
        Limit: 1,
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        return data.Items.length === 0;
    } catch (error) {
        console.error('Error checking if table is empty:', error);
        throw error;
    }
}

/**
 * Retrieves the stored date associated with the key "instagram_unfollow_nonfollowers"
 * from the DynamoDB table specified by 'updateTableName', calculates the difference
 * in days between the stored date and the current UTC date, and returns this difference.
 *
 * @returns {Promise<number|null>} Integer value representing the number of days elapsed
 *                                 since the stored date, or null if the date doesn't exist.
 * @throws Will throw an error if the DynamoDB query operation fails.
 */
async function getDiffInDays() {
    const params = {
        TableName: updateTableName,
        Key: {
            "key": updateTableKeyName
        }
    };

    try {
        const data = await dynamoDB.get(params).promise();

        if (data.Item && data.Item.date) {
            const storedDate = new Date(data.Item.date);
            const currentDate = new Date(); // current UTC date
            const diffTime = currentDate.getTime() - storedDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            return diffDays;
        } else {
            console.log('No date found for key.');
            return null;
        }
    } catch (error) {
        console.error('Error querying table:', error);
        throw error;
    }
}

/**
 * Adds a new item with key "instagram_unfollow_nonfollowers" and the current UTC date to the DynamoDB table.
 * This operation is conditional; it will only insert the new row if the key does not already exist.
 *
 * @returns {Promise<boolean>} Returns true if the item was successfully added; false if the item already exists.
 * @throws Will throw an error if the DynamoDB put operation fails for reasons other than the key already existing.
 */
async function addDateIfNotExists() {
    const params = {
        TableName: updateTableName,
        Item: {
            "key": updateTableKeyName,
            "date": new Date().toISOString()
        },
        ConditionExpression: 'attribute_not_exists(#key)',
        ExpressionAttributeNames: {
            '#key': 'key'
        }
    };

    try {
        await dynamoDB.put(params).promise();
        console.log('Successfully inserted new date entry.');
        return true;
    } catch (error) {
        if (error.code === 'ConditionalCheckFailedException') {
            console.log('Key already exists. No action taken.');
            return false;
        } else {
            console.error('Error inserting new date entry:', error);
            throw error;
        }
    }
}

/**
 * Inserts or updates the current UTC date in the DynamoDB table under the key "instagram_unfollow_nonfollowers".
 *
 * @returns {Promise<void>} Resolves upon successful insertion/update.
 * @throws Will throw an error if the DynamoDB put operation fails.
 */
async function updateCurrentDate() {
    const params = {
        TableName: updateTableName,
        Item: {
            "key": updateTableKeyName,
            "date": new Date().toISOString() // current UTC date in ISO format
        }
    };

    try {
        await dynamoDB.put(params).promise();
        console.log('Successfully updated date for key: instagram_unfollow_nonfollowers');
    } catch (error) {
        console.error('Error updating date in table:', error);
        throw error;
    }
}

/**
 * Adds a single user to DynamoDB.
 * @param {string} username - Profile link of the user
 */
async function addUserToDynamoDB(username) {
    const params = {
        TableName: tableName,
        Item: {
            profile_link: username,
        },
    };

    try {
        await dynamoDB.put(params).promise();
        console.log(`Added user: ${username}`);
    } catch (err) {
        console.error("Error adding user to DynamoDB:", err);
    }
}

/**
 * Adds multiple users to DynamoDB.
 * @param {Array<string>} users - Array of profile links
 */
async function updateDynamoDB(users) {
    for (const user of users) {
        await addUserToDynamoDB(user);
    }
}

// Single export statement to avoid duplication
export {
    getFirstNItems,
    deleteItem,
    isTableEmpty,
    addUserToDynamoDB,
    updateDynamoDB,
    getDiffInDays,
    updateCurrentDate,
    addDateIfNotExists
};
