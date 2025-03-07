import config from "../config.js";
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";


const secret_name = config.secret.credential;

const client = new SecretsManagerClient({
    region: config.aws.region,
});

let response;

try {
    response = await client.send(
        new GetSecretValueCommand({
            SecretId: secret_name,
        })
    );
} catch (error) {
    throw error;
}

const secret = JSON.parse(response.SecretString);

export default secret;