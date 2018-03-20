# Google Datastore Blog Application
> A Node.js demo application built with [`@google-cloud/datastore`](https://github.com/googleapis/nodejs-datastore) & [`gstore-node`](https://github.com/sebelga/gstore-node) running on Google App Engine.

When building any client/server application we know that we can "_never trust the client_".  The server is the source of truth that should enforce the consistency rules.  

The Google Datastore is an amazing NoSQL database that lets us save in it anything we want very easily.  In some cases, that's just what we need and that's great. In some other cases, like in a blog application, we might want to make sure that our entities are consistent and verify the data sent from our users.

#### gstore-node

This is where [gstore-node](https://github.com/sebelga/gstore-node) comes into play. It lets you define **Schemas** for your entities that will validate the data coming from the client _before_ saving it into the Datastore. It has also other nice features like **middleware**, **virtual properties** or a **cache layer** to speed up the entities fetching.  

Hopefully this small application will demonstrate how much gstore-node can help you building complex applications on the Datastore.

#### Highlights

* Validate entity data (write a _comment_ to a post to see it in action)
* Middleware (deleting a post will delete its feature image + all its comments)
* Cache (you should see a faster load page the second time you access a post)
* Upload/delete image to the Google Storage


## Getting started

### System tools

Make sure before starting that you have the necesary dependencies installed on your system.

* node (8 +) & npm
* Google SDK (you can [download it here](https://cloud.google.com/sdk/downloads)) with the `gcloud` cli on your $PATH

Once you have installed the Google SDK, make sure you are **authenticated**. In your terminal run

```sh
gcloud auth application-default login
```

A window browser should open, allowing you to authenticate the Google Cloud SDK.

### Google Cloud project

Before starting, create a projet in the Google Cloud Platform to deploy the application.  
[Go to App Engine](https://console.cloud.google.com/projectselector/appengine/create) and create a new project if you don't have one.

You then have to make sure to:

1. Enable billing for the project  
[Enable billing](https://cloud.google.com/billing/docs/how-to/modify-project?visit_id=1-636516267130301291-4124238769&rd=1#enable-billing)

2. Enable the Google Cloud Datastore API  
[Enable the API](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com)

<!-- 3. [Set up authentication](https://cloud.google.com/docs/authentication/getting-started) with a service account so you can access the API from your local workstation.

From the command line it is a 3 step process: -->

<!-- ```sh

# 1. Create service account
# <NAME> could be for example "devs"
gcloud iam service-accounts create <NAME>

# 2. Add permission to it
gcloud projects add-iam-policy-binding <YOUR-PROJECT-ID> --member "serviceAccount:<NAME>@<YOUR-PROJECT-ID>.iam.gserviceaccount.com" --role "roles/editor"

# 3. Generate key
gcloud iam service-accounts keys create service-account.json --iam-account <NAM>@<YOUR-PROJECT-ID>.iam.gserviceaccount.com
``` -->

<!-- You can check the service account key generated for your project [here](https://console.cloud.google.com/projectselector/iam-admin/serviceaccounts). -->

### NPM dependencies

Install the application dependencies with

```js
npm install
```

### Environment variables (.env file)

The application needs a few environment variables to be defined. Create a file at the _root_ of the "./server" folder and name it ".env". Add the following variable and change any values. This file **sould not** be added to source control. It is only used during development.

```txt
# -------------------
# Server
# -------------------
## Server port (optional. Default 8080)
PORT=3000

# -------------------
# Google Cloud
# -------------------
# -- Google Cloud project
GOOGLE_CLOUD_PROJECT=<your-project-id>

## -- Datastore namespace for the entities
## Namespace for the Datastore entities (optional)
## During development you might want to use "dev" namespace for ex.
DATASTORE_NAMESPACE=<optional-namespace>

## Local Datastore Emulator Host (optional)
## You can develop against the emulator by uncommenting this line
# DATASTORE_EMULATOR_HOST=localhost:8081

# -- Google Storage
## This is where the images will be uploaded
## Make sure you made it public for allUsers (see below)
GCLOUD_BUCKET=<google-bucket-id>

# -------------------
# Misc
# -------------------
# -- Logger
## Enable Logger (optional. Default: "true")
# LOGGER_ENABLED=true

## Logger level (optional. Default: "info")
## Allowed values: 'error', 'warn', 'info', 'verbose', 'debug', 'silly'
# LOGGER_LEVEL=info
```


### Update the Datastore indexes

Before being able to navigate the app and execute the queries, you need first to **update the Datastore indexes** with the command below. For more information about indexes, [read the documentation](https://cloud.google.com/appengine/docs/flexible/nodejs/configuring-datastore-indexes-with-index-yaml).

```sh
gcloud datastore create-indexes --project=<YOUR-PROJECT-ID> ./index.yaml
```

### Google Cloud Storage
You need to make the content of your bucket **public** so the images you upload are accesible in the browser.  

The easiest way to do it is to:
* go to [Google Storage](https://console.cloud.google.com/storage/) and select your bucket
* on the menu on the right select `Edit bucket permissions`
* add the `allUsers` user
* set the role to `Storage Object Viewer`

### Start the Application

```js
npm start
```

### Deploy the application
Before deploying the application you have to set your bucket id in the `GCLOUD_BUCKET` environment variable inside the `app.yaml` file.  

You can now run the following command

```sh
# This command will execute the "prebuild" npm script to make sure the latest client
# Javascript and Sass code is bundled in our /server/public folder
GOOGLE_CLOUD_PROJECT=<your-project-id> GOOGLE_APP_VERSION=<your-app-version> npm run deploy

# If you didn't make any modification to the client code then you can just run this
gcloud app deploy --project <your-project-id> --version <app-version> --verbosity=info
```

### Work with the client code
This demo application is mainly to showcase how to build an application in Node.js with gstore-node. The javascript of the client part has been reduced to the strict minimum for the purpose of the demo and to "get the job done".
If you want to make some modifications you can run a watcher for the client Javascript and Sass files with the following command:

```js
npm run watch
```

This will bundle the .js and .css file, save them in the public/dist folder of the server and update their path in the /server/views/layout.pug template.
