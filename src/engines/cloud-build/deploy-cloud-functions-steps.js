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
  const { environment, name: deployName, options, public } = deploy;
  const { entrypoint, memory, runtime, timeout, trigger, vpc_conector: vpcConnector } = options;

  let args = `CMD="gcloud functions deploy ${deployName}` +
    ` --entry-point ${entrypoint}` +
    ` --runtime ${runtime}` +
    ' --source ./app';

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

  if (environment) {
    let envList = environment;

    if (!(environment instanceof Array)) {
      envList = Object.entries(environment).map(([key, value]) => `${key}="${value}"`);
    }

    args += ` --set-env-vars ${envList.join(',')}`;
  }

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
