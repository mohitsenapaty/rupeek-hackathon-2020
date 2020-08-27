module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define('Loan', {
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
      type: DataTypes.DATE,
      allowNull: false,
    },
    expirydate: {
      type: DataTypes.DATE,
    },
    fetchedon: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    closedon: {
      type: DataTypes.DATE,
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
