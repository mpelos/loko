const validateServiceProperty = (serviceConfig, serviceName, path) => {
  let hasErr = false;

  path.split('.').reduce((prev, key) => {
    const value = prev[key];
    console.log(prev, key)
    if (value === undefined) { hasErr = true; }
    return prev[key] || {};
  }, serviceConfig);

  if (hasErr) { throw new Error(`Missing services.${serviceName}.${path}`); }
};

module.exports = validateServiceProperty;
