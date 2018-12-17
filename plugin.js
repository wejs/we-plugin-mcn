/**
 * We.js news plugin main file
 */

const CCN = require('./lib/content-change-notificator.js');

module.exports = function loadCCNPlugin(projectPath, Plugin) {
  const plugin = new Plugin(__dirname);

  plugin.setConfigs({
    modelsToNotifyChanges: {},
    modelsToRegisterChanges: {},

    emailTypes: {
      ContentChangeNotificatorCreated: {
        label: 'E-mail de notificação de novo conteúdo criado',
        defaultSubject: `Novo conteúdo {{title}} do tipo {{modelName}}`,
        defaultHTML: `<p>Oi, um novo conteúdo foi criado/cadastrado no sistema com título/nome: "{{title}}"<p>

  <p>Link de acesso: <a href="{{contentUrl}}">{{contentUrl}}</a></p>

  <p>Conteúdo criado por {{actorName}} de id: {{actorId}} e e-mail: {{actorEmail}}</p>

  <br>

  <p>Atenciosamente,<br />{{siteName}}<br />{{siteUrl}}</p>
  `,
        // defaultText: ``,
        templateVariables: {
          actorName: {
            example: 'Alberto Souza',
            description: 'Nome da pessoa que executou a ação'
          },
          modelName: {
            example: 'news',
            description: 'Nome do model ou tipo de conteúdo'
          },
          actorEmail: {
            example: 'contact@linkysysytems.com',
            description: 'E-mail da pessoa que executou a ação'
          },
          actorUrl: {
            example: 'http://...',
            description: 'URL para o perfil da pessoa que executou a ação'
          },
          actorId: {
            example: '01',
            description: 'Id da pessoa que executou a ação'
          },
          title: {
            example: 'Seminário saúde e cultura',
            description: 'Título do conteúdo'
          },
          contentUrl: {
            example: 'http://...',
            description: 'Url para o conteúdo'
          },
          siteName: {
            example: 'Nome do site',
            description: 'Nome do site ou app'
          },
          siteUrl: {
            example: 'http://...',
            description: 'Endereço deste site'
          }
        }
      },

      ContentChangeNotificatorUpdated: {
        label: 'E-mail de notificação de conteúdo alterado',
        defaultSubject: `Notificação de alteração de conteúdos no site {{siteName}}`,
        defaultHTML: `<p>Oi, os conteúdos abaixo foram alterados no site:<p>
  {{{text}}}

  <br>

  <p>Atenciosamente,<br />{{siteName}}<br />{{siteUrl}}</p>
  `,
        // defaultText: ``,
        templateVariables: {
          text: {
            example: 'O conteúdo Exemplo foi alterado ...',
            description: 'Texto com as informações de alteração'
          },
          siteName: {
            example: 'Nome do site',
            description: 'Nome do site ou app'
          },
          siteUrl: {
            example: 'http://...',
            description: 'Endereço deste site'
          }
        }
      },

      ContentChangeNotificatorDestroyed: {
        label: 'E-mail de notificação de conteúdo deletado',
        defaultSubject: `Conteúdo deletado: {{title}} do tipo {{modelName}}`,
        defaultHTML: `<p>Oi, o conteúdo "{{title}}" foi deletado pelo usuário "{{actorName}}"<p>

  <p>Título: {{title}}
  </p>
  <p>Conteúdo deletado por {{actorName}} de id: {{actorId}} e e-mail: {{actorEmail}}</p>

  <br>

  <p>Atenciosamente,<br />{{siteName}}<br />{{siteUrl}}</p>
  `,
        // defaultText: ``,
        templateVariables: {
          actorName: {
            example: 'Alberto Souza',
            description: 'Nome da pessoa que executou a ação'
          },
          modelName: {
            example: 'news',
            description: 'Nome do model ou tipo de conteúdo'
          },
          actorEmail: {
            example: 'contact@linkysysytems.com',
            description: 'E-mail da pessoa que executou a ação'
          },
          actorUrl: {
            example: 'http://...',
            description: 'URL para o perfil da pessoa que executou a ação'
          },
          actorId: {
            example: '01',
            description: 'Id da pessoa que executou a ação'
          },
          title: {
            example: 'Seminário saúde e cultura',
            description: 'Título do conteúdo'
          },
          contentUrl: {
            example: 'http://...',
            description: 'Url para o conteúdo'
          },
          siteName: {
            example: 'Nome do site',
            description: 'Nome do site ou app'
          },
          siteUrl: {
            example: 'http://...',
            description: 'Endereço deste site'
          }
        }
      }
    }
  });

  /**
   * Plugin fast loader for speed up We.js bootstrap
   *
   * @param  {Object}   we
   * @param {Function} done    callback
   */
  plugin.fastLoader = function fastLoader(we, done) {
    we.db.modelsConfigs['model-change-log'] = require('./server/models/model-change-log.js')(we);

    done();
  };

  plugin.CCNs = {};

  plugin.notifyModelsChanges = require('./lib/notifyModelsChanges.js');

  plugin.hooks.on('we:server:after:start', (we, done)=>  {

    const MTNC = we.config.modelsToNotifyChanges;

    for (let modelName in MTNC) {
      if (!MTNC[modelName] && MTNC[modelName].titleFieldName) continue;
      plugin.CCNs[modelName] = new CCN(modelName, MTNC[modelName].titleFieldName, we);
      plugin.CCNs[modelName].bindModelEvents();
    }

    done();
  });

  return plugin;
};