pipeline {
    agent any

    environment {
        IMAGE_NAME_DB     = 'mudz1212/child-and-me-db-cloud'
        IMAGE_NAME_SERVER = 'mudz1212/child-and-me-server-cloud'
        IMAGE_TAG         = "${BUILD_NUMBER}"
        ARM_CLIENT_ID       = credentials('azure-client-id')
        ARM_CLIENT_SECRET   = credentials('azure-client-secret')
        ARM_SUBSCRIPTION_ID = credentials('azure-subscription-id')
        ARM_TENANT_ID       = credentials('azure-tenant-id')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Building mudz1212 child-and-me images"
            }
        }

        stage('Test') {
            steps {
                dir('server') {
                    sh 'npm ci'
                    sh 'npm test'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                dir('db') {
                    sh 'docker build --platform linux/amd64 -t $IMAGE_NAME_DB:$IMAGE_TAG .'
                    sh 'docker build --platform linux/amd64 -t $IMAGE_NAME_DB:latest .'
                }
                dir('server') {
                    sh 'docker build --platform linux/amd64 -t $IMAGE_NAME_SERVER:$IMAGE_TAG .'
                    sh 'docker build --platform linux/amd64 -t $IMAGE_NAME_SERVER:latest .'
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh 'docker push $IMAGE_NAME_DB:$IMAGE_TAG'
                    sh 'docker push $IMAGE_NAME_SERVER:$IMAGE_TAG'
                    sh 'docker push $IMAGE_NAME_DB:latest'
                    sh 'docker push $IMAGE_NAME_SERVER:latest'
                }
            }
        }

        stage('Terraform Init') {
            steps {
                dir('terraform/infrastructure') {
                    sh 'terraform init -reconfigure'
                }
            }
        }

        stage('Terraform Plan') {
            steps {
                dir('terraform/infrastructure') {
                    sh 'terraform plan -out=tfplan'
                    sh 'terraform show -no-color tfplan > tfplan.txt'
                }
                archiveArtifacts artifacts: 'terraform/infrastructure/tfplan.txt', fingerprint: true
            }
        }

        stage('Terraform Apply') {
            steps {
                script {
                    timeout(time: 15, unit: 'MINUTES') {
                        input message: 'Apply this plan?', ok: 'Apply'
                    }
                }
                dir('terraform/infrastructure') {
                    sh 'terraform apply -auto-approve tfplan'
                }
            }
        }

        stage('Deploy Server Container') {
            steps {
                dir('terraform/infrastructure') {
                    script {
                        env.VM_IP = sh(
                            script: 'terraform output -raw public_ip_address',
                            returnStdout: true
                        ).trim()
                    }
                }
                withCredentials([string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')]) {
                    sshagent(credentials: ['vm-ssh-key']) {
                        sh '''
                            printf 'JWT_SECRET=%s\\n' "$JWT_SECRET" | ssh -o StrictHostKeyChecking=no azureuser@$VM_IP '
                              sudo sh -c "umask 077 && cat > /opt/app/.env" &&
                              cd /opt/app &&
                              docker compose pull child-and-me-server &&
                              docker compose up -d child-and-me-server'
                        '''
                    }
                }
            }
        }
    }

    post {
        success { echo "Pushed ${IMAGE_TAG}" }
        failure { echo "FAILED — see ${BUILD_URL}console" }
    }
}