const { logger } = require('../../config/logger');

module.exports = (sequelize, DataTypes) => {
  const Investment = sequelize.define('Investment', {
    investor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    returntotal: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roimaxlimit: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    investedon: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fetchedon: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    closedon: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'investment',
  });
  Investment.findInvestmentByParamsInclude = async (params, order, additional) => {
    try {
      // const paramsAll = { ...params, ...additional };
      const reqRows = await Investment.findAll({
        where: params,
        order,
      });
      return reqRows;
    } catch (err) {
      logger.error('Something unexpected happened (find by params req)', err);
      throw err;
    }
  };
  return Investment;
};
