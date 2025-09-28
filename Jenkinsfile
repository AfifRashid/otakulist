
pipeline {
  agent any
  environment {
    COMPOSE_DOCKER_CLI_BUILD = '1'
    DOCKER_BUILDKIT = '1'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Build') {
      steps {
        sh 'docker build -t otakulist-backend:ci ./backend'
        sh 'docker build -t otakulist-frontend:ci ./frontend'
      }
    }
    stage('Test') {
      steps {
        dir('backend') {
          sh 'npm install'
          sh 'npm test'
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'backend/junit.xml'
        }
      }
    }
    stage('CodeQuality') {
      environment {
        SONAR_HOST_URL = 'https://sonarcloud.io'
      }
      steps {
        withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
          sh '''
            docker run --rm \
              -e SONAR_HOST_URL=${SONAR_HOST_URL} \
              -e SONAR_TOKEN=${SONAR_TOKEN} \
              -v "$PWD:/usr/src" \
              sonarsource/sonar-scanner-cli \
              -Dsonar.projectBaseDir=/usr/src
          '''
        }
      }
    }
    stage('Security') {
      steps {
        sh '''
          echo "=== Scanning backend dependencies ==="
          docker run --rm \
            -v "$PWD/backend:/app" \
            aquasec/trivy fs /app
        '''
    
        sh '''
          echo "=== Scanning frontend dependencies ==="
          docker run --rm \
            -v "$PWD/frontend:/app" \
            aquasec/trivy fs /app
        '''
    
        sh '''
          echo "=== Scanning Docker images ==="
          docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            aquasec/trivy image otakulist-backend:ci || true
          docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            aquasec/trivy image otakulist-frontend:ci || true
        '''
      }
    }
    stage('Deploy') {
      steps {
        sh 'docker compose down || true'
        sh 'docker compose up -d --build'
      }
    }
  }
}
