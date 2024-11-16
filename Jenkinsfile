pipeline {
  agent any

  environment {
    DOCKER_IMAGE     = "nodejs-app"
    HELM_VERSION     = "v3.16.2"
    HELM_INSTALL_DIR = "${env.HOME}/bin"
    PATH             = "${env.HELM_INSTALL_DIR}:${env.PATH}"
  }

  stages {
    stage('Application build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Unit test execution') {
      steps {
        sh 'npm test'
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          sh "docker build -t ${DOCKER_IMAGE} ."
        }
      }
    }

    stage('Install Helm') {
      steps {
        sh '''
        mkdir -p $HELM_INSTALL_DIR
        
        curl -sSL https://get.helm.sh/helm-$HELM_VERSION-linux-arm64.tar.gz -o helm.tar.gz

        tar -xzvf helm.tar.gz linux-arm64/helm --strip-components=1
        mv helm $HELM_INSTALL_DIR/helm
        
        rm -f helm.tar.gz
        '''
      }
    }

    stage('Verify Helm Installation') {
      steps {
        sh 'helm version'
      }
    }

    // stage('Install Helm Chart') {
    //   steps {
    //     withCredentials([
    //       string(credentialsId: 'mysql-rootpass', variable: 'MYSQL_ROOTPASS'),
    //       string(credentialsId: 'mysql-pass', variable: 'MYSQL_PASS')
    //     ]) {
    //       script {
    //         def encodedRootPass = sh(script: "echo -n ${MYSQL_ROOTPASS} | base64", returnStdout: true).trim()
    //         def encodedPass = sh(script: "echo -n ${MYSQL_PASS} | base64", returnStdout: true).trim()

    //         sh """
    //         helm upgrade --install wordpress ./wordpress --namespace wordpress --create-namespace \
    //           --set mysql.rootPass=${encodedRootPass} \
    //           --set mysql.pass=${encodedPass}
    //         """
    //       }
    //     }
    //   }
    // }
  }

  post {
    success {
      echo 'Helm chart deployment completed successfully!'
    }
    failure {
      echo 'Helm chart deployment failed!'
    }
  }
}