module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define('Loan', {
    id: {
      type: DataTypes.INTEGER,
    },
    loanid: {
      type: DataTypes.TEXT,
    },
    loanamount: {
      type: DataTypes.REAL,
    },
    balanceamount: {
      type: DataTypes.REAL,
    },
    tenure: {
      type: DataTypes.INTEGER,
    },
    startedon: {
      type: DataTypes.DATE,
    },
    expirydate: {
      type: DataTypes.DATE,
    },
    fetchedon: {
      type: DataTypes.DATE,
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
    tableName: 'loan',
  });
  return Loan;
};
