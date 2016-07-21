'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const config = require('./config');
const routes = require('./routes');
const gcloud = require('google-cloud')({
    projectId: config.get('GCLOUD_PROJECT')
});
const gstore     = require('gstore-node')();

// config Datastore
const ds = gcloud.datastore(
    {
        apiEndpoint: 'http://localhost:8080'
    }
);

// config gstore
gstore.connect(ds);

// Create App
// ----------
let app = express();
app.use('/static', express.static(__dirname + '/public'));
app.set('view engine', 'pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

app.use(routes);

app.listen(4000, () => {
    console.log('App listening on port 4000');
});

/*
Extra: Deployment options
Let’s explore some of the other deployment commands we might have used:

1. To use the specified app.yaml file, package source code in current directory into local Docker container, push local container 
to cloud, direct all traffic to new container, and stop previous versions:

gcloud preview app deploy app.yaml --docker-build local

This is useful for saving the built Docker image locally before it is deployed. It is also faster than building the Docker container remotely.

2. To use the specified app.yaml file, package source code in current directory into local Docker container, push local container to 
cloud, do not direct any traffic to new container as version beta, do not stop previous versions:

gcloud preview app deploy app.yaml --docker-build local --no-promote --version beta

This command deployed a new version, but did not direct any traffic to it. The previously deployed version is still running, and we can 
test the new version before customers see it. The new version would be available at https://beta-dot-<your-project-id>.appspot.com.
*/