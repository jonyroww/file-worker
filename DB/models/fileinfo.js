'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FileInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  FileInfo.init({
    title: DataTypes.STRING,
    extension: DataTypes.STRING,
    mimeType: DataTypes.STRING,
    size: DataTypes.NUMERIC
  }, {
    sequelize,
    modelName: 'FileInfo',
  });
  return FileInfo;
};