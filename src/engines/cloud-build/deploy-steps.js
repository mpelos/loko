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
    default:
      throw new Error(`Unknown deploy type ${config.deploy.type}`);
  }
}

module.exports = deploySteps;
