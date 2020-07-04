const validateServiceProperty = require('../../validate-service-property');

const buildServiceSteps = (serviceName, serviceConfig) => {
  const { build: serviceBuild, image } = serviceConfig;

  validateServiceProperty(serviceConfig, serviceName, 'image');

  return [
    ...buildCloneRepoStep(serviceName, serviceConfig),
    buildBuildImageStep(serviceName, serviceConfig),
    buildPushImageStep(image),
  ];
};

const buildCloneRepoStep = (serviceName, serviceConfig) => {
  validateServiceProperty(serviceConfig, serviceName, 'build', 'repository', 'type');

  const { build: serviceBuild } = serviceConfig;
  const { repository } = serviceBuild;
  const { type: repositoryType } = repository;

  switch (repositoryType) {
    case 'git':
      return buildCloneGitRepoStep(serviceName, serviceConfig);
    case 'cloud_source_repositories':
      return buildCloneCloudSourceRepositoryStep(serviceName, serviceConfig);
    default:
      throw new Error(`Unknown repository type '${repositoryType}'`)
  }
};

const buildCloneGitRepoStep = (serviceName, serviceConfig) => {
  validateServiceProperty(serviceConfig, serviceName, 'build', 'repository', 'url');

  const { build: serviceBuild } = serviceConfig;
  const { repository, branch = 'master', head } = serviceBuild;
  const { url: repoUrl } = repository;

  let args = 'git clone ';
  if (!head) { args += '--depth 1 ' }
  args += `--branch ${branch} ${repoUrl} .`

  if (head) { args += `\ngit checkout ${head}`; }

  return [{
    id: 'clone-git-repository',
    name: 'gcr.io/cloud-builders/git',
    entrypoint: 'bash',
    args: ['-c', args],
  }];
};

const buildCloneCloudSourceRepositoryStep = (serviceName, serviceConfig) => {
  validateServiceProperty(serviceConfig, serviceName, 'build', 'repository', 'name');

  const { build: serviceBuild } = serviceConfig;
  const { repository, branch = 'master', head } = serviceBuild;
  const { name: repoName } = repository;

  return [{
    id: 'clone-cloud-source-repository',
    name: 'gcr.io/cloud-builders/gcloud',
    entrypoint: 'bash',
    args: ['-c', `gcloud source repos clone ${repoName} . --project=$PROJECT_ID`],
  }, {
    id: 'clone-git-repository',
    name: 'gcr.io/cloud-builders/git',
    entrypoint: 'bash',
    args: ['-c', `git checkout ${head || branch}`],
  }];
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
