const fs = require('fs');

const shell = require('shelljs');
const tmp = require('tmp');
const YAML = require('yaml');

const buildServiceSteps = require('./cloud-build/build-service-steps');

const CloudBuildEngine = (config) => {
  const buildConfigs = () => {
    const buildConfigs = {};

    Object.entries(config.services || {}).forEach(([serviceName, serviceConfig]) => {
      const buildConfig = {
        steps: [
          ...buildServiceSteps(serviceConfig),
        ],
      };

      if (config.engine.timeout) { buildConfig.timeout = config.engine.timeout; }

      buildConfigs[serviceName] = YAML.stringify(buildConfig, null, 4);
      console.log(buildConfigs[serviceName]);
    });

    return buildConfigs;
  }

  const deploy = () => {
    if (!shell.which('gcloud')) {
      throw new Error(
        "Missing 'Google Cloud SDK'. Follow Google instructios for installation: " +
        "https://cloud.google.com/sdk/install"
      )
    }

    Object.entries(buildConfigs()).forEach(([serviceName, buildConfig]) => {
      tmp.file((err, path, fd, cleanupCallback) => {
        fs.writeFileSync(path, buildConfig);
        shell.config.silent = true;
        const result = shell.exec(`gcloud builds submit --no-source --async --config ${path}`);

        if (result.code === 0) {
          const logLine = result.stderr.split('\n')[1];
          const logUrl = /\[(.+)\]/.exec(logLine)[1];
          console.log(`${serviceName}: ${logUrl}`);
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
