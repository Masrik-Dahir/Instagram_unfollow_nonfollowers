import AWS from "aws-sdk";
import config from "../config.js";

AWS.config.update({ region: config.aws.region });
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = config.dynamodb.table;

// Get N rows from the table
const getFirstNItems = async (limit) => {
    const params = {
        TableName: tableName,
        Limit: limit, // Fetch first 'N' items
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        return data.Items; // Returns the first 'N' items
    } catch (error) {
        console.error("Error fetching data from DynamoDB:", error);
        throw error;
    }
};

//Delete an Item
const deleteItem = async (primaryKeyValue) => {
    const params = {
        TableName: tableName,
        Key: {
            profile_link: primaryKeyValue, // Replace 'primaryKey' with your actual primary key name
        },
    };

    try {
        await dynamoDB.delete(params).promise();
        console.log(`Item with primary key '${primaryKeyValue}' deleted successfully.`);
    } catch (error) {
        console.error("Error deleting item:", error);
    }
};

// Table is empty or not
const isTableEmpty = async () => {
    const params = {
        TableName: tableName,
        Limit: 1, // Only fetch 1 item to minimize cost
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        return data.Items.length === 0; // Returns true if table is empty
    } catch (error) {
        console.error("Error checking table:", error);
        throw error;
    }
};

// Adding items to the table
async function addUserToDynamoDB(username) {
    const params = {
        TableName: tableName,
        Item: {
            profile_link: username
        }
    };

    try {
        const data = await dynamoDB.put(params).promise();
        console.log(`Added user: ${username}`);
    } catch (err) {
        console.error("Error adding user to DynamoDB:", err);
    }
}

// Loop through the array and add each items to DynamoDB
async function updateDynamoDB(notFollowingBack) {
    for (const user of notFollowingBack) {
        await addUserToDynamoDB(user);
    }
}

// Export both functions explicitly
export { addUserToDynamoDB, updateDynamoDB, getFirstNItems, deleteItem, isTableEmpty };
