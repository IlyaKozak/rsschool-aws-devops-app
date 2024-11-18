pipeline {
  agent {
    kubernetes {
      yaml """
      apiVersion: v1
      kind: Pod
      spec:
        containers:
        - name: node
          image: node:22-alpine
          command:
          - cat
          tty: true
        - name: docker
          image: docker:dind
          securityContext:
            privileged: true
          env:
          - name: DOCKER_TLS_CERTDIR
            value: ""
          volumeMounts:
          - name: docker-graph-storage
            mountPath: /var/lib/docker
        - name: aws-cli
          image: amazon/aws-cli:latest
          command:
          - cat
          tty: true
        volumes:
        - name: docker-graph-storage
          emptyDir: {}
      """
    }
  }

  environment {
    DOCKER_IMAGE = "nodejs-app"
    ECR_REPO_URI = "xxxx"
    AWS_REGION = "eu-north-1"
    SES_SENDER = "xxx"
    SES_RECIPIENT = "xxx"
  }

  stages {
    stage('Install Dependencies') {
      steps {
        container('node') {
          sh 'npm install --prefix nodejs-app'
        }
      }
    }

    stage('Run Tests') {
      steps {
        container('node') {
          sh 'npm test --prefix nodejs-app'
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        container('docker') {
          sh '''
            until docker info > /dev/null 2>&1; do
              echo "Waiting for Docker daemon to start..."
              sleep 2
            done
            echo "Docker daemon is ready."

            docker build -t $DOCKER_IMAGE:latest nodejs-app
          '''
        }
      }
    }

    stage('Get AWS ECR Login Password') {
      steps {
        container('aws-cli') {
          script {
            def ecrPassword = sh(script: "aws ecr get-login-password --region $AWS_REGION", returnStdout: true).trim()
            env.ECR_PASSWORD = ecrPassword
          }
        }
      }
    }

    stage('Docker Login to ECR') {
      steps {
        container('docker') {
          sh '''
            set +x
            echo $ECR_PASSWORD | docker login --username AWS --password-stdin $ECR_REPO_URI
            set -x
          '''
        }
      }
    }

    stage('Tag Docker Image') {
      steps {
        container('docker') {
          sh 'docker tag $DOCKER_IMAGE:latest $ECR_REPO_URI:latest'
        }
      }
    }

    stage('Manual Approval') {
      steps {
        script {
          input message: "Do you want to push the Docker image to ECR?", ok: "Yes, Push"
        }
      }
    }

    stage('Push Docker Image to ECR') {
      steps {
        container('docker') {
          sh 'docker push $ECR_REPO_URI:latest'
        }
      }
    }
  }
  
  post {
    success {
      script {
        sendEmail("✅ Jenkins Pipeline Success", "✅ The Jenkins pipeline completed successfully.")
      }
    }
    failure {
      script {
        sendEmail("❌Jenkins Pipeline Failure", "❌The Jenkins pipeline failed. Please check the logs for details.")
      }
    }
    aborted {
      script {
        sendEmail("⛔Jenkins Pipeline Aborted", "⛔The Jenkins pipeline was manually aborted.")
      }
    }
  }
}

def sendEmail(subject, body) {
  container('aws-cli') {
    sh """
    aws ses send-email \
      --from "$SES_SENDER" \
      --destination "ToAddresses=$SES_RECIPIENT" \
      --message '{
        "Subject": {"Data": "${subject}"},
        "Body": {"Text": {"Data": "${body}"}}
      }' \
      --region $AWS_REGION
    """
  }
}