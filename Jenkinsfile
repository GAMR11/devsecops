pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        IMAGE_NAME        = 'devsecops-nestjs'
        SONAR_SERVER      = 'LocalSonar'
        ZAP_TARGET        = 'http://localhost:3000'
        COMPOSE_FILE_APP  = 'docker-compose.yml'
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
                echo '>>> [1/9] Clonando repositorio...'
                checkout scm
            }
        }

        // ─────────────────────────────────────────────────────────
        // 2. INSTALL
        // ─────────────────────────────────────────────────────────
        stage('Install') {
            steps {
                echo '>>> [2/9] Instalando dependencias...'
                sh 'npm ci'
            }
        }

        // ─────────────────────────────────────────────────────────
        // 3. DEPENDENCY AUDIT
        // ─────────────────────────────────────────────────────────
        stage('Dependency Audit') {
            steps {
                echo '>>> [3/9] Auditando dependencias (npm audit)...'
                sh '''
                    npm audit --json > npm-audit-report.json || true
                    npm audit --audit-level=high
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'npm-audit-report.json', allowEmptyArchive: true
                }
                failure {
                    echo 'ADVERTENCIA: Se encontraron vulnerabilidades altas/criticas en dependencias.'
                    script { currentBuild.result = 'UNSTABLE' }
                }
            }
        }

        // ─────────────────────────────────────────────────────────
        // 4. LINT
        // ─────────────────────────────────────────────────────────
        stage('Lint') {
            steps {
                echo '>>> [4/9] Ejecutando ESLint...'
                sh 'npm run lint'
            }
        }

        // ─────────────────────────────────────────────────────────
        // 5. SAST – SONARQUBE
        // ─────────────────────────────────────────────────────────
        stage('SAST - SonarQube') {
            steps {
                echo '>>> [5/9] Ejecutando análisis estático SonarQube...'
                withSonarQubeEnv("${SONAR_SERVER}") {
                    sh 'npx sonar-scanner'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo '>>> Esperando Quality Gate de SonarQube...'
                script {
                    def qg = waitForQualityGate()
                    if (qg.status != 'OK') {
                        echo "Quality Gate falló: ${qg.status} — marcando build como UNSTABLE"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        // ─────────────────────────────────────────────────────────
        // 6. UNIT TESTS + COBERTURA
        // ─────────────────────────────────────────────────────────
        stage('Unit Tests') {
            steps {
                echo '>>> [6/9] Ejecutando tests unitarios con cobertura...'
                sh 'npm run test:cov'
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
        // 7. BUILD DOCKER
        // ─────────────────────────────────────────────────────────
        stage('Build Docker') {
            steps {
                echo ">>> [7/9] Construyendo imagen Docker ${IMAGE_NAME}:${BUILD_NUMBER}..."
                sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
            }
        }

        // ─────────────────────────────────────────────────────────
        // 8. INTEGRATION TESTS (E2E)
        // ─────────────────────────────────────────────────────────
        stage('Integration Tests') {
            steps {
                echo '>>> [8/9] Levantando contenedores e2e...'
                sh '''
                    docker-compose -f ${COMPOSE_FILE_APP} up -d
                    echo "Esperando que la API esté disponible..."
                    for i in $(seq 1 30); do
                        if curl -sf http://localhost:3000/health > /dev/null; then
                            echo "API lista."
                            break
                        fi
                        echo "Intento $i/30 - esperando..."
                        sleep 3
                    done
                '''
                sh 'npm run test:e2e'
            }
        }

        // ─────────────────────────────────────────────────────────
        // 9. DAST – OWASP ZAP
        // ─────────────────────────────────────────────────────────
        stage('DAST - OWASP ZAP') {
            steps {
                echo '>>> [9/9] Ejecutando escaneo dinámico OWASP ZAP...'
                sh '''
                    docker run --rm --network host \
                        -v $(pwd):/zap/wrk/:rw \
                        ghcr.io/zaproxy/zaproxy:stable \
                        zap-api-scan.py \
                        -t http://localhost:3000/api-json \
                        -f openapi \
                        -r /zap/wrk/zap-report.html \
                        -w /zap/wrk/zap-report.md \
                        -J /zap/wrk/zap-report.json \
                        -I \
                        -l WARN || true
                '''
            }
            post {
                always {
                    publishHTML(target: [
                        allowMissing         : true,
                        alwaysLinkToLastBuild: true,
                        keepAll              : true,
                        reportDir            : '.',
                        reportFiles          : 'zap-report.html',
                        reportName           : 'OWASP ZAP Report'
                    ])
                    archiveArtifacts artifacts: 'zap-report.json,zap-report.md', allowEmptyArchive: true
                }
                failure {
                    script { currentBuild.result = 'UNSTABLE' }
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // POST – LIMPIEZA SIEMPRE
    // ─────────────────────────────────────────────────────────────
    post {
        always {
            echo '>>> Limpiando contenedores e imagen...'
            sh '''
                docker-compose -f ${COMPOSE_FILE_APP} down -v || true
                docker rmi ${IMAGE_NAME}:${BUILD_NUMBER} || true
            '''
            echo ">>> Pipeline finalizado con estado: ${currentBuild.result ?: 'SUCCESS'}"
        }
        success {
            echo 'Pipeline completado exitosamente.'
        }
        unstable {
            echo 'Pipeline finalizado con advertencias (UNSTABLE). Revisar Quality Gate, audit o ZAP.'
        }
        failure {
            echo 'Pipeline falló. Revisar logs de la etapa correspondiente.'
        }
    }
}
