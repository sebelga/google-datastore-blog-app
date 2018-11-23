# Google Datastore App demo: My Blog

> A Node.js demo application built with [`@google-cloud/datastore`](https://github.com/googleapis/nodejs-datastore) & [`gstore-node`](https://github.com/sebelga/gstore-node) running on Google App Engine.

This small application demonstrates how to use `gstore-node` to build an application on Google App Engine **standard** environment. `gstore-node` is an modeling library that lets you define **Schemas** for your entities to easily validate their _data_ before saving them in Google Datastore. It has also other useful features like _pre_ & _post_ **middleware**, **virtual properties** or a **cache layer** to speed up entities fetching.

Use this repository as a starting point to build complex applications on top of the Google Datastore.

## Highlights

- **Validate** entity data before saving it to the Dastore
- Middleware (deleting a post will delete its feature image & its comments entities)
- Entities **Cache** (memory LRU)
- Upload/delete image to the **Google Storage**

## Running application

You can see a live version of the application at the following url: [https://blog-nodejs.appspot.com/blog](https://blog-nodejs.appspot.com/blog).  
Play with it as much as you want but don't feel sad if your curated post disappears as a Cron job cleans up the posts every 24h :smile:.

## Getting started

### System tools

Before starting make sure that you have the necesary dependencies installed on your system.

- node (8 +) & npm
- Google SDK (you can [download it here](https://cloud.google.com/sdk/downloads)) with the `gcloud` cli on your $PATH

Once you have installed the Google SDK, make sure that you are **authenticated**. In your terminal run

```sh
gcloud auth application-default login
```

A window browser should open, allowing you to authenticate the Google Cloud SDK.

### Google Cloud project

Before starting, create a projet in the Google Cloud Platform to deploy the application.  
[Go to App Engine](https://console.cloud.google.com/projectselector/appengine/create) and create a new project if you don't have one.

You then have to make sure to:

1.  Enable billing for the project ([Enable billing](https://cloud.google.com/billing/docs/how-to/modify-project?visit_id=1-636516267130301291-4124238769&rd=1#enable-billing))

2.  Enable the Google Cloud Datastore API ([Enable the API](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com))

3.  Set the project as _default_ in gcloud

```sh
gcloud config set project <your-project-id>
```

### NPM dependencies

Once you have your project configured in Google Cloud, install the application dependencies with

```sh
npm install
# or
yarn
```

### Environment variables

The application needs a few environment variables to be defined. For **local development** those variables are defined in a `.env` file. Rename the _example.env_ file to _.env_. Make sure to define the `GOOGLE_CLOUD_PROJECT` and `GCLOUD_BUCKET` variables. This `.env` file **sould not** be commited and pushed to source control.

```txt
# -------------------
# Server
# -------------------
## Server port (optional. Default 8080)
PORT=3000

# -------------------
# Google Cloud
# -------------------
GOOGLE_CLOUD_PROJECT=<your-google-cloud-project>
GCLOUD_BUCKET=<your-google-storage-bucket>

## Namespace for the Datastore entities (optional)
DATASTORE_NAMESPACE=development

## Local Datastore Emulator Host (optional but recommended for development)
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

### Start the Application in local

```js
npm start-local
```

You can now navigate to `http://localhost:3000` and start creating posts and comments.

### Deploy the application

Before deploying the application make sure you have defined the `GCLOUD_BUCKET` environment variable in the `app.yaml` file. Then, to deploy the application, run the following command:

```sh
npm run deploy -v <app-version>
# or
yarn deploy -v <app-version>
```

This script will build the client + server code and deploy the application on Google Cloud. But **it will not** promote the traffic to the specified version. This allows you to **first test your application** and make sure that everything run correctly.  
Once you are ready to send the traffic to the new version, simply run:

```sh
npm run promote -v <app-version>
# or
yarn promote -v <app-version>
```

### Make changes to the client code

The purpose of this demo application is to showcase how to build a Node.js application in Node.js with gstore-node. The client (browser) javascript code has been reduced to the strict minimum for the purpose of the demo and "get the job done". All the source files for the client are in the `/src/client` folder.

## Meta

Sébastien Loix – [@sebloix](https://twitter.com/sebloix)

Distributed under the MIT license. See `LICENSE` for more information.

[https://github.com/sebelga](https://github.com/sebelga/)
