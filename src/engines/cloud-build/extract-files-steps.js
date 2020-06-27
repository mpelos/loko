const validateServiceProperty = require('../../validate-service-property');

const extractFilesSteps = (serviceName, serviceConfig) => {
  validateServiceProperty(serviceConfig, serviceName, 'image');
  validateServiceProperty(serviceConfig, serviceName, 'deploy.app_container_dir');

  const { deploy, image } = serviceConfig;
  const { app_container_dir: containerDir } = deploy;

  let args = `echo "Extracted application files from image '${image}' directory '${containerDir}'"`;
  args += `\ndocker run -v $(pwd):/opt/mount --rm --entrypoint mv ${image} ${containerDir} /opt/mount/app`;

  return [{
    id: 'extract-files',
    name: 'gcr.io/cloud-builders/docker',
    entrypoint: 'bash',
    args: ['-c', args],
  }];
}

module.exports = extractFilesSteps;
