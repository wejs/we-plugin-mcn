const notifyModelsChanges = {
  notifyAll(we, opts, cb) {
    this.getRecordsToNotify(we, opts, (err, data, records)=> {
      if (err) return cb(err);

      if (!Object.keys(data).length) return cb();

      let text = this.renderText(we, data);

      if (!text) return cb();

      this.sendEmail(we, opts, text, (err)=> {
        if (err) return cb(err);

        this.setEmailNotificationFlag(we, records, cb);
      });
    });
  },

  getRecordsToNotify(we, opts, cb) {
    we.db.models['model-change-log']
    .findAll({
      where: {
        type: 'update',
        [we.Op.or]: [
          { emailSend: false },
          { emailSend: null }
        ]
      },
      raw: true
    })
    .then( (records)=> {
      let data = {};

      records.forEach( (r)=> {
        let uid = r.modelName+'_'+r.modelId;

        if (!data[ uid ]) data[ uid ] = {
          count: 0,
          title: r.title,
          modelName: r.modelName,
          byActor: {}
        };

        data[ uid ].count ++;

        if (!data[ uid ].byActor[r.actorId]) {
          data[ uid ].byActor[r.actorId] = {
            count: 0,
            actorName: r.actorName,
            actorId: r.actorId,
            actorEmail: r.actorEmail
          };
        }

        data[ uid ].byActor[r.actorId].count ++;

      });

      we.log.verbose('notifyModelsChanges:Data to notify:', data);

      cb(null, data, records);
    })
    .catch(cb);
  },

  renderText(we, data) {
    let text = '';

    for (let uid in data) {
      let item = data[uid];

      text += `<p>O conteúdo <strong>${item.title}</strong> do tipo <strong>${item.modelName}</strong> foi atualizado <strong>${item.count}</strong> veze(s):<br>`;
      text += `<ul>`;

      for (let actorId in item.byActor) {
        let a = item.byActor[actorId];

        text += `<li><strong>${a.actorName}</strong> atualizou <strong>${a.count}</strong> veze(s). (ID: ${actorId}, e-mail: <strong>${a.actorEmail}</strong>)</li>`;
      }

      text += `</ul>`;
      text += `</p>`;
    }

    return text;
  },

  sendEmail(we, opts, text, cb) {
    let to = this.getEmailTo(we);
    if (!to) return;

    let appName = this.getAppName(we);

    let templateVariables = {
      text: text,
      siteName: appName,
      siteUrl: we.config.hostname
    };

    we.email.sendEmail('ContentChangeNotificatorUpdated', {
      email: to,
    }, templateVariables, function (err) {
      if (err) {
        we.log.error('notifyModelsChanges:ContentChangeNotificatorUpdated sendEmail:', err);
      }

      we.log.verbose('notifyModelsChanges:E-mail send successfuly to:', to);

      cb();
    });
  },

  setEmailNotificationFlag(we, records, cb) {
    we.db.models['model-change-log']
    .update( { emailSend: true }, {
      where: {
        type: 'update',
        [we.Op.or]: [
          { emailSend: false },
          { emailSend: null }
        ]
      },
      fields: ['emailSend'],
      raw: true
    })
    .then( ()=> {
      cb();
    })
    .catch(cb);
  },

  getEmailTo: require('./getEmailTo.js'),
  getAppName: require('./getAppName.js')
};


module.exports = notifyModelsChanges;