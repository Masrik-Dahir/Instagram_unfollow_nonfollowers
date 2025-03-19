import config from "../config.js";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { log } from './dynamodb.js'; // Assuming log function is exported from dynamodb.js

const client = new SecretsManagerClient({ region: config.aws.region });

/**
 * Retrieves and parses secrets from AWS Secrets Manager.
 * @param {string} secretName - Name of the secret to fetch
 * @returns {Promise<object>} - Parsed secret object
 */
async function getSecret(secretName = config.secret.credential) {
    try {
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secretName,
            })
        );

        return JSON.parse(response.SecretString);
    } catch (error) {
        console.error(`Error retrieving secret \"${secretName}\":`, error);
        log(`Error retrieving secret "${secretName}": ${error}`, "error");
        throw error;
    }
}

export default getSecret;
