/**
 * ContentChangeNotificator
 * Class to register and notify model changes
 *
 * @param {String} modelName      Model name
 * @param {String} titleFieldName Model field name to title
 * @param {Object} we             We.js instance
 */
function ContentChangeNotificator (
  modelName, titleFieldName, we
) {
  this.modelName = modelName;
  this.titleFieldName = titleFieldName;
  this.we = we;
  this.Model = we.db.models[this.modelName];
}

const CCN = ContentChangeNotificator;

CCN.prototype = {
  bindModelEvents() {
    const we = this.we;

    if (!this.Model) return;

    we.hooks.on('we:before:send:createdResponse', (ctx, next)=> {
      // ctx: { req: req, res: res, data: data }
      if (
        ( ctx.res.locals.model != this.modelName ) ||
        !ctx.req.isAuthenticated() ||
        !ctx.res.locals.data
      ) {
        return next();
      }

      const record = ctx.res.locals.data;
      this.onCreatedRecord(record, ctx.req.user);

      next();
    });

    we.hooks.on('we:before:send:updatedResponse', (ctx, next)=> {
      // ctx: { req: req, res: res, data: data }
      if (
        ( ctx.res.locals.model != this.modelName ) ||
        !ctx.req.isAuthenticated() ||
        !ctx.res.locals.data
      ) {
        return next();
      }

      const record = ctx.res.locals.data;
      this.onUpdatedRecord(record, ctx.req.user);

      next();
    });

    we.hooks.on('we:before:send:deletedResponse', (ctx, next)=> {
      // ctx: { req: req, res: res, data: data }
      if (
        ( ctx.res.locals.model != this.modelName ) ||
        !ctx.req.isAuthenticated() ||
        !ctx.res.locals.data
      ) {
        return next();
      }

      const record = ctx.res.locals.data;
      this.onDestroyedRecord(record, ctx.req.user);

      next();
    });

  },

  onCreatedRecord(record, actor) {
    this.logChange(record, actor, 'create');
    this.sendEmail(record, actor, 'ContentChangeNotificatorCreated');
  },
  onUpdatedRecord(record, actor) {
    this.logChange(record, actor, 'update');
  },
  onDestroyedRecord(record, actor) {
    this.logChange(record, actor, 'delete');
    this.sendEmail(record, actor, 'ContentChangeNotificatorDestroyed');
  },

  logChange(record, actor, type) {
    return new Promise( (resolve, reject)=> {
      const we = this.we;

      let title = this.getTitle(record);
      if (!title) return resolve();

      let actorName = this.getActorName(actor);

      we.db.models['model-change-log']
      .create({
        modelName: this.modelName,
        modelId: record.id,
        title: title,
        actorId: actor.id,
        actorName: actorName,
        actorEmail: actor.email,
        type: type,
        emailSend: true
      })
      .then( ()=> {
        resolve();
      })
      .catch( reject );
    });
  },

  sendEmail(record, actor, emailName) {
    const we = this.we;

    let to = this.getEmailTo(we);
    if (!to) return;

    let title = this.getTitle(record);
    if (!title) return;

    let actorName = this.getActorName(actor);
    let appName = this.getAppName(we);

    let templateVariables = {
      email: actor.email,
      actorName: actorName,
      actorUrl: we.config.hostname+'/user/'+actor.id,
      actorId: actor.id,
      actorEmail: actor.email,
      title: title,
      modelName: this.modelName,
      contentUrl: we.config.hostname+'/'+this.modelName+'/'+record.id,
      siteName: appName,
      siteUrl: we.config.hostname
    };

    we.email.sendEmail(emailName, {
      email: to,
    }, templateVariables, function (err) {
      if (err) {
        we.log.error('Action:'+emailName+' sendEmail:', err);
      }
    });
  },

  getTitle(record) {
    return record[this.titleFieldName];
  },
  getActorName(user) {
    if (user.displayName) return user.displayName;
    if (user.fullName) return user.fullName;
    return 'Usuário com id: '+user.id;
  },
  getAppName: require('./getAppName.js'),
  getEmailTo: require('./getEmailTo.js')
};

module.exports = CCN;