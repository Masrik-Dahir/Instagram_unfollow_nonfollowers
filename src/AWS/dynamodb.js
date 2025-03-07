import AWS from "aws-sdk";
import config from "../config.js";

AWS.config.update({ region: config.aws.region });
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = config.dynamodb.table;

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

// Loop through the array and add each user to DynamoDB
async function updateDynamoDB(notFollowingBack) {
    for (const user of notFollowingBack) {
        await addUserToDynamoDB(user);
    }
}

// Export both functions explicitly
export { addUserToDynamoDB, updateDynamoDB };
