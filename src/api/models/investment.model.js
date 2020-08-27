module.exports = (sequelize, DataTypes) => {
  const Investment = sequelize.define('Investment', {
    id: {
      type: DataTypes.INTEGER,
    },
    investor: {
      type: DataTypes.INTEGER,
    },
    amount: {
      type: DataTypes.REAL,
    },
    investedon: {
      type: DataTypes.DATE,
    },
    closedon: {
      type: DataTypes.DATE,
    },
    fetchedon: {
      type: DataTypes.DATE,
    },
    returntotal: {
      type: DataTypes.REAL,
    },
    roimaxlimit: {
      type: DataTypes.REAL,
    },
    status: {
      type: DataTypes.TEXT,
    },
    createdAt: {
      type: DataTypes.STRING,
    },
    updatedAt: {
      type: DataTypes.STRING,
    }

  }, {
    tableName: 'investment',
  });
  return Investment;
};
