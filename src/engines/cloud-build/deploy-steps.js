const deployCloudFunctionSteps = require('./deploy-cloud-functions-steps');
const deployCloudRunSteps = require('./deploy-cloud-run-steps');
const deployFirebaseHostingSteps = require('./deploy-firebase-hosting-steps');
const deployStorageSteps = require('./deploy-storage-steps');
const validateServiceProperty = require('../../validate-service-property');

const deploySteps = (serviceName, serviceConfig) => {
  const { deploy } = serviceConfig;
  if (!deploy) { return []; }

  const { type: deployType } = deploy;
  validateServiceProperty(serviceConfig, serviceName, 'deploy.type');

  switch (deployType) {
    case 'firebase-hosting':
      return deployFirebaseHostingSteps(serviceName, serviceConfig);
    case 'google-cloud-functions':
      return deployCloudFunctionSteps(serviceName, serviceConfig);
    case 'google-cloud-run':
      return deployCloudRunSteps(serviceName, serviceConfig);
    case 'google-cloud-storage':
      return deployStorageSteps(serviceName, serviceConfig);
    default:
      throw new Error(`Unknown deploy type ${deployType}`);
  }
}

module.exports = deploySteps;
