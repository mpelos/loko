const fs = require('fs');
const path = require('path');
const process = require('process');

const envsub = require('envsub');
const tmp = require('tmp');
const YAML = require('yaml')

const CloudBuildEngine = require('./engines/cloud-build-engine');

exports.deployServices = async (filePath, servicesToDeploy, { envFiles } = {}) => {
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  const baseDir = path.dirname(filePath);
  fileContent = parseEnvs(fileContent, baseDir);
  const tmpObj = tmp.fileSync();
  fs.writeFileSync(tmpObj.name, fileContent);

  const envs = Object.entries(process.env).map(([name, value]) => new Object({ name, value }));
  envobj = await envsub({ templateFile: tmpObj.name, options: { envs } });
  fileContent = envobj.outputContents;

  const config = YAML.parse(fileContent, { merge: true });

  if (!config.engine || !config.engine.name) { throw new Error('Missing engine'); }

  const engineName = typeof config.engine === 'string' ? config.engine : config.engine.name;

  let engine;
  switch (engineName) {
    case 'cloud-build':
      engine = CloudBuildEngine(config);
      break;
    default:
      throw new Error(`Unknown engine ${config.engine.name}`);
  }

  engine.deploy(servicesToDeploy);
}

const parseEnvs = (file, baseDir) => {
  let config = YAML.parse(file, { merge: true });

  config = {
    ...config,
    services: Object.entries(config.services || {}).reduce((acc, [serviceName, serviceConfig]) => {
      acc[serviceName] = serviceConfig
      const { environment: envsObj, env_files: envFiles } = serviceConfig;

      if (envsObj) {
        serviceConfig.environment = envObjToArray(envsObj);
      }

      if (envFiles) {
        const envFilesEnvs = envFiles.reduce((acc, filePath) => {
          const envs = fs.readFileSync(path.resolve(baseDir, filePath), 'utf-8')
            .split('\n')
            .filter(l => /^.+=.+$/.test(l));
          return [...acc, ...envs];
        }, []);

        if (!serviceConfig.environment) { serviceConfig.environment = []; }
        serviceConfig.environment = [...serviceConfig.environment, envFilesEnvs];
      }

      return acc;
    }, {})
  };

  return YAML.stringify(config);
}

const envObjToArray = (envs) => {
  if (!(envs instanceof Array)) {
    return Object.entries(envs).map(([key, value]) => `${key}="${value}"`);
  }

  return envsObj
}
