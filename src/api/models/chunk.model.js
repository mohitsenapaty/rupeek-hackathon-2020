module.exports = (sequelize, DataTypes) => {
  const Chunk = sequelize.define('Chunk', {
    id: {
      type: DataTypes.INTEGER,
    },
    loan: {
      type: DataTypes.INTEGER,
    },
    interestrate: {
      type: DataTypes.REAL,
    },
    invested: {
      type: DataTypes.BOOLEAN,
    },
    closed: {
      type: DataTypes.BOOLEAN,
    },
    investedon: {
      type: DataTypes.DATE,
    },
    fetchedon: {
      type: DataTypes.DATE,
    },
    closedon: {
      type: DataTypes.DATE,
    },
    currentinterestrate: {
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
    tableName: 'chunk',
  });
  return Chunk;
};
