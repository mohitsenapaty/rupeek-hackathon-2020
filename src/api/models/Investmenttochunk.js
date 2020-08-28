const { logger } = require('../../config/logger');

module.exports = (sequelize, DataTypes) => {
  const Investmenttochunk = sequelize.define('Investmenttochunk', {
    investmentid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chunkid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    schemeinterest: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    amount: {
      type: DataTypes.REAL,
    },
    earning: {
      type: DataTypes.REAL,
    },
  }, {
    tableName: 'investmenttochunk',
  });
  Investmenttochunk.findInvToChunksByParamsInclude = async (params) => {
    try {
      const reqRows = await Investmenttochunk.findAll({
        where: params,
      });
      return reqRows;
    } catch (err) {
      logger.error('Something unexpected happened (find by params req)', err);
      throw err;
    }
  };
  return Investmenttochunk;
};
