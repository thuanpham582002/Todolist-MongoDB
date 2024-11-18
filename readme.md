# MongoDB Deployment on Kubernetes

This repository contains the configuration files for deploying MongoDB with High Availability (HA) on a Kubernetes cluster. It includes Persistent Volumes, Persistent Volume Claims, StatefulSets, and services for MongoDB.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Steps](#deployment-steps)
- [Configuration Files](#configuration-files)
- [Accessing MongoDB](#accessing-mongodb)
- [Backup and Restore](#backup-and-restore)
- [Scaling](#scaling)
- [Monitoring](#monitoring)
- [License](#license)

## Prerequisites

- A running Kubernetes cluster (Minikube, GKE, EKS, AKS, etc.)
- `kubectl` command-line tool installed and configured
- Helm (optional, if using Helm charts)

## Deployment Steps

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Create Persistent Volume and Claim**

   Create a file named `mongodb-pv-pvc.yaml` with the following content:

   ```yaml
   apiVersion: v1
   kind: PersistentVolume
   metadata:
     name: mongodb-pv
   spec:
     capacity:
       storage: 5Gi
     accessModes:
       - ReadWriteOnce
     hostPath:
       path: /data/mongodb
   ---
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: mongodb-pvc
   spec:
     storageClassName: ""
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 5Gi
   ```

   Apply the configuration:

   ```bash
   kubectl apply -f mongodb-pv-pvc.yaml
   ```

3. **Create MongoDB Service**

   Create a file named `mongodb-service.yaml` with the following content:

   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: mongodb-service
   spec:
     clusterIP: None
     selector:
       app: mongodb
     ports:
       - port: 27017
   ```

   Apply the configuration:

   ```bash
   kubectl apply -f mongodb-service.yaml
   ```

4. **Create MongoDB StatefulSet**

   Create a file named `mongodb-statefulset.yaml` with the following content:

   ```yaml
   apiVersion: apps/v1
   kind: StatefulSet
   metadata:
     name: mongodb
   spec:
     serviceName: "mongodb-service"
     replicas: 3
     selector:
       matchLabels:
         app: mongodb
     template:
       metadata:
         labels:
           app: mongodb
       spec:
         containers:
         - name: mongodb
           image: mongo:latest
           command:
           - mongod
           - "--replSet"
           - rs0
           - "--bind_ip_all"
           ports:
           - containerPort: 27017
           volumeMounts:
           - name: mongodb-storage
             mountPath: /data/db
         volumeClaimTemplates:
         - metadata:
             name: mongodb-storage
           spec:
             accessModes: ["ReadWriteOnce"]
             resources:
               requests:
                 storage: 5Gi
   ```

   Apply the configuration:

   ```bash
   kubectl apply -f mongodb-statefulset.yaml
   ```

5. **Initialize ReplicaSet**

   Connect to the primary node and initialize the replica set:

   ```bash
   kubectl exec -it mongodb-0 -- mongosh
   ```

   Run the following command in the MongoDB shell:

   ```javascript
   rs.initiate({
     _id: "rs0",
     members: [
       { _id: 0, host: "mongodb-0.mongodb-service:27017", priority: 2 },
       { _id: 1, host: "mongodb-1.mongodb-service:27017", priority: 1 },
       { _id: 2, host: "mongodb-2.mongodb-service:27017", priority: 1 }
     ]
   });
   ```

## Configuration Files

- `mongodb-pv-pvc.yaml`: Defines the Persistent Volume and Persistent Volume Claim.
- `mongodb-service.yaml`: Defines the headless service for MongoDB.
- `mongodb-statefulset.yaml`: Defines the StatefulSet for MongoDB.

## Accessing MongoDB

You can access MongoDB using the service name:
```bash
kubectl exec -it mongodb-0 -- mongosh
```

## Backup and Restore

To implement backup and restore strategies, consider using `mongodump` and `mongorestore` commands. You can create a CronJob for automated backups.

## Scaling

```bash
kubectl autoscale statefulset mongodb --min=3 --max=10 --cpu-percent=50
```

To scale the MongoDB deployment, you can modify the `replicas` field in the `mongodb-statefulset.yaml` file and reapply the configuration.

## Monitoring

Consider integrating monitoring tools like Prometheus and Grafana to monitor the health and performance of your MongoDB deployment.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

