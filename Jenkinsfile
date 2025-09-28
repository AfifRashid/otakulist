
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
        withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_LOGIN')]) {
          sh '''
            docker run --rm \
              -e SONAR_HOST_URL=${SONAR_HOST_URL} \
              -e SONAR_LOGIN=${SONAR_LOGIN} \
              -v "$PWD:/usr/src" \
              sonarsource/sonar-scanner-cli
          '''
        }
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

