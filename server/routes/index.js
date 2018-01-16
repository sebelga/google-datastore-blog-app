var express = require('express');
var router  = express.Router();

require('./admin.routes')(router);
require('./blog-post.routes')(router);
require('./comment.routes')(router);

module.exports = router;