
/**
 * Model change log
 *
 * usefull to track model changes
 */

module.exports = function ModelChangeLogModel(we) {
  const model = {
    definition: {
      modelName: {
        type: we.db.Sequelize.STRING,
        allowNull: false
      },
      modelId: {
        type: we.db.Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
      },
      actorId: {
        type: we.db.Sequelize.INTEGER,
        allowNull: false
      },
      actorName: {
        type: we.db.Sequelize.TEXT,
        allowNull: true,
      },
      actorEmail: {
        type: we.db.Sequelize.TEXT,
        allowNull: true,
      },

      type: {
        // create, update, delete
        type: we.db.Sequelize.STRING(20),
        allowNull: false
      },

      emailSend: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false
      }
    },
    associations: {},
    options: {
      tableName: 'model_change_logs',
      enableAlias: false,

      classMethods: {
        urlAlias() { return null; }
      },
      instanceMethods: {},
      hooks: {}
    }
  };

  return model;
};
