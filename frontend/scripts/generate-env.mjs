import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, '.env');
const targetPath = path.join(projectRoot, 'src', 'environments', 'environment.ts');
const productionTargetPath = path.join(projectRoot, 'src', 'environments', 'environment.production.ts');

const defaults = {
  FRONTEND_PRODUCTION: 'false',
  FRONTEND_API_URL: 'http://localhost:5000/api/v1',
  FRONTEND_RAZORPAY_KEY_ID: ''
};

function getEnvValue(fileValues, key) {
  const runtimeValue = process.env[key];
  if (typeof runtimeValue === 'string' && runtimeValue.trim()) {
    return runtimeValue.trim();
  }

  const fileValue = fileValues[key];
  if (typeof fileValue === 'string' && fileValue.trim()) {
    return fileValue.trim();
  }

  return '';
}

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

const productionValue = getEnvValue(fileValues, 'FRONTEND_PRODUCTION') || defaults.FRONTEND_PRODUCTION;
const isProduction = productionValue === 'true';
const apiUrl = getEnvValue(fileValues, 'FRONTEND_API_URL');
const razorpayKeyId = getEnvValue(fileValues, 'FRONTEND_RAZORPAY_KEY_ID');

if (isProduction) {
  const missingKeys = [];

  if (!apiUrl) {
    missingKeys.push('FRONTEND_API_URL');
  }

  if (!razorpayKeyId) {
    missingKeys.push('FRONTEND_RAZORPAY_KEY_ID');
  }

  if (missingKeys.length > 0) {
    throw new Error(
      `Production environment requires the following env vars: ${missingKeys.join(', ')}. ` +
        'Set them in .env or the build environment before running a production build.'
    );
  }
}

const config = {
  production: isProduction,
  apiUrl: isProduction ? apiUrl : apiUrl || defaults.FRONTEND_API_URL,
  razorpayKeyId: isProduction ? razorpayKeyId : razorpayKeyId || defaults.FRONTEND_RAZORPAY_KEY_ID
};

const environmentSource = `export const environment = {
  production: ${config.production},
  apiUrl: '${config.apiUrl}',
  razorpayKeyId: '${config.razorpayKeyId}'
};
`;

fs.writeFileSync(targetPath, environmentSource, 'utf8');
fs.writeFileSync(productionTargetPath, environmentSource, 'utf8');

console.log(
  `Generated ${path.relative(projectRoot, targetPath)} and ${path.relative(projectRoot, productionTargetPath)} from ${fs.existsSync(envPath) ? '.env' : 'defaults'}.`
);
