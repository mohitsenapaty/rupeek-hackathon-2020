module.exports = (sequelize, DataTypes) => {
  const Chunk = sequelize.define('Chunk', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
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
      type: DataTypes.TIMESTAMP,
    },
    closedon: {
      type: DataTypes.TIMESTAMP,
      allowNull: false,
    },
    fetchedon: {
      type: DataTypes.TIMESTAMP,
    },
  }, {
    tableName: 'chunk',
  });
  return Chunk;
};
