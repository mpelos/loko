const extractFilesSteps = require('./extract-files-steps');
const validateServiceProperty = require('../../validate-service-property');

const deployCloudFunctionSteps = (serviceName, serviceConfig) => {
  validateServiceProperty(serviceConfig, serviceName, 'deploy.options.entrypoint');
  validateServiceProperty(serviceConfig, serviceName, 'deploy.options.runtime');
  validateServiceProperty(serviceConfig, serviceName, 'deploy.options.trigger');

  return [
    ...extractFilesSteps(serviceName, serviceConfig),
    buildDeployStep(serviceName, serviceConfig),
  ]
}

const buildDeployStep = (serviceName, serviceConfig) => {
  const { deploy } = serviceConfig;
  const { environment: envs, name: deployName, options, public } = deploy;
  const { entrypoint, memory, region, runtime, timeout, trigger, vpc_connector: vpcConnector } = options;

  let args = `CMD="gcloud functions deploy ${deployName}` +
    ` --entry-point ${entrypoint}` +
    ` --runtime ${runtime}` +
    ' --source ./app';
  if (region) { args+= ` --region ${region}`; }

  if (trigger === 'topic') {
    validateServiceProperty(serviceConfig, serviceName, 'deploy.options.trigger_topic');
    const { trigger_topic: triggerTopic } = options;
    args += ` --trigger-topic ${triggerTopic}`;
  } else {
    args += ` --trigger-${trigger}`;
  }

  if (public) { args += ' --allow-unauthenticated'; }
  if (memory) { args += ` --memory ${memory}`; }
  if (timeout) { args += ` --timeout ${timeout}`; }
  if (vpcConnector) { args += ` --vpc-connector ${vpcConnector}`; }
  if (envs) { args += ` --set-env-vars ${envs.join(',')}`; }

  args += `"
echo \\$ $$CMD
$$CMD
  `;

  return {
    id: 'deploy',
    name: 'gcr.io/cloud-builders/gcloud',
    entrypoint: 'bash',
    args: ['-c', args],
  };
}

module.exports = deployCloudFunctionSteps;
