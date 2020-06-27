const extractFilesSteps = require('./extract-files-steps');
const validateServiceProperty = require('../../validate-service-property');

const deployStorageSteps = (serviceName, serviceConfig) => {
  validateServiceProperty(serviceConfig, serviceName, 'deploy.options.bucket');

  return [
    ...extractFilesSteps(serviceName, serviceConfig),
    buildDeployStep(serviceName, serviceConfig),
  ]
}

const buildDeployStep = (serviceName, serviceConfig) => {
  const { deploy } = serviceConfig;
  const { options } = deploy;
  const { bucket } = options;

  let args = `
gsutil -m cp -Z -r ./app/* gs://${bucket}
gsutil -m rsync -d -r ./app/* gs://${bucket}/
gsutil -m acl ch -R -u AllUsers:R gs://${bucket}/*
  `;

  return {
    id: 'deploy',
    name: 'gcr.io/cloud-builders/gcloud',
    entrypoint: 'bash',
    args: ['-c', args],
  };
}

module.exports = deployStorageSteps;
