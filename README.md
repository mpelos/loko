# Loko

Under development tool for deploying serverless services.

## Example

```yaml
version: "0.1"

engine:
  name: cloud-build
  options:
    project: my-gcp-project
    timeout: 900s # Cloud build timeout

services:
  some-cloudrun-service:
    build:
      repository: https://somegit.com/somerepo/somerepo.git
      branch: master
    image: some-cloudrun-service:latest
    deploy:
      type: google-cloud-run
      name: some-cloudrun-service
      options:
        memory: 256Mi
        region: us-central1
        vpc_connector: default-connector
      environment:
        NODE_ENV: production
      env_files:
        - ./env_file/path

  some-cloud-functions-http-service:
    build:
      repository: https://somegit.com/somerepo/somerepo.git
      branch: master
    image: some-cloud-functions-http-service:latest
    deploy:
      type: google-cloud-functions
      name: some-cloudrun-service
      app_container_dir: /opt/app
      options:
        entrypoint: index
        memory: 256MB
        region: us-central1
        runtime: nodejs10
        timeout: 300
        trigger: http
        vpc_connector: default-connector
      environment:
        NODE_ENV: production

  some-cloud-functions-topic-service:
    build:
      repository: https://somegit.com/somerepo/somerepo.git
      branch: master
    image: some-cloud-functions-http-service:latest
    deploy:
      type: google-cloud-functions
      name: some-cloudrun-service
      app_container_dir: /opt/app
      options:
        entrypoint: index
        memory: 256MB
        region: us-central1
        runtime: nodejs10
        timeout: 300
        trigger: topic
        trigger_topic: pubsub-topic-name
        vpc_connector: default-connector
      environment:
        NODE_ENV: production

  some-firebase-hosting-app:
    build:
      repository: https://somegit.com/somerepo/somerepo.git
      branch: master
      args:
        ENV: production
    image:
    deploy:
      type: firebase-hosting
      app_container_dir: /opt/app
```
