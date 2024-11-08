pipeline {
  agent any

  environment {
    // KUBECONFIG = credentials('kubeconfig-credential-id') // Replace with your Jenkins Kubeconfig credential ID
    HELM_RELEASE_NAME = "wordpress"
    NAMESPACE = "wordpress"
  }

  stages {
    stage('Install Helm') {
      steps {
        sh 'curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash'
      }
    }

    stage('Add Helm Repositories') {
      steps {
        sh '''
          helm repo add bitnami https://charts.bitnami.com/bitnami
          helm repo update
        '''
      }
    }

    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }

    stage('Deploy WordPress with Traefik Ingress') {
      steps {
        script {
          def helmValues = """
          ingress:
            enabled: true
            hostname: wordpress.kozak.day
            annotations:
              traefik.ingress.kubernetes.io/router.entrypoints: web
            ingressClassName: "traefik"
          """

          writeFile file: 'values.yaml', text: helmValues
          
          sh """
              kubectl create namespace ${NAMESPACE} || true
              helm upgrade --install ${HELM_RELEASE_NAME} bitnami/wordpress \\
                --namespace ${NAMESPACE} \\
                -f values.yaml
          """
        }
      }
    }
  }

  post {
    always {
      // Clean up generated files
      sh 'rm -f values.yaml'
    }
    success {
      echo 'Deployment completed successfully!'
    }
    failure {
      echo 'Deployment failed.'
    }
  }
}