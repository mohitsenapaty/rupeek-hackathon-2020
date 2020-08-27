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
  return Investment;
};
