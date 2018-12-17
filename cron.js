module.exports = function (we, done) {
  /**
   * Time to delete old logs
   * @type {Number}
   */
  let mcnTimeToDelete = 10;

  if (
    we.systemSettings &&
    we.systemSettings.mcnTimeToDelete &&
    Number(we.systemSettings.mcnTimeToDelete)
  ) {
    mcnTimeToDelete = we.systemSettings.mcnTimeToDelete;
  }

  let sql = `DELETE FROM model_change_logs WHERE createdAt > NOW() - INTERVAL ${mcnTimeToDelete} DAY`;

  we.db.defaultConnection.query(sql)
  .then( ()=> { done(); })
  .catch((err)=> {
    we.log.error('we-plugin-mcn:cron.js:error on delete old logs', err);

    done();
  });
};