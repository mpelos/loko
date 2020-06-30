const extractFilesSteps = require('./extract-files-steps');

const deployFirebaseHostingSteps = (serviceName, serviceConfig) => {
  return [
    ...extractFilesSteps(serviceName, serviceConfig),
    buildInstallFirebaseToolsStep(),
    buildDeployStep(serviceName, serviceConfig),
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

const buildDeployStep = (_serviceName, serviceConfig) => {
  const { deploy } = serviceConfig;
  const { name: deployName, options = {} } = deploy;
  const { config_file: configFile } = options;

  let args = 'ls app';
  if (configFile) { args += `\nmv ${configFile} firebase.json`; }
  args += '\n./node_modules/.bin/firebase --project $PROJECT_ID deploy --public app';
  if (deployName) { args += ` --only hosting:${deployName}`}

  return {
    id: 'deploy',
    name: 'gcr.io/cloud-builders/npm:current',
    entrypoint: 'bash',
    args: ['-c', args],
  };
};

module.exports = deployFirebaseHostingSteps;
