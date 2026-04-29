pipeline {
    agent any
    tools {
        nodejs 'node16'
        jdk 'jdk17'
    }

    environment {
        SCANNER_HOME       = tool 'sonar-scanner'
        DOCKER_HUB_USER    = 'nitishnatikar360'
        IMAGE_NAME         = 'nkfilms'
        IMAGE_TAG          = "${BUILD_NUMBER}"
        FULL_IMAGE         = "${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
        LATEST_IMAGE       = "${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"
        DOCKER_CREDENTIALS = 'dock-id'
        TMDB_API_KEY       = credentials('tmbd-api-key')
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                echo 'Pulling source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh """
                        ${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectName=Nkfilms \
                        -Dsonar.projectKey=Nitishkumar7795_Nkfilms \
                        -Dsonar.organization=nitishkumar7795 \
                        -Dsonar.host.url=https://sonarcloud.io \
                        -Dsonar.sources=src \
                        -Dsonar.language=js \
                        -Dsonar.sourceEncoding=UTF-8
                    """
                }
            }
        }

        stage('Run Tests') {
            steps {
                sh 'CI=true npm test -- --passWithNoTests'
            }
        }

        stage('Build React App') {
            steps {
                sh "REACT_APP_TMDB_KEY=${TMDB_API_KEY} npm run build"
            }
        }

        stage('Trivy FS Scan') {
            steps {
                sh 'trivy fs . --severity HIGH,CRITICAL --format table --output trivyfs-report.txt --exit-code 0'
                archiveArtifacts artifacts: 'trivyfs-report.txt', fingerprint: true
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${FULL_IMAGE} -t ${LATEST_IMAGE} ."
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh "trivy image --severity HIGH,CRITICAL --format table --output trivyimage-report.txt --exit-code 0 ${FULL_IMAGE}"
                archiveArtifacts artifacts: 'trivyimage-report.txt', fingerprint: true
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin
                        docker push ${FULL_IMAGE}
                        docker push ${LATEST_IMAGE}
                        docker logout
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([string(credentialsId: 'kube-id', variable: 'K8S_TOKEN')]) {
                    sh '''
                        kubectl config set-cluster k8s --server=https://10.0.3.77:6443 --insecure-skip-tls-verify=true
                        kubectl config set-credentials jenkins --token=$K8S_TOKEN
                        kubectl config set-context k8s --cluster=k8s --user=jenkins --namespace=nk
                        kubectl config use-context k8s

                        kubectl apply -f k8s/secret.yaml -n nk
                        kubectl apply -f k8s/deployment.yaml -n nk
                        kubectl apply -f k8s/service.yaml -n nk
                        kubectl apply -f k8s/hpa.yaml -n nk

                        kubectl rollout status deployment/nkfilms-deployment -n nk --timeout=120s
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                withCredentials([string(credentialsId: 'kube-id', variable: 'K8S_TOKEN')]) {
                    sh '''
                        kubectl config set-cluster k8s --server=https://10.0.3.77:6443 --insecure-skip-tls-verify=true
                        kubectl config set-credentials jenkins --token=$K8S_TOKEN
                        kubectl config set-context k8s --cluster=k8s --user=jenkins --namespace=nk
                        kubectl config use-context k8s
                        echo "=== Pods ==="
                        kubectl get pods -l app=nkfilms -n nk
                        echo "=== Service ==="
                        kubectl get service nkfilms-service -n nk
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "DEPLOYMENT SUCCESSFUL! Build: #${BUILD_NUMBER}"
        }
        failure {
            echo 'Pipeline failed! Rolling back...'
            script {
                withCredentials([string(credentialsId: 'kube-id', variable: 'K8S_TOKEN')]) {
                    sh '''
                        kubectl config set-cluster k8s --server=https://10.0.3.77:6443 --insecure-skip-tls-verify=true
                        kubectl config set-credentials jenkins --token=$K8S_TOKEN
                        kubectl config set-context k8s --cluster=k8s --user=jenkins --namespace=nk
                        kubectl config use-context k8s
                        kubectl rollout undo deployment/nkfilms-deployment -n nk || true
                    '''
                }
            }
        }
        always {
            sh "docker rmi ${FULL_IMAGE} ${LATEST_IMAGE} || true"
            sh 'docker system prune -f || true'
        }
    }
}
