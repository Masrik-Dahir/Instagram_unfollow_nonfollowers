// secretManager.js

import config from "../config.js";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

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
        throw error;
    }
}

export default getSecret;
