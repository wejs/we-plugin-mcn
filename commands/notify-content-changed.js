const NMC = require('../lib/notifyModelsChanges.js');

let we;

module.exports = function notifyContentChangesCommand (program, helpers) {

  program
  .command('notify-content-changed')
  .alias('NCCd')
  .option('-m, --minutes <minutes>', 'last changed minutes')
  .description('Command to notify content changes')
  .action( function run(opts) {
    we = helpers.getWe();

    we.bootstrap( (err)=> {
      if (err) return doneAll(err);
      NMC.notifyAll(we, opts, doneAll);
    });

  });
};

function doneAll(err) {
  if (err) {
    we.log.error('NCCd:Done with error', err);
  } else {
    we.log.verbose('NCCd:Done all');
  }

  we.exit(process.exit);
}
