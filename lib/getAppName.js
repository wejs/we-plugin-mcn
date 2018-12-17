module.exports = function getAppName(we) {
  if (we.systemSettings && we.systemSettings.siteName) {
    return we.systemSettings.siteName;
  }

  return we.config.appName;
};