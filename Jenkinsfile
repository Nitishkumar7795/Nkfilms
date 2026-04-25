pipeline {
    agent any

    environment {
        // Docker Hub config
        DOCKER_HUB_USER    = 'nitishnatikar360'
        IMAGE_NAME         = 'nkfilms'
        IMAGE_TAG          = "${BUILD_NUMBER}"
        FULL_IMAGE         = "${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
        LATEST_IMAGE       = "${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"

        // Jenkins Credential IDs
        DOCKER_CREDENTIALS = 'dockerhub-credentials'
        TMDB_API_KEY       = credentials('tmdb-api-key')

        // SonarQube — must match name in Jenkins → Tools
        SCANNER_HOME       = tool 'sonar-scanner'
    }

    stages {
        // ── Stage 1: Checkout ──────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '📥 Pulling source code from Git...'
                checkout scm
            }
        }

        // ── Stage 2: Install Dependencies ─────────────────────────────
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing npm packages...'
                sh 'npm ci'
            }
        }

        // ── Stage 3: SonarQube Analysis ───────────────────────────────
        stage('SonarQube Analysis') {
            steps {
                echo '🔍 Running SonarQube analysis...'
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

        // ── Stage 4: Quality Gate ──────────────────────────────────────
        stage('Quality Gate') {
            steps {
                echo '🚦 Waiting for SonarQube Quality Gate...'
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                }
            }
        }

        // ── Stage 5: Run Tests ─────────────────────────────────────────
        stage('Run Tests') {
            steps {
                echo '🧪 Running tests...'
                sh 'CI=true npm test -- --passWithNoTests'
            }
        }

        // ── Stage 6: Build React App ───────────────────────────────────
        stage('Build React App') {
            steps {
                echo '🏗️ Building React production bundle...'
                sh """
                    REACT_APP_TMDB_KEY=${TMDB_API_KEY} npm run build
                """
            }
        }

        // ── Stage 7: Trivy Filesystem Scan ────────────────────────────
        // Scans source code & dependencies for vulnerabilities BEFORE building image
        stage('Trivy FS Scan') {
            steps {
                echo '🛡️ Scanning filesystem with Trivy...'
                sh '''
                    trivy fs . \
                        --severity HIGH,CRITICAL \
                        --format table \
                        --output trivyfs-report.txt \
                        --exit-code 0
                '''
                // Archive report so it's visible in Jenkins build artifacts
                archiveArtifacts artifacts: 'trivyfs-report.txt', fingerprint: true
            }
        }

        // ── Stage 8: Build Docker Image ────────────────────────────────
        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                sh """
                    docker build \
                        -t ${FULL_IMAGE} \
                        -t ${LATEST_IMAGE} \
                        .
                """
            }
        }

        // ── Stage 9: Trivy Image Scan ──────────────────────────────────
        // Scans the Docker image for OS & library vulnerabilities AFTER build
        stage('Trivy Image Scan') {
            steps {
                echo '🔬 Scanning Docker image with Trivy...'
                sh """
                    trivy image \
                        --severity HIGH,CRITICAL \
                        --format table \
                        --output trivyimage-report.txt \
                        --exit-code 0 \
                        ${FULL_IMAGE}
                """
                // Archive image scan report
                archiveArtifacts artifacts: 'trivyimage-report.txt', fingerprint: true
            }
        }

        // ── Stage 10: Push to Docker Hub ───────────────────────────────
        stage('Push to Docker Hub') {
            steps {
                echo '🚀 Pushing image to Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_CREDENTIALS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${FULL_IMAGE}
                        docker push ${LATEST_IMAGE}
                        docker logout
                    """
                }
            }
        }

        // ── Stage 11: Deploy to Kubernetes ─────────────────────────────
        stage('Deploy to Kubernetes') {
            steps {
                echo '☸️ Deploying to Kubernetes...'
                sh """
                    # Apply secret first
                    kubectl apply -f k8s/secret.yaml

                    # Update deployment with new image tag
                    kubectl set image deployment/nkfilms-deployment \
                        nkfilms=${FULL_IMAGE} || true

                    # Apply all k8s manifests
                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/service.yaml
                    kubectl apply -f k8s/hpa.yaml

                    # Wait for rollout to finish
                    kubectl rollout status deployment/nkfilms-deployment --timeout=120s
                """
            }
        }

        // ── Stage 12: Verify Deployment ────────────────────────────────
        stage('Verify Deployment') {
            steps {
                echo '✅ Verifying deployment...'
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

    // ── Post Actions ───────────────────────────────────────────────────
    post {
        success {
            echo """
            ✅ ================================
               DEPLOYMENT SUCCESSFUL! 🎉
               Image : ${FULL_IMAGE}
               Build : #${BUILD_NUMBER}
            ==================================
            """
        }
        failure {
            echo '❌ Pipeline failed! Rolling back Kubernetes deployment...'
            sh 'kubectl rollout undo deployment/nkfilms-deployment || true'
        }
        always {
            echo '🧹 Cleaning up local Docker images...'
            sh """
                docker rmi ${FULL_IMAGE} || true
                docker rmi ${LATEST_IMAGE} || true
                docker system prune -f || true
            """
        }
    }
}
