import AWS from 'aws-sdk';
import config from '../config.js';

const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: config.aws.region });
const tableName = config.dynamodb.table;

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
};
