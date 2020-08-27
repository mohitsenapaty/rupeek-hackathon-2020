module.exports = (sequelize, DataTypes) => {
  const Investment = sequelize.define('Investment', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
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
      type: DataTypes.TIMESTAMP,
      allowNull: false,
    },
    fetchedon: {
      type: DataTypes.TIMESTAMP,
      allowNull: false,
    },
    closedon: {
      type: DataTypes.TIMESTAMP,
    },
  }, {
    tableName: 'investment',
  });
  return Investment;
};
