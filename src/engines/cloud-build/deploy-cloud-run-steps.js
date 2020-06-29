const validateServiceProperty = require('../../validate-service-property');

const deployCloudRunSteps = (serviceName, serviceConfig) => {
  validateServiceProperty(serviceConfig, serviceName, 'image');
  validateServiceProperty(serviceConfig, serviceName, 'deploy.name');
  validateServiceProperty(serviceConfig, serviceName, 'deploy.options.region');

  const { deploy, image } = serviceConfig;
  const { name: deployName, options = {}, environment: envs, public } = deploy;
  const { memory, region, vpc_connector: vpcConnector } = options;

  let args = `CMD="gcloud beta run deploy ${deployName}` +
    ` --image gcr.io/$PROJECT_ID/${image}` +
    ' --platform managed' +
    ` --region ${region}`;
  if (public) { args += ' --allow-unauthenticated'; }
  if (memory) { args += ` --memory ${memory}`; }
  if (vpcConnector) { args += ` --vpc-connector ${vpcConnector}`; }
  if (envs) { args += ` --set-env-vars ${envs.join(',')}`; }

  args += `"
echo \\$ $$CMD
$$CMD
  `;

  return [
    {
      id: 'deploy',
      name: 'gcr.io/cloud-builders/gcloud',
      entrypoint: 'bash',
      args: ['-c', args],
    }
  ]
}

module.exports = deployCloudRunSteps;
