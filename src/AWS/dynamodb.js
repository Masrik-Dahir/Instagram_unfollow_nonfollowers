// dynamoDBHandler.js

import AWS from 'aws-sdk';
import config from './config.js';

const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: config.aws.region });
const tableName = config.aws.dynamodb_table;

/**
 * Retrieves a limited number of items from DynamoDB.
 * @param {number} limit - Number of items to fetch
 * @returns {Promise<Array>} - Retrieved items
 */
export async function getFirstNItems(limit) {
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
 * @param {string} profileLink - Primary key of item to delete
 */
export async function deleteItem(profileLink) {
    const params = {
        TableName: tableName,
        Key: { profile_link: profileLink },
    };

    try {
        await dynamoDB.delete(params).promise();
        console.log(`Deleted profile: ${profileLink}`);
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}

/**
 * Checks if the DynamoDB table is empty.
 * @returns {Promise<boolean>} - True if empty, false otherwise
 */
async function isTableEmpty() {
    try {
        const data = await dynamoDB.scan({ TableName: tableName, Limit: 1 }).promise();
        return data.Items.length === 0;
    } catch (error) {
        console.error('Error checking table:', error);
        throw error;
    }
}

/**
 * Adds a user to DynamoDB.
 * @param {string} username - Profile link of user
 */
async function addUserToDynamoDB(username) {
    const params = {
        TableName: tableName,
        Item: { profile_link: username },
    };

    try {
        await dynamoDB.put(params).promise();
        console.log(`Added profile: ${username}`);
    } catch (error) {
        console.error('Error adding user:', error);
    }
}

/**
 * Adds multiple users to DynamoDB.
 * @param {Array} users - Array of profile links
 */
async function updateDynamoDB(users) {
    for (const user of users) {
        await addUserToDynamoDB(user);
    }
}

export { getFirstNItems, deleteItem, isTableEmpty, addUserToDynamoDB, updateDynamoDB };
