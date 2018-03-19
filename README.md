# Google Datastore Blog Application
A Node.js demo application built with [`@google-cloud/datastore`](https://github.com/googleapis/nodejs-datastore) & [`gstore-node`](https://github.com/sebelga/gstore-node) running on Google App Engine.

## Getting started

### System tools

Make sure before starting that you have the necesary dependencies installed on your system.

* node (8 +) + npm
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
## This is where the pictures will be uploaded
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
* select you bucket.
* on the menu on the right select `Edit bucket permissions`.
* add the `allUsers` user
* set the role to `Storage Object Viewer`.

### Start the Application

```js
npm start
```

### Deploy the application
Before deploying the application you have to set your bucket id in the GCLOUD_BUCKET environment variable inside the `app.yaml` file.  

You can now run the following command

```sh
gcloud app deploy --project <your-project-id> --version <app-version> --verbosity=info
```

### Work with the client code
This demo application is mainly to show how to build an application in Node.js with gstore-node. The javascript of the client part has been reduced to the strict minimum for the purpose of the demo and "get the job done".
You can run a watcher for the client js files with the following command:

```js
npm run watch
```