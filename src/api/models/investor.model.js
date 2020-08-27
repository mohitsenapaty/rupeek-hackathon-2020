module.exports = (sequelize, DataTypes) => {
  const Investor = sequelize.define('Investor', {
    id: {
      type: DataTypes.INTEGER,
    },
    refid: {
      type: DataTypes.TEXT,
    },
    pass: {
      type: DataTypes.TEXT,
    },
    phone: {
      type: DataTypes.TEXT,
    },
    createdAt: {
      type: DataTypes.STRING,
    },
    updatedAt: {
      type: DataTypes.STRING,
    }
  }, {
    tableName: 'investor',
  });
  return Investor;
};
