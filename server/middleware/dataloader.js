'use strict';

const gstore = require('gstore-node')();

const dataloaderMiddleware = (req, res, next) => {
    /**
     * "gstore.createDataLoader()" is a utiliy that creates a DataLoader instance
     * that works with the batch operation (several get key at once) on Google Datastore.
     *
     * The DataLoader is an utilizy that optimizes "get" fetching of entity by grouping "get" calls within
     * a single frame of execution and also by caching all the entity.get() result inside a same request
     *
     * With this middleware we attach to the request an instance of the DataLoader
     * that we can then use in our gstore.<Model>.get() calls.
     *
     * More info about dataloader: https://github.com/facebook/dataloader
     */

    req.dataloader = gstore.createDataLoader(gstore.ds);
    next();
}

module.exports = dataloaderMiddleware;