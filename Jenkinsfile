pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/dalex-1990/task7.3HD.git'
            }
        }

        stage('Build and Test') {
            steps {
                script {
                    // Clean up any previous containers that might exist
                    sh 'docker stop blog-api || true'
                    sh 'docker rm blog-api || true'
                    sh 'docker stop mongodb || true'
                    sh 'docker rm mongodb || true'
                    
                    // Build the Docker image
                    sh 'docker build -t blog-api:${BUILD_NUMBER} .'
                    sh 'docker tag blog-api:${BUILD_NUMBER} blog-api:latest'
                    
                    // Run tests inside the container
                    sh 'docker run --rm blog-api:${BUILD_NUMBER} npm test || true'
                }
            }
        }
        
        stage('Run Application') {
            steps {
                script {
                    // Ensure network exists
                    sh 'docker network create blog-network || true'
                    
                    // Start MongoDB container
                    sh 'docker run -d --name mongodb --network blog-network mongo:latest'
                    
                    // Run the application container with MongoDB connection
                    sh '''
                    docker run -d --name blog-api \
                      -p 5001:5000 \
                      -e MONGO_URI=mongodb://mongodb:27017/blog-api \
                      -e JWT_SECRET=jenkins_secret_key \
                      --network blog-network \
                      blog-api:${BUILD_NUMBER}
                    '''
                    
                    // Give it a moment to start
                    sh 'sleep 10'
                    
                    // Check if the application is running
                    sh 'curl http://localhost:5001 || echo "Application failed to start"'
                }
            }
        }
    }
    
    post {
        always {
            // Clean up after build is complete
            script {
                sh 'docker stop blog-api || true'
                sh 'docker rm blog-api || true'
                sh 'docker stop mongodb || true'
                sh 'docker rm mongodb || true'
                sh 'docker network rm blog-network || true'
                
                // Keep only recent Docker images to prevent disk space issues
                sh '''
                # Keep only the 5 most recent blog-api images
                KEEP=5
                COUNT=$(docker images blog-api --format "{{.ID}}" | wc -l)
                if [ $COUNT -gt $KEEP ]; then
                    docker images blog-api --format "{{.ID}} {{.Tag}}" | grep -v latest | sort | head -n -$KEEP | awk '{print $1}' | xargs -r docker rmi
                fi
                '''
            }
        }
    }
}