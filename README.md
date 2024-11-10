## RS School AWS DevOps Course - App

### _Applications_

**Project Structure:**

```
├── wordpress
│   ├── Chart.yaml          <- Helm Chart info
│   ├── values.yaml         <- default chart values
│   └── templates
│       ├── NOTES.txt       <- usage notes
│       └── ...             <- templates + values = k8s  manifests
├── .gitignore
└──Jenkinsfile              <- Jenkins Pipeline definition
```

### Task 5 - Simple Application Deployment with Helm

- Helm chart for WordPress app is created
- WordPress Helm chart deployed to k3s kubernetes cluster via Jenkins CI/CD Pipeline
- WordPress app is accessible via Internet => Nginx reverse proxy => Traefik ingress conroller => Wordpress service in private subnet

For more details please see PR: https://github.com/IlyaKozak/rsschool-aws-devops-app/pull/1

**Helm Chart Deploy Diagram:**  
![Diagram](tasks-images/task5-diagram.png)

### Infractructure

Infrastructure configuration provided in this repo (IaC) **https://github.com/IlyaKozak/rsschool-devops-course-infra**

### Configuration

Configuration (k3s kubernetes cluster + Jenkins CI/CD setup) provided in this repo **https://github.com/IlyaKozak/rsschool-devops-course-config**

**Usage:**

Push code (Helm Chart) to this repo it will be automatically deployed via Jenkins CI/CD Pipeline defined in Jenkinsfile.
GitHub Actions webhook is set in this repo to trigger CI/CD Pipeline.
