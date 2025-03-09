import fs from 'fs';
import yaml from 'js-yaml';

const loadConfig = (path = './config.yml') => {
    try {
        const fileContents = fs.readFileSync(path, 'utf8');
        const data = yaml.load(fileContents);
        return data;
    } catch (err) {
        console.error('Error loading configuration:', err);
        throw err;
    }
};

const config = loadConfig();

export default config;
