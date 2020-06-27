const deployCloudFunctionSteps = require('./deploy-cloud-functions-steps');
const deployCloudRunSteps = require('./deploy-cloud-run-steps');
const validateServiceProperty = require('../../validate-service-property');

const deploySteps = (serviceName, serviceConfig) => {
  const { deploy } = serviceConfig;
  if (!deploy) { return []; }

  const { type: deployType } = deploy;
  validateServiceProperty(serviceConfig, serviceName, 'deploy.type');

  switch (deployType) {
    case 'google-cloud-run':
      return deployCloudRunSteps(serviceName, serviceConfig);
    case 'google-cloud-functions':
      return deployCloudFunctionSteps(serviceName, serviceConfig);
    default:
      throw new Error(`Unknown deploy type ${deployType}`);
  }
}

module.exports = deploySteps;
