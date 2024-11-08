pipeline {
  agent any

  environment {
    HELM_VERSION = "v3.16.2"
    HELM_RELEASE_NAME = "wordpress"
    HELM_INSTALL_DIR = "${env.HOME}/bin"
    PATH = "${env.HELM_INSTALL_DIR}:${env.PATH}"
    NAMESPACE = "wordpress"
  }

  stages {
    stage('Install Helm') {
      steps {
        sh '''
        mkdir -p $HELM_INSTALL_DIR
        
        # Download Helm archive
        curl -sSL https://get.helm.sh/helm-$HELM_VERSION-linux-arm64.tar.gz -o helm.tar.gz

        # Extract the binary and move it to the installation directory
        tar -xzvf helm.tar.gz linux-arm64/helm --strip-components=1
        mv helm $HELM_INSTALL_DIR/helm
        
        echo "Helm installed to $HELM_INSTALL_DIR and added to PATH"
        
        # Clean up
        rm -f helm.tar.gz
        '''
      }
    }

    stage('Verify Helm') {
      steps {
        sh 'helm version'
      }
    }

    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }

    stage('Install App') {
      steps {
        sh 'helm install my-nginx ./wordpress'
      }
    }
  }

  post {
    success {
      echo 'Deployment completed successfully!'
    }
    failure {
      echo 'Deployment failed.'
    }
  }
}