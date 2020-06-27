const validateServiceProperty = require('../../validate-service-property');

const buildServiceSteps = (serviceName, serviceConfig) => {
  const { build: serviceBuild, image } = serviceConfig;
  const { repository, branch, head } = serviceBuild;

  validateServiceProperty(serviceConfig, serviceName, 'image');

  return [
    buildCloneGitRepoStep(repository, { branch, head }),
    buildBuildImageStep(image),
    buildPushImageStep(image),
  ];
}

const buildCloneGitRepoStep = (repo, { branch = 'master', head } = {}) => {
  let args = 'git clone ';
  if (!head) { args += '--depth 1 ' }
  args += `--branch ${branch} ${repo} .`

  if (head) { args += `\ngit checkout ${head}`; }

  return {
    id: 'clone-git-repository',
    name: 'gcr.io/cloud-builders/git',
    entrypoint: 'bash',
    args: ['-c', args],
  }
}

const buildBuildImageStep = (image) => {
  let args = `docker build -t ${image} .`;
  args += `\ndocker tag ${image} gcr.io/$PROJECT_ID/${image}`;

  return {
    id: 'build-image',
    name: 'gcr.io/cloud-builders/docker',
    entrypoint: 'bash',
    args: ['-c', args],
  }
}

const buildPushImageStep = (image) => {
  return {
    id: 'push-image',
    name: 'gcr.io/cloud-builders/docker',
    entrypoint: 'bash',
    args: ['-c', `docker push gcr.io/$PROJECT_ID/${image}`],
  }
}

module.exports = buildServiceSteps;
