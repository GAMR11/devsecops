pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        IMAGE_NAME       = 'devsecops-nestjs'
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
                echo '>>> [1/5] Clonando repositorio...'
                checkout scm
            }
        }

        // ─────────────────────────────────────────────────────────
        // 2. INSTALL
        // ─────────────────────────────────────────────────────────
        stage('Install') {
            steps {
                echo '>>> [2/5] Instalando dependencias...'
                bat 'npm ci'
            }
        }

        // ─────────────────────────────────────────────────────────
        // 3. DEPENDENCY AUDIT
        // ─────────────────────────────────────────────────────────
        stage('Dependency Audit') {
            steps {
                echo '>>> [3/5] Auditando dependencias (npm audit)...'
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
                echo '>>> [4/5] Ejecutando ESLint...'
                bat 'npm run lint || exit 0'
            }
        }

        // ─────────────────────────────────────────────────────────
        // 5. UNIT TESTS + COBERTURA
        // ─────────────────────────────────────────────────────────
        stage('Unit Tests') {
            steps {
                echo '>>> [5/5] Ejecutando tests unitarios con cobertura...'
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

    }

    // ─────────────────────────────────────────────────────────────
    // POST – LIMPIEZA
    // ─────────────────────────────────────────────────────────────
    post {
        always {
            echo ">>> Pipeline finalizado con estado: ${currentBuild.result ?: 'SUCCESS'}"
        }
        success {
            echo 'Pipeline completado exitosamente.'
        }
        failure {
            echo 'Pipeline fallo. Revisar logs de la etapa correspondiente.'
        }
    }
}
