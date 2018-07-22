'use strict';

const Storage = require('@google-cloud/storage');

module.exports = ({ config }) => {
  const storage = new Storage({
    projectId: config.projectId,
  });

  return storage;
};
