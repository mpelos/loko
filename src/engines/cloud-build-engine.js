const fs = require('fs');

const shell = require('shelljs');
const tmp = require('tmp');
const YAML = require('yaml');

const buildServiceSteps = require('./cloud-build/build-service-steps');
const deploySteps = require('./cloud-build/deploy-steps');

const CloudBuildEngine = (config) => {
  const buildConfigs = (servicesToInclude) => {
    const buildConfigs = {};

    Object.entries(config.services || {}).forEach(([serviceName, serviceConfig]) => {
      if (servicesToInclude && servicesToInclude.length && !servicesToInclude.includes(serviceName)) { return; }

      const buildConfig = {
        steps: [
          ...buildServiceSteps(serviceName, serviceConfig),
          ...deploySteps(serviceName, serviceConfig),
        ],
      };

      if (config.engine.timeout) { buildConfig.timeout = config.engine.timeout; }

      buildConfigs[serviceName] = YAML.stringify(buildConfig, null, 4);
    });

    return buildConfigs;
  }

  const deploy = (servicesToInclude) => {
    if (!shell.which('gcloud')) {
      throw new Error(
        "Missing 'Google Cloud SDK'. Follow Google instructios for installation: " +
        "https://cloud.google.com/sdk/install"
      )
    }

    Object.entries(buildConfigs(servicesToInclude)).forEach(([serviceName, buildConfig]) => {
      tmp.file((err, path, fd, cleanupCallback) => {
        fs.writeFileSync(path, buildConfig);
        shell.config.silent = true;
        const result = shell.exec(`gcloud builds submit --no-source --async --config ${path}`);

        if (result.code === 0) {
          const logLine = result.stderr.split('\n')[1];
          const logUrl = /\[(.+)\]/.exec(logLine)[1];
          console.info(`${serviceName}: ${logUrl}`);
        }

        cleanupCallback();
      });
    });
  }

  return {
    deploy,
  }
}

module.exports = CloudBuildEngine;
