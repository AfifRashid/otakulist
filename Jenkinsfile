properties([
  parameters([
  string(name: 'RELEASE_TAG', 
        defaultValue: "v1.0.${env.BUILD_NUMBER}", 
        description: 'Version for production')
  ])
])

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
        sh 'docker build --pull --no-cache -t otakulist-backend:ci ./backend'
        sh 'docker build --pull --no-cache -t otakulist-frontend:ci ./frontend'
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
    stage('Deploy (Staging)') {
      steps {
        sh 'docker compose down || true'
        sh 'docker compose up -d --build'

        // Test smoke checks
        sh 'curl -sSf http://localhost:3000/api/anime > /dev/null'  // backend
        sh 'curl -sSf http://localhost:5173 > /dev/null'            // frontend
      }
    }
    stage('Release (Production)') {
      steps {
        // Create & push Git tag so it shows on GitHub
        sh """
          git config user.email 'jenkins@ci'
          git config user.name 'Jenkins'
          git tag -a ${RELEASE_TAG} -m 'Release ${RELEASE_TAG}'
          git push origin ${RELEASE_TAG}
        """

        // Bring up production using docker-compose.prod.yml (FE: 8081, BE: 3001)
        sh '''
          echo "=== Bringing down old prod (if any) ==="
          docker compose -p otakulist-prod -f docker-compose.prod.yml down || true

          echo "=== Starting production ==="
          RELEASE_TAG=${RELEASE_TAG} docker compose -p otakulist-prod -f docker-compose.prod.yml up -d
        '''

        // Simple prod smoke checks
        sh 'curl -sSf http://localhost:3001/api/anime > /dev/null'
        sh 'curl -sSf http://localhost:8081 > /dev/null'
        echo "✅ Production is live. Tag: ${RELEASE_TAG}  FE: http://localhost:8081  BE: http://localhost:3001"
      }
    }
    stage('Monitoring') {
      steps {
        withCredentials([
          string(credentialsId: 'smtp_user', variable: 'SMTP_USER'),
          string(credentialsId: 'smtp_pass', variable: 'SMTP_PASS'),
          string(credentialsId: 'alert_to', variable: 'ALERT_TO'),
          string(credentialsId: 'smtp_from', variable: 'SMTP_FROM'),
          string(credentialsId: 'smtp_smarthost', variable: 'SMTP_SMARTHOST')
        ]) {
          sh '''
            # Render Alertmanager config from template using envsubst
            envsubst < monitoring/alertmanager.yml.template > monitoring/alertmanager.yml

            # Start monitoring stack
            docker compose -f docker-compose.monitoring.yml down || true
            docker compose -f docker-compose.monitoring.yml up -d

            # Quick check
            sleep 5
            curl -fsS http://localhost:9090/-/ready > /dev/null
          '''
        }
      }
    }
  }
}