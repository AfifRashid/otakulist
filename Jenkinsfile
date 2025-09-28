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
          sh 'npm ci'
          sh 'npm test'
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'backend/junit-report.xml'
        }
      }
    }
    stage('CodeQuality') {
      environment {
        SONAR_SCANNER_OPTS = '-Xmx1024m'
      }
      steps {
        sh '''
          docker run --rm -e SONAR_HOST_URL=${SONAR_HOST_URL} -e SONAR_LOGIN=${SONAR_TOKEN}             -v "$PWD:/usr/src" sonarsource/sonar-scanner-cli             -Dsonar.projectBaseDir=/usr/src -Dsonar.projectKey=otakulist -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info             -Dsonar.sources=backend,frontend -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/build/**
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
