import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, '.env');
const targetPath = path.join(projectRoot, 'src', 'environments', 'environment.ts');

const defaults = {
  FRONTEND_PRODUCTION: 'false',
  FRONTEND_API_URL: 'http://localhost:5000/api/v1',
  FRONTEND_RAZORPAY_KEY_ID: ''
};

function parseEnvFile(fileContent) {
  return fileContent
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        return acc;
      }

      const separatorIndex = trimmed.indexOf('=');

      if (separatorIndex === -1) {
        return acc;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      acc[key] = value;
      return acc;
    }, {});
}

const fileValues = fs.existsSync(envPath)
  ? parseEnvFile(fs.readFileSync(envPath, 'utf8'))
  : {};

const config = {
  production: (fileValues.FRONTEND_PRODUCTION || defaults.FRONTEND_PRODUCTION) === 'true',
  apiUrl: fileValues.FRONTEND_API_URL || defaults.FRONTEND_API_URL,
  razorpayKeyId: fileValues.FRONTEND_RAZORPAY_KEY_ID || defaults.FRONTEND_RAZORPAY_KEY_ID
};

const environmentSource = `export const environment = {
  production: ${config.production},
  apiUrl: '${config.apiUrl}',
  razorpayKeyId: '${config.razorpayKeyId}'
};
`;

fs.writeFileSync(targetPath, environmentSource, 'utf8');

console.log(`Generated ${path.relative(projectRoot, targetPath)} from ${fs.existsSync(envPath) ? '.env' : 'defaults'}.`);
