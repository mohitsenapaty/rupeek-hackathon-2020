const { logger } = require('../../config/logger');

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
    amount: {
      type: DataTypes.REAL,
      allowNull: false
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
  Chunk.findChunksByParamsInclude = async (params) => {
    try {
      const reqRows = await Chunk.findAll({
        where: params,
      });
      return reqRows;
    } catch (err) {
      logger.error('Something unexpected happened (find by params req)', err);
      throw err;
    }
  };
  Chunk.findChunkByID = async (id) => {
    try {
      const reqRow = await Chunk.findOne({
        where: { id },
      });
      return reqRow;
    } catch (err) {
      logger.error('Something unexpected happened (find by id req)', err);
      throw err;
    }
  };
  return Chunk;
};
