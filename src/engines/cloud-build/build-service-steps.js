const validateServiceProperty = require('../../validate-service-property');

const buildServiceSteps = (serviceName, serviceConfig) => {
  const { build: serviceBuild, image } = serviceConfig;
  const { repository, branch, head } = serviceBuild;

  validateServiceProperty(serviceConfig, serviceName, 'image');

  return [
    buildCloneGitRepoStep(repository, { branch, head }),
    buildBuildImageStep(serviceName, serviceConfig),
    buildPushImageStep(image),
  ];
};

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
};

const buildBuildImageStep = (_serviceName, serviceConfig) => {
  const { build, image } = serviceConfig;
  const { args: buildArgs } = build;

  let args = `docker build -t ${image}`;

  if (buildArgs) {
    let buildArgsList = buildArgs;

    if (!(buildArgs instanceof Array)) {
      buildArgsList = Object.entries(buildArgs).map(([key, value]) => `${key}="${value}"`);
    }

    buildArgsList.forEach(buildArg => {
      args += ` --build-arg ${buildArg}`
    });
  }

  args += ' .';
  args += `\ndocker tag ${image} gcr.io/$PROJECT_ID/${image}`;

  return {
    id: 'build-image',
    name: 'gcr.io/cloud-builders/docker',
    entrypoint: 'bash',
    args: ['-c', args],
  };
};

const buildPushImageStep = (image) => {
  return {
    id: 'push-image',
    name: 'gcr.io/cloud-builders/docker',
    entrypoint: 'bash',
    args: ['-c', `docker push gcr.io/$PROJECT_ID/${image}`],
  }
};

module.exports = buildServiceSteps;
