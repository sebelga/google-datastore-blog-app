# Google Datastore Blog Application
> A Node.js demo application built with [`@google-cloud/datastore`](https://github.com/googleapis/nodejs-datastore) & [`gstore-node`](https://github.com/sebelga/gstore-node) running on Google App Engine.

This small application will show you how to use gstore-node to build an application on Google App Engine **standard** environment.  gstore-node is a library that lets you define **Schemas** for your entities to easily validate the entities _data_ before saving them in Google Datastore. It has also other nice features like **middleware**, **virtual properties** or a **cache layer** to speed up the entities fetching.  

This repository can be a starting point to build complex applications on top of the Google Datastore.

## Highlights

* Validate entity data (write a _comment_ to a post to see it in action)
* Middleware (deleting a post will delete its feature image + all its comments)
* Entities Cache
* Upload/delete image to the Google Storage

<!-- ## Live demo

You can see a live demo of this application at the foolowing url:   [https://blog-nodejs.appspot.com](https://blog-nodejs.appspot.com).  
Play with it as much as you want but don't feel sad if your post disappears the next day as a cron job does a clean up every 24h :smile:. -->

## Running application

You can play with the deployed application at the following url (create as many posts or comments as you like!)  
[https://blog-nodejs.appspot.com/blog](https://blog-nodejs.appspot.com/blog)

## Getting started

### System tools

Before starting make sure that you have the necesary dependencies installed on your system.

* node (8 +) & npm
* Google SDK (you can [download it here](https://cloud.google.com/sdk/downloads)) with the `gcloud` cli on your $PATH

Once you have installed the Google SDK, make sure that you are **authenticated**. In your terminal run

```sh
gcloud auth application-default login
```

A window browser should open, allowing you to authenticate the Google Cloud SDK.

### Google Cloud project

Before starting, create a projet in the Google Cloud Platform to deploy the application.  
[Go to App Engine](https://console.cloud.google.com/projectselector/appengine/create) and create a new project if you don't have one.

You then have to make sure to:

1. Enable billing for the project ([Enable billing](https://cloud.google.com/billing/docs/how-to/modify-project?visit_id=1-636516267130301291-4124238769&rd=1#enable-billing))

2. Enable the Google Cloud Datastore API ([Enable the API](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com))

3. Set the project as _default_ in gcloud

```sh
gcloud config set project <your-project-id>
```

### NPM dependencies

Once you have your project configured in Google Cloud, install the application dependencies with

```js
npm install
```

### Environment variables (.env file)

The application needs a few environment variables to be defined. Rename the _example.env_ file inside the "./server" folder to _.env_. Make sure to define the `GOOGLE_CLOUD_PROJECT` and `GCLOUD_BUCKET` variables.  
This `.env` file **sould not** be pushed to source control. It is only used during development.

```txt
# -------------------
# Server
# -------------------
## Server port (optional. Default 8080)
PORT=3000

# -------------------
# Google Cloud
# -------------------
GOOGLE_CLOUD_PROJECT=xxx
GCLOUD_BUCKET=xxx

## Namespace for the Datastore entities (optional)
DATASTORE_NAMESPACE=development

## Local Datastore Emulator Host (optional)
# DATASTORE_EMULATOR_HOST=localhost:8081

# -------------------
# Misc
# -------------------
## Enable Logger (optional. Default "true")
LOGGER_ENABLED=true

## Logger level (optional. Default "info")
## Allowed values: 'error', 'warn', 'info', 'verbose', 'debug', 'silly'
LOGGER_LEVEL=info
```

### Update the Datastore indexes

To be able to execute the Datastore Queries of this application, you will need first to **update the Datastore indexes** with the command below. For more information about indexes, [read the documentation](https://cloud.google.com/appengine/docs/flexible/nodejs/configuring-datastore-indexes-with-index-yaml).

```sh
gcloud datastore create-indexes ./index.yaml
```

### Start the Application

```js
npm start
```

You can now navigate to `http://localhost:3000` and start creating posts and comments.

### Deploy the application

Before deploying the application make sure to define the `GCLOUD_BUCKET` environment variable inside the `app.yaml` file with your Google Storage bucket id.  

Then run the following command:

```sh
npm run deploy

# If you modified the client files, this command will bundle the .js and .css
# to the "public" folder before deploying the app to App Engine
npm run deploy-with-client
```

### Make changes to the client code

This demo application is mainly to showcase how to build an application in Node.js with gstore-node. The javascript code for the client has been reduced to the strict minimum for the purpose of the demo and to "get the job done".
If you want to make some modifications you can run a watcher to bundle the Javascript and Sass files with

```js
npm run watch
```

This will bundle the .js and .css file, save them in the `public/dist` folder of the server and update their path in the `/server/views/layout.pug` template.

## Meta

Sébastien Loix – [@sebloix](https://twitter.com/sebloix)

Distributed under the MIT license. See `LICENSE` for more information.

[https://github.com/sebelga](https://github.com/sebelga/)  
