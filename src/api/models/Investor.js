module.exports = (sequelize, DataTypes) => {
  const Investor = sequelize.define('Loan', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
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
  return Investor;
};
