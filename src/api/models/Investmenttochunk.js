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
    status: {
      type: DataTypes.STRING,
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
  return Investmenttochunk;
};
