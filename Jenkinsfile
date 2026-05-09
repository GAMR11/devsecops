pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        IMAGE_NAME       = 'devsecops-nestjs'
        SONAR_SERVER     = 'LocalSonar'
        COMPOSE_FILE_APP = 'docker-compose.yml'
    }

    tools {
        nodejs 'NodeJS-20'
    }

    stages {

        // ─────────────────────────────────────────────────────────
        // 1. CHECKOUT
        // ─────────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '>>> [1/7] Clonando repositorio...'
                checkout scm
            }
        }

        // ─────────────────────────────────────────────────────────
        // 2. INSTALL
        // ─────────────────────────────────────────────────────────
        stage('Install') {
            steps {
                echo '>>> [2/7] Instalando dependencias...'
                bat 'npm ci'
            }
        }

        // ─────────────────────────────────────────────────────────
        // 3. DEPENDENCY AUDIT
        // ─────────────────────────────────────────────────────────
        stage('Dependency Audit') {
            steps {
                echo '>>> [3/7] Auditando dependencias (npm audit)...'
                bat 'npm audit --json > npm-audit-report.json || exit 0'
                bat 'npm audit --audit-level=high || exit 0'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'npm-audit-report.json', allowEmptyArchive: true
                }
            }
        }

        // ─────────────────────────────────────────────────────────
        // 4. LINT
        // ─────────────────────────────────────────────────────────
        stage('Lint') {
            steps {
                echo '>>> [4/7] Ejecutando ESLint...'
                bat 'npm run lint || exit 0'
            }
        }

        // ─────────────────────────────────────────────────────────
        // 5. UNIT TESTS + COBERTURA  (antes del SAST para generar lcov.info)
        // ─────────────────────────────────────────────────────────
        stage('Unit Tests') {
            steps {
                echo '>>> [5/7] Ejecutando tests unitarios con cobertura...'
                bat 'npm run test:cov'
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing         : true,
                        alwaysLinkToLastBuild: true,
                        keepAll              : true,
                        reportDir            : 'coverage/lcov-report',
                        reportFiles          : 'index.html',
                        reportName           : 'Coverage Report'
                    ])
                }
            }
        }

        // ─────────────────────────────────────────────────────────
        // 6. SAST – SONARQUBE (lee coverage/lcov.info generado arriba)
        // ─────────────────────────────────────────────────────────
        stage('SAST - SonarQube') {
            steps {
                echo '>>> [6/7] Ejecutando analisis estatico SonarQube...'
                withSonarQubeEnv("${SONAR_SERVER}") {
                    bat '"C:\\sonar-scanner\\bin\\sonar-scanner.bat" "-Dsonar.projectKey=DevSecOps-NestJS-API" "-Dsonar.sources=src" "-Dsonar.login=%SONAR_AUTH_TOKEN%"'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo '>>> Esperando Quality Gate de SonarQube...'
                script {
                    def qg = waitForQualityGate()
                    if (qg.status != 'OK') {
                        echo "Quality Gate fallo: ${qg.status} - marcando build como UNSTABLE"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        // ─────────────────────────────────────────────────────────
        // 7. BUILD DOCKER
        // ─────────────────────────────────────────────────────────
        stage('Build Docker') {
            steps {
                echo ">>> [7/7] Construyendo imagen Docker ${IMAGE_NAME}:${BUILD_NUMBER}..."
                bat "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // POST – LIMPIEZA
    // ─────────────────────────────────────────────────────────────
    post {
        always {
            echo '>>> Limpiando imagen Docker...'
            bat "docker rmi ${IMAGE_NAME}:${BUILD_NUMBER} || exit 0"
            echo ">>> Pipeline finalizado con estado: ${currentBuild.result ?: 'SUCCESS'}"
        }
        success {
            echo 'Pipeline completado exitosamente.'
        }
        unstable {
            echo 'Pipeline finalizado con advertencias (UNSTABLE).'
        }
        failure {
            echo 'Pipeline fallo. Revisar logs de la etapa correspondiente.'
        }
    }
}
