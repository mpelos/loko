const validateServiceProperty = require('../../validate-service-property');

const deployCloudFunctionSteps = (serviceName, serviceConfig) => {
  validateServiceProperty(serviceConfig, serviceName, 'image');
  validateServiceProperty(serviceConfig, serviceName, 'deploy.app_container_dir');
  validateServiceProperty(serviceConfig, serviceName, 'deploy.options.entrypoint');
  validateServiceProperty(serviceConfig, serviceName, 'deploy.options.runtime');
  validateServiceProperty(serviceConfig, serviceName, 'deploy.options.trigger');

  return [
    buildExtractFilesStep(serviceName, serviceConfig),
    buildDeployStep(serviceName, serviceConfig),
  ]
}

const buildExtractFilesStep = (serviceName, serviceConfig) => {
  const { deploy, image } = serviceConfig;
  const { app_container_dir: containerDir } = deploy;

  let args = `echo "Extracted application files from image '${image}' directory '${containerDir}'"`;
  args += `\ndocker build -t ${image} .`;

  return {
    id: 'extract-files',
    name: 'gcr.io/cloud-builders/docker',
    entrypoint: 'bash',
    args: ['-c', args],
  };
}

const buildDeployStep = (serviceName, serviceConfig) => {
  const { deploy } = serviceConfig;
  const { environment, name: deployName, options, public } = deploy;
  const { entrypoint, memory, runtime, trigger, vpc_conector: vpcConnector } = options;

  let args = `gcloud functions deploy ${deployName}` +
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
  if (vpcConnector) { args += ` --vpc-connector ${vpcConnector}`; }

  if (environment) {
    let envList = environment;

    if (!(environment instanceof Array)) {
      envList = Object.entries(environment).map(([key, value]) => `${key}="${value}"`);
    }

    args += ` --set-env-vars ${envList.join(',')}`;
  }

  return {
    id: 'deploy',
    name: 'gcr.io/cloud-builders/gcloud',
    entrypoint: 'bash',
    args: ['-c', args],
  };
}

module.exports = deployCloudFunctionSteps;
