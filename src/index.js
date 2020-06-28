const fs = require('fs');

const YAML = require('yaml')

const CloudBuildEngine = require('./engines/cloud-build-engine');

exports.deployServices = (filePath, services) => {
  const file = fs.readFileSync(filePath, 'utf-8');
  const config = YAML.parse(file, { merge: true });

  if (!config.engine) { throw new Error('Missing engine'); }

  const engineName = typeof config.engine === 'string' ? config.engine : config.engine.name;

  let engine;
  switch (engineName) {
    case 'cloud-build':
      engine = CloudBuildEngine(config);
      break;
    default:
      throw new Error(`Unknown engine ${config.engine}`);
  }

  engine.deploy(services);
}
