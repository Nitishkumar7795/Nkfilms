# 🎬 NKFILMS - Movie Streaming App

A Netflix-inspired movie streaming web application built with React.js, deployed using a full CI/CD pipeline on Kubernetes.

![App Screenshot](https://img.shields.io/badge/Status-Live-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestrated-blue)
![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-red)

---

## 🌐 Live App

```
http://52.66.204.117:30805
```

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [CI/CD Pipeline](#cicd-pipeline)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Author](#author)

---

## 📖 About the Project

NKFILMS is a full-stack DevOps project that demonstrates end-to-end CI/CD pipeline implementation. The app fetches real-time movie and series data from the **TMDB API** and displays it in a Netflix-style UI.

**Features:**
- 🎥 Trending movies and TV series
- 🔍 Search functionality
- 📱 Responsive design
- 🔄 Auto-scaling with Kubernetes HPA
- 🛡️ Security scanning with Trivy
- 📊 Code quality analysis with SonarCloud

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React.js |
| API | TMDB API |
| Containerization | Docker + Nginx |
| Orchestration | Kubernetes (v1.30.14) |
| CI/CD | Jenkins |
| Code Quality | SonarCloud |
| Security Scan | Trivy |
| Source Control | GitHub |
| Cloud | AWS EC2 (ap-south-1) |

---

## 🏗️ Architecture

```
Developer → GitHub → Jenkins Pipeline
                          ↓
                    SonarCloud Analysis
                          ↓
                    Run Tests
                          ↓
                    Build React App
                          ↓
                    Trivy FS Scan
                          ↓
                    Build Docker Image
                          ↓
                    Trivy Image Scan
                          ↓
                    Push to Docker Hub
                          ↓
                    Deploy to Kubernetes
                          ↓
                    3 Pods Running on AWS EC2
```

---

## 🔄 CI/CD Pipeline

The Jenkins pipeline consists of the following stages:

| Stage | Description |
|-------|-------------|
| Clean Workspace | Cleans Jenkins workspace |
| Checkout | Pulls latest code from GitHub |
| Install Dependencies | Runs `npm install` |
| SonarQube Analysis | Scans code quality via SonarCloud |
| Run Tests | Runs React test suite |
| Build React App | Builds production React bundle |
| Trivy FS Scan | Scans filesystem for vulnerabilities |
| Build Docker Image | Builds Docker image with Nginx |
| Trivy Image Scan | Scans Docker image for vulnerabilities |
| Push to Docker Hub | Pushes image to `nitishnatikar360/nkfilms` |
| Deploy to Kubernetes | Applies k8s manifests to cluster |
| Verify Deployment | Checks pods and service status |

---

## ✅ Prerequisites

- AWS EC2 instances (Jenkins, SonarQube, Kubernetes cluster)
- Docker Hub account
- GitHub account
- TMDB API key
- SonarCloud account

---

## 🖥️ Infrastructure

| Server | Instance Type | Purpose |
|--------|--------------|---------|
| Jenkins M | t3.medium | Jenkins CI/CD server |
| Kubemaster | t2.medium | Kubernetes control plane |
| Kubew1 | t2.medium | Kubernetes worker node 1 |
| Kubew2 | t2.medium | Kubernetes worker node 2 |
| SonarQube | t2.xlarge | Code quality server |

---

## 📁 Project Structure

```
nkfilms/
├── src/                    # React source code
│   ├── App.js
│   ├── App.css
│   └── index.js
├── public/                 # Static assets
├── k8s/                    # Kubernetes manifests
│   ├── deployment.yaml     # Deployment config (3 replicas)
│   ├── service.yaml        # LoadBalancer service
│   ├── hpa.yaml            # Horizontal Pod Autoscaler
│   └── secret.yaml         # TMDB API key secret
├── Dockerfile              # Multi-stage Docker build
├── nginx.conf              # Nginx configuration
├── Jenkinsfile             # CI/CD pipeline definition
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Nitishkumar7795/Nkfilms.git
cd Nkfilms
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set environment variables
```bash
export REACT_APP_TMDB_KEY=your_tmdb_api_key
```

### 4. Run locally
```bash
npm start
```

---

## 🐳 Docker

### Build image
```bash
docker build -t nitishnatikar360/nkfilms:latest .
```

### Run container
```bash
docker run -p 80:80 nitishnatikar360/nkfilms:latest
```

---

## ☸️ Kubernetes Deployment

### Create namespace
```bash
kubectl create namespace nk
```

### Apply manifests
```bash
kubectl apply -f k8s/secret.yaml -n nk
kubectl apply -f k8s/deployment.yaml -n nk
kubectl apply -f k8s/service.yaml -n nk
kubectl apply -f k8s/hpa.yaml -n nk
```

### Check deployment status
```bash
kubectl get pods -n nk
kubectl get svc -n nk
kubectl get hpa -n nk
```

### HPA Configuration
- Minimum replicas: **2**
- Maximum replicas: **10**
- CPU threshold: **70%**

---

## 🔐 Jenkins Credentials Required

| Credential ID | Type | Description |
|--------------|------|-------------|
| dock-id | Username/Password | Docker Hub credentials |
| kube-id | Secret Text | Kubernetes service account token |
| tmbd-api-key | Secret Text | TMDB API key |
| sonar-token | Secret Text | SonarCloud token |

---

## 👨‍💻 Author

**Nitish Kumar**
- GitHub: [@Nitishkumar7795](https://github.com/Nitishkumar7795)
- Docker Hub: [nitishnatikar360](https://hub.docker.com/u/nitishnatikar360)
- SonarCloud: [nitishkumar7795](https://sonarcloud.io/organizations/nitishkumar7795)

---

## 📄 License

This project uses the TMDB API but is not endorsed or certified by TMDB.

---

⭐ If you found this project helpful, please give it a star!
