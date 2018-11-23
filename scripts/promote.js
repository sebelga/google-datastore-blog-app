'use strict';

const argv = require('yargs').argv;
const execSync = require('child_process').execSync;

if (!argv.v || typeof argv.v !== 'string') {
  throw new Error('You must specify a version number to deploy the applicaiton');
}

try {
  execSync('which gcloud');
} catch (e) {
  throw new Error('Sorry, this script requires the Google gcloud SDK');
}

execSync(`gcloud app services set-traffic default --splits ${argv.v}=1`, { stdio: 'inherit' });
