import fs from 'fs';
import yaml from 'js-yaml';

/**
 * Loads and returns configuration from a YAML file.
 * @param {string} path - Path to configuration file (default: "config.yaml")
 * @returns {Object} - Configuration object
 */
function loadConfig(path = './config.yml') {
    try {
        const fileContent = fs.readFileSync(path, 'utf8');
        return yaml.load(fileContent);
    } catch (error) {
        console.error("Error loading configuration:", error);
        throw error;
    }
}

const config = loadConfig();

export default config;