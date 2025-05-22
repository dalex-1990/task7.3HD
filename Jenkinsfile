pipeline {
    agent any
    environment {
        NODE_ENV = 'production'
        API_KEY = credentials('SONAR_TOKEN') // from Jenkins credentials store
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/dalex-1990/task7.3HD.git'
            }
        }
        
        stage('Security Check') {
            steps {
                script {
                    sh 'npm install --package-lock-only' // make sure lock file is fresh
                    // Run npm audit
                    sh '''
                        echo "Running npm audit for vulnerability scanning..."
                        npm audit --audit-level=high || echo "Security vulnerabilities found!"
                    '''
                }
            }
        }

        stage('Install New Relic Agent') {
            steps {
                sh 'npm install newrelic --save'
            }
        }
        
        stage('Build and Test') {
            steps {
                script {
                    sh 'npm install --save-dev jest supertest'
                    // Build the Docker image
                    sh 'docker build -t blog-api .'
                    
                    // Run tests inside the container
                    sh 'docker run --rm blog-api npm test'
                }
            }
        }
        stage('SonarCloud Analysis') {
            steps {
                 withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    sh '''
                        # Run SonarScanner in a Docker container
                        docker run --rm \
                          -e SONAR_HOST_URL="https://sonarcloud.io" \
                          -e SONAR_TOKEN="${SONAR_TOKEN}" \
                          -e SONAR_SCANNER_OPTS="-Dsonar.projectKey=dalex-1990_task7.3HD -Dsonar.organization=dalex-1990" \
                          -v "$(pwd):/usr/src" \
                          sonarsource/sonar-scanner-cli:latest
                    '''
                }
            }
        }
      
        stage('Run Application') {
            steps {
                script {
                    // Clean up any existing containers
                    sh 'docker stop blog-api || true'
                    sh 'docker rm blog-api || true'
                    sh 'docker stop mongodb || true'
                    sh 'docker rm mongodb || true'
                    sh 'docker network rm blog-network || true'
                    // Create network if it doesn't exist
                    sh 'docker network create blog-network || true'
                    
                    // Start MongoDB container
                    sh 'docker run -d --name mongodb --network blog-network mongo:latest'
                    sh 'sleep 5'  // Give MongoDB a moment to initialize
                    
                    // Run the application container with MongoDB connection using npm start
                    sh '''
                    docker run -d --name blog-api \
                      -p 5001:5000 \
                      -e MONGO_URI=mongodb://mongodb:27017/blog-api \
                      -e JWT_SECRET=jenkins_secret_key \
                      --network blog-network \
                      blog-api npm start
                    '''
                    
                    // Capture logs for debugging
                    sh 'sleep 5'
                    sh 'docker logs blog-api || echo "No logs available"'
                    
                    // Give it more time to start
                    sh 'sleep 10'
                    
                    // Check if the application is running
                    sh 'curl http://localhost:5001 || echo "Application failed to start"'
                }
            }
        }

    }
    post {
        success {
            echo 'Build succeeded'
            // slackSend, curl to webhook, or emailext
        }
        failure {
             //Add channel name
            slackSend channel: '#all-deakin',
            message: "Find Status of Pipeline:- ${currentBuild.currentResult} ${env.JOB_NAME} ${env.BUILD_NUMBER} ${BUILD_URL}"
        }
        // always {
           
        // }
    }
    // post {
    //     always {
    //         // Cleanup
    //         sh 'docker stop blog-api || true'
    //         sh 'docker rm blog-api || true'
    //         sh 'docker stop mongodb || true'
    //         sh 'docker rm mongodb || true'
    //         sh 'docker network rm blog-network || true'
    //     }
    // }
}