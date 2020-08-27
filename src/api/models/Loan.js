module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define('Loan', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    loanid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    loanamount: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    balanceamount: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tenure: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startedon: {
      type: DataTypes.TIMESTAMP,
      allowNull: false,
    },
    expirydate: {
      type: DataTypes.TIMESTAMP,
    },
    fetchedon: {
      type: DataTypes.TIMESTAMP,
      allowNull: false,
    },
    closedon: {
      type: DataTypes.TIMESTAMP,
    },
    scheme: {
      type: DataTypes.REAL,
    },
    residueamount: {
      type: DataTypes.REAL,
    },
  }, {
    tableName: 'loan',
  });
  return Loan;
};
