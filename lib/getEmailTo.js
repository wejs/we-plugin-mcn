module.exports = function getEmailTo(we) {
  if (we.systemSettings && we.systemSettings.contentChangeNotificatorToEmails) {
    return we.systemSettings.contentChangeNotificatorToEmails;
  }

  return null;
};