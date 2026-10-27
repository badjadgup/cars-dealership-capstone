# Deployment

These deployment configurations are provided for you to run after setting up accounts. They have not been executed in this workspace: Docker's Linux engine is not running, and no IBM Cloud project was supplied. Local Python/Node execution, React build, and Compose syntax were verified.

## IBM Cloud Code Engine

Code Engine can build an image from local source and deploy it. See the official [local source guide](https://cloud.ibm.com/docs/codeengine?topic=codeengine-app-local-source-code) and [CLI reference](https://cloud.ibm.com/docs/codeengine?topic=codeengine-cli) for prerequisites and current options. Building from local source requires IBM Cloud Container Registry access. Account resources can incur charges; provision them in your own account after reviewing the plan.

Use a managed MongoDB database for dealership/review data. Use managed PostgreSQL for durable Django users and sessions on Code Engine. A container's local SQLite file is ephemeral and can be lost when an instance is replaced; use SQLite locally or on a Kubernetes persistent volume instead.

1. Install the IBM Cloud CLI and Code Engine plugin from IBM. Log in and select your region, resource group, and Code Engine project:

```powershell
ibmcloud login
ibmcloud plugin install code-engine
ibmcloud target -r YOUR_REGION -g YOUR_RESOURCE_GROUP
ibmcloud ce project create --name cars-capstone
# If the project already exists: ibmcloud ce project select --name cars-capstone
```

2. In the Code Engine console, create these **generic secrets**, using the same SERVICE_API_KEY value in all three secrets:

| Secret       | Keys                                                                                                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cars-service | SERVICE_API_KEY: a new random private value                                                                                                                                               |
| cars-mongo   | MONGODB_URI: your managed MongoDB URI, SERVICE_API_KEY: same private value                                                                                                                |
| cars-web     | SECRET_KEY: a different long random private value, SERVICE_API_KEY: same service value, DB_ENGINE: postgresql, DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT: 5432, DB_SSLMODE: require |

Use credentials for databases accessible from the project. Keep secrets in Code Engine and out of Git. Database TLS and network access must match your database provider's settings.

3. From the project root, build and deploy the internal services. These commands use the checked-in Dockerfiles:

```powershell
ibmcloud ce app create --name cars-sentiment --build-source ./services/sentiment --port 5050 --visibility project --env APP_ENV=production --env-from-secret cars-service --min-scale 1
ibmcloud ce app create --name cars-dealers --build-source ./services/dealership --port 3030 --visibility project --env NODE_ENV=production --env-from-secret cars-mongo --min-scale 1
ibmcloud ce app get --name cars-sentiment
ibmcloud ce app get --name cars-dealers
```

Copy the **Cluster Local URL** from each output. Supporting services use `X-Service-Key` authentication in addition to project-only ingress. Their health endpoints are unauthenticated liveness endpoints.

4. Set the copied URLs in your terminal (replace the placeholders), then deploy the Django frontend. During this bootstrap only, ALLOWED_HOSTS is broad because the hostname is assigned by the platform. Narrow it immediately after obtaining the URL:

```powershell
$sentimentUrl = 'http://ACTUAL_CLUSTER_LOCAL_SENTIMENT_URL'
$dealersUrl = 'http://ACTUAL_CLUSTER_LOCAL_DEALERS_URL'
ibmcloud ce app create --name cars-web --build-source . --port 8000 --visibility public --env-from-secret cars-web --env DEBUG=false --env ALLOWED_HOSTS=* --env "SENTIMENT_URL=$sentimentUrl" --env "DEALERSHIP_URL=$dealersUrl" --min-scale 1 --max-scale 1
ibmcloud ce app get --name cars-web
```

Use the complete returned cluster URL, including its scheme, only once; don't prepend a second `http://`. Django's entrypoint applies migrations and seeds the car catalogue. Restrict to one replica for this initial capstone deployment to avoid concurrent migration startup. PostgreSQL makes user data persistent across revisions.

5. Copy the actual public HTTPS URL, then constrain the allowed host and trusted origin:

```powershell
$appUrl = 'https://YOUR_ACTUAL_PUBLIC_APP_HOST'
$appHost = ([uri]$appUrl).Host
ibmcloud ce app update --name cars-web --env "ALLOWED_HOSTS=$appHost" --env "CSRF_TRUSTED_ORIGINS=$appUrl"
$appUrl | Set-Content -Encoding utf8 evidence/deploymentURL
```

6. Open the public URL, register a regular user, confirm dealer data loads, and publish a review. Verify login and the review survive a new revision/restart before relying on the deployment for grading. If the backend reports a service outage, check service URLs, shared key values, database connectivity and Code Engine application logs.

Code Engine's public URL uses HTTPS; `DEBUG=false` enables secure session and CSRF cookies. The app trusts the platform's forwarded HTTPS header. Keep the backend service URLs and secrets consistent when updating revisions.

For later source changes use `ibmcloud ce app update --name APP_NAME --build-source PATH`. Recheck successful build/deployment state, then capture the four deployed screenshots listed in SUBMISSION_GUIDE.md.

## Kubernetes example

`deploy/kubernetes.yaml` is a local-cluster example. It defines MongoDB, Node, Flask, and Django with internal services and persistent volumes for MongoDB and SQLite. It deliberately uses local-development Django cookie settings so `kubectl port-forward` works over HTTP. For public hosting, configure HTTPS ingress, change DEBUG to false, and set explicit ALLOWED_HOSTS and CSRF_TRUSTED_ORIGINS.

Build/tag/push the three images to your own registry. Replace YOUR_REGISTRY in the manifest. Create a namespace and a secret using a private local environment file that contains unique SECRET_KEY and SERVICE_API_KEY values:

```powershell
kubectl create namespace cars-capstone
kubectl -n cars-capstone create secret generic cars-secrets --from-env-file=YOUR_PRIVATE_ENV_FILE
kubectl apply -f deploy/kubernetes.yaml
kubectl -n cars-capstone rollout status deployment/cars-web
kubectl -n cars-capstone port-forward service/cars-web 8080:80
```

Open http://localhost:8080. For local images in a development cluster, load them with your cluster's normal image-loading method and update image references. The cluster needs a default storage class. Keep Django at one replica with SQLite. The internal example MongoDB is not exposed externally; use an authenticated managed MongoDB service for a public installation.

Run `kubectl -n cars-capstone exec deployment/cars-web -- python manage.py createsuperuser` for an admin. Keep private environment files outside the repository. Kubernetes and Code Engine are two alternative deployment approaches; they do not both need to run for the app to work.
