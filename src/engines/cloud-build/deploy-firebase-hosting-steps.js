const extractFilesSteps = require('./extract-files-steps');
const validateServiceProperty = require('../../validate-service-property');

const deployFirebaseHostingSteps = (serviceName, serviceConfig) => {
  return [
    ...extractFilesSteps(serviceName, serviceConfig),
    buildInstallFirebaseToolsStep(),
    buildDeployStep(),
  ]
};

const buildInstallFirebaseToolsStep = () => {
  return {
    id: 'install-firebase-tools',
    name: 'gcr.io/cloud-builders/npm:current',
    waitFor: ['-'],
    args: ['install', 'firebase-tools'],
  };
};

const buildDeployStep = () => {
  let args = 'ls app' +
    '\n./node_modules/.bin/firebase --project $PROJECT_ID deploy --public app';

  return {
    id: 'deploy',
    name: 'gcr.io/cloud-builders/npm:current',
    entrypoint: 'bash',
    args: ['-c', args],
  };
};

module.exports = deployFirebaseHostingSteps;
