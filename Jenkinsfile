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
                echo ">>> [7/8] Construyendo imagen Docker ${IMAGE_NAME}:${BUILD_NUMBER}..."
                bat "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
            }
        }

        // ─────────────────────────────────────────────────────────
        // 8. DAST – OWASP ZAP
        // ─────────────────────────────────────────────────────────
        stage('DAST - OWASP ZAP') {
            steps {
                echo '>>> [8/8] Ejecutando escaneo dinamico OWASP ZAP...'
                bat "docker-compose -f %COMPOSE_FILE_APP% down --remove-orphans || exit 0"
                bat "docker rm -f devsecops-api devsecops-mongo || exit 0"
                bat "docker-compose -f %COMPOSE_FILE_APP% up -d"
                bat """
                    @echo off
                    echo Esperando que la API este lista...
                    set /a count=0
                    :wait
                    set /a count+=1
                    echo Intento %count% de 30...
                    curl.exe -s -o nul -w "%%{http_code}" http://127.0.0.1:3000/health 2>nul | findstr /r "200 201" >nul 2>&1
                    if not errorlevel 1 goto ready
                    if %count% geq 30 goto timedout
                    ping -n 6 127.0.0.1 >nul
                    goto wait
                    :ready
                    echo API lista en intento %count%.
                    goto done
                    :timedout
                    echo API no respondio despues de 30 intentos, continuando de todas formas...
                    :done
                """
                bat """docker run --rm --network host -v "%CD%:/zap/wrk/:rw" ghcr.io/zaproxy/zaproxy:stable zap-api-scan.py -t http://localhost:3000/api-json -f openapi -r /zap/wrk/zap-report.html -J /zap/wrk/zap-report.json -I -l WARN || exit 0"""
            }
            post {
                always {
                    bat "docker-compose -f %COMPOSE_FILE_APP% down || exit 0"
                    publishHTML(target: [
                        allowMissing         : true,
                        alwaysLinkToLastBuild: true,
                        keepAll              : true,
                        reportDir            : '.',
                        reportFiles          : 'zap-report.html',
                        reportName           : 'OWASP ZAP Report'
                    ])
                    archiveArtifacts artifacts: 'zap-report.json', allowEmptyArchive: true
                }
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
