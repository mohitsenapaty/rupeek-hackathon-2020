module.exports = (sequelize, DataTypes) => {
  const Chunk = sequelize.define('Chunk', {
    loan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    interestrate: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    currentinterestrate: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invested: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    closed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    investedon: {
      type: DataTypes.DATE,
    },
    closedon: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fetchedon: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'chunk',
  });
  return Chunk;
};
