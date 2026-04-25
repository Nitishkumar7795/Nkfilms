pipeline {
    agent any

    environment {
        // Docker Hub config
        DOCKER_HUB_USER    = 'nitishnatikar360'
        IMAGE_NAME         = 'nkfilms'
        IMAGE_TAG          = "${BUILD_NUMBER}"
        FULL_IMAGE         = "${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
        LATEST_IMAGE       = "${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"

        // Jenkins Credential IDs (Updated to match your screenshots)
        DOCKER_CREDENTIALS = 'dockerhub-credentails' // Matches your screenshot spelling
        K8S_CREDENTIAL_ID  = 'k8s-config'           // Matches your screenshot ID
        TMDB_API_KEY       = credentials('tmdb-api-key')

        // SonarQube — must match name in Jenkins → Tools
        SCANNER_HOME       = tool 'sonar-scanner'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Pulling source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh """
                        ${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectName=nkfilms \
                        -Dsonar.projectKey=nkfilms \
                        -Dsonar.sources=src \
                        -Dsonar.language=js \
                        -Dsonar.sourceEncoding=UTF-8
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                // Matches your screenshot ID 'sonar-token'
                waitForQualityGate abortPipeline: false, credentialsId: 'sonar-token'
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
                echo '☸️ Deploying to Kubernetes...'
                // Using the k8s-config credential from your screenshot
                withKubeConfig([credentialsId: "${K8S_CREDENTIAL_ID}"]) {
                    sh """
                        # Apply secret first
                        kubectl apply -f k8s/secret.yaml

                        # Update deployment with new image tag
                        kubectl set image deployment/nkfilms-deployment nkfilms=${FULL_IMAGE} || true

                        # Apply all k8s manifests
                        kubectl apply -f k8s/deployment.yaml
                        kubectl apply -f k8s/service.yaml
                        kubectl apply -f k8s/hpa.yaml

                        # Wait for rollout to finish
                        kubectl rollout status deployment/nkfilms-deployment --timeout=120s
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                withKubeConfig([credentialsId: "${K8S_CREDENTIAL_ID}"]) {
                    sh '''
                        echo "=== Pods ==="
                        kubectl get pods -l app=nkfilms
                        echo "=== Service ==="
                        kubectl get service nkfilms-service
                        echo "=== HPA ==="
                        kubectl get hpa nkfilms-hpa
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ DEPLOYMENT SUCCESSFUL! Build: #${BUILD_NUMBER}"
        }
        failure {
            echo '❌ Pipeline failed! Rolling back...'
            withKubeConfig([credentialsId: "${K8S_CREDENTIAL_ID}"]) {
                sh 'kubectl rollout undo deployment/nkfilms-deployment || true'
            }
        }
        always {
            sh "docker rmi ${FULL_IMAGE} ${LATEST_IMAGE} || true"
            sh 'docker system prune -f || true'
        }
    }
}