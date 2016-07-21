# gstore-node Application demo
Blog application in Node.js running on Google Flexible Environment

## Getting started

### System tools

Make sure before starting that you have the necesary dependencies installed on your machine

* node (6 +) + npm
* Google SDK (you can [download it here](https://cloud.google.com/sdk/downloads)) with the gcloud command on your $PATH

Once you have installed the Google SDK, make sure you are **authenticated**. In your terminal run

```sh
gcloud auth login
```

A window browser should open, allowing you to authenticate the Google Cloud SDK.

### Google Cloud project

You need to have a project in the Google Cloud Platform to deploy the application.  
[Go to App Engine](https://console.cloud.google.com/projectselector/appengine/create) and create a new project and if you don't have one.

Once you have a project, we are going to tell glcoud to use it with the following command

```sh
gcloud config set project <YOUR-PROJECT-ID>
```

You then have to make sure to:

1. Enable billing for the project  
[Enable billing](https://cloud.google.com/billing/docs/how-to/modify-project?visit_id=1-636516267130301291-4124238769&rd=1#enable-billing)

2. Enable the Google Cloud Datastore API  
[Enable the API](https://console.cloud.google.com/flows/enableapi?apiid=datastore.googleapis.com)

3. [Set up authentication](https://cloud.google.com/docs/authentication/getting-started) with a service account so you can access the API from your local workstation.

From the command line it is a 3 step process:

```sh

# 1. Create service account
# <NAME> could be for example "devs"
gcloud iam service-accounts create <NAME>

# 2. Add permission to it
gcloud projects add-iam-policy-binding <YOUR-PROJECT-ID> --member "serviceAccount:<NAME>@<YOUR-PROJECT-ID>.iam.gserviceaccount.com" --role "roles/editor"

# 3. Generate key
gcloud iam service-accounts keys create service-account.json --iam-account <NAM>@<YOUR-PROJECT-ID>.iam.gserviceaccount.com
```

You can check the service account key generated for your project [here](https://console.cloud.google.com/projectselector/iam-admin/serviceaccounts).

### npm dependencies

Install the application dependencies with

```js
npm i
// or
yarn
```

### Before you begin
Follow the 4 steps 

### environment variables (.env file)

The application needs a few environment variables to be set. Create a file in the "/server" folder and name it ".env" with the following content

```txt
# Node environment
NODE_ENV=development

# Server
# ---------
# Port to run the server on
PORT=3000

# Ip of the server
SERVER_IP=127.0.0.1

# Host
SERVER_HOST=localhost

# Google
# ---------
# Datastore namespace for the entities
DATASTORE_NAMESPACE=default

# Google Storage bucket
GCLOUD_BUCKET=<your-bucket-id>

# Authentication
KEYFILENAME=<absolute/path/to/service-account.json>
# On Windows you will need to escape the path
# KEYFILENAME=c:\\path\\escaped\\pointing-to\\service-account.json

# Misc
# ---------
# value must be one of 'error', 'warn', 'info', 'verbose', 'debug', 'silly'
LOGGER_LEVEL=info
LOGGER_ENABLED=true
```
