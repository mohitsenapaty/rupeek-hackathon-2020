const { logger } = require('../../config/logger');

module.exports = (sequelize, DataTypes) => {
  const Investor = sequelize.define('Investor', {
    refid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'investor',
  });
  Investor.findInvestorByParams = async (params) => {
    try {
      const reqRows = await Investor.findAll({
        where: params,
      });
      return reqRows;
    } catch (err) {
      logger.error('Something unexpected happened (find by params req)', err);
      throw err;
    }
  };
  return Investor;
};
