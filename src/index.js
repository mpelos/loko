const envsub = require('envsub');
const YAML = require('yaml')

const CloudBuildEngine = require('./engines/cloud-build-engine');

exports.deployServices = async (filePath, services, { envFiles } = {}) => {
  const envs = Object.entries(process.env).map(([name, value]) => new Object({ name, value }));
  envobj = await envsub({ templateFile: filePath, outputFile: 'null', options: { envs, envFiles } });
  const template = envobj.outputContents;

  const config = YAML.parse(template, { merge: true });

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

  engine.deploy(services);
}
