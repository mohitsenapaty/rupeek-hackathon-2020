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
    investmenttenure: {
      type: DataTypes.INTEGER,
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
    investmenttenure: {
      type: DataTypes.REAL,
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
      logger.error('Something unexpected happened (findInvestmentByParamsInclude)', err);
      throw err;
    }
  };
  Investment.createInvestmentByParams = async (params) => {
    try {
      const investment = await Investment.create(params);
      console.log(investment);
      return investment.dataValues;
    } catch (err) {
      logger.error('Something unexpected happened (createRequestByParams)', err);
      throw err;
    }
  };
  return Investment;
};
