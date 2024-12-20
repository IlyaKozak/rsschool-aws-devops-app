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
        - name: helm
          image: alpine/helm:latest
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
    AWS_REGION = "eu-north-1"
  }

  stages {
    stage('Install App Dependencies') {
      steps {
        container('node') {
          sh 'npm install --prefix nodejs-app'
        }
      }
    }

    stage('Application Build') {
      steps {
        container('node') {
          sh 'npm run build --prefix nodejs-app'
        }
      }
    }

    stage('Unit Tests') {
      steps {
        container('node') {
          sh 'npm test --prefix nodejs-app'
        }
      }
    }

    stage('Tests Coverage') {
      steps {
        container('node') {
          sh 'npm run test:coverage --prefix nodejs-app'
        }
      }
    }
    
    stage('SonarQube Analysis') {
      steps {
        container('node') {
          script {
            sh """
              apk add --no-cache -q openjdk17
              export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
              export PATH=$JAVA_HOME/bin:$PATH
              java -version
            """
            def scannerHome = tool 'SonarQubeScanner'
            withSonarQubeEnv('SonarQube') {
              sh """
                ${scannerHome}/bin/sonar-scanner \
                  -Dsonar.projectKey=nodejs-app \
                  -Dsonar.sources=nodejs-app/src \
                  -Dsonar.tests=nodejs-app/src/__tests__ \
                  -Dsonar.test.inclusions=**/*.test.ts= \
                  -Dsonar.host.url=http://sonarqube-sonarqube.sonarqube:9000 \
                  -Dsonar.javascript.lcov.reportPaths=nodejs-app/coverage/lcov.info \
                  -Dsonar.typescript.lcov.reportPaths=nodejs-app/coverage/lcov.info \
                  -Dsonar.login=${env.SONAR_AUTH_TOKEN}
              """
            }
          }
        }
      }
    }

    stage('SonarQube Quality Gate') {
      steps {
        script {
          timeout(time: 1, unit: 'MINUTES') {
            waitForQualityGate abortPipeline: true
          }
        }
      }
    }

    stage('Docker Image Build') {
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

    stage('Get AWS ECR Password') {
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
          withCredentials([
            string(credentialsId: 'ecr-repo-uri-id', variable: 'ECR_REPO_URI')
          ]) {
            sh '''
              set +x
              echo $ECR_PASSWORD | docker login --username AWS --password-stdin $ECR_REPO_URI
              set -x
            '''
          }
        }
      }
    }

    stage('Docker Tag Image') {
      steps {
        container('docker') {
          withCredentials([
            string(credentialsId: 'ecr-repo-uri-id', variable: 'ECR_REPO_URI')
          ]) {
            sh 'docker tag $DOCKER_IMAGE:latest $ECR_REPO_URI:latest'
          }
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

    stage('Docker Push Image to ECR') {
      steps {
        container('docker') {
          withCredentials([
            string(credentialsId: 'ecr-repo-uri-id', variable: 'ECR_REPO_URI')
          ]) {
            sh 'docker push $ECR_REPO_URI:latest'
          }
        }
      }
    }

    stage('Helm Deploy') {
      steps {
        container('helm') {
          withCredentials([
            string(credentialsId: 'domain-id', variable: 'DOMAIN'),
            string(credentialsId: 'ecr-repo-uri-id', variable: 'ECR_REPO_URI')
          ]) {
            script {
              def ecrAuthString = "AWS:$ECR_PASSWORD".getBytes('UTF-8').encodeBase64().toString()
              env.ECR_TOKEN = ecrAuthString

              sh """
              helm upgrade --install nodejs-app nodejs-app/helm-chart \
                --namespace nodejs-app \
                --create-namespace \
                --set registry=$ECR_REPO_URI \
                --set ecrAuthString=$ECR_TOKEN \
                --set ingress.hostname=app.$DOMAIN \
                -f nodejs-app/helm-chart/values.yaml
              """
            }
          }
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
  withCredentials([
    string(credentialsId: 'ses-sender-id', variable: 'SES_SENDER'),
    string(credentialsId: 'ses-recipient-id', variable: 'SES_RECIPIENT')
  ]) {
    container('aws-cli') {
      sh """
      aws ses send-email \
        --from "$SES_SENDER" \
        --destination "ToAddresses=$SES_RECIPIENT" \
        --message '{
          "Subject": {"Data": "${subject}"},
          "Body": {"Text": {"Data": "${body}"}
        }}' \
        --region $AWS_REGION
      """
    }
  }
}