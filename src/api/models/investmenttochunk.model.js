module.exports = (sequelize, DataTypes) => {
  const InvestmentToChunk = sequelize.define('InvestmentToChunk', {
    id: {
      type: DataTypes.INTEGER,
    },
    investmentid: {
      type: DataTypes.INTEGER,
    },
    chunkid: {
      type: DataTypes.INTEGER,
    },
    schemeinterest: {
      type: DataTypes.REAL,
    },
    amount: {
      type: DataTypes.INTEGER,
    },
    earning: {
      type: DataTypes.DATE,
    },
    createdAt: {
      type: DataTypes.STRING,
    },
    updatedAt: {
      type: DataTypes.STRING,
    }
  }, {
    tableName: 'investmenttochunk',
  });
  return InvestmentToChunk;
};
