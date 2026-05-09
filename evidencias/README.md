# Evidencias del Proyecto DevSecOps NestJS

Carpeta de evidencias para el documento de investigación.

---

## 01 — Configuración inicial

### API Health Check
![API Health Check](01-setup/api-health-check.png)

### Swagger UI
![Swagger UI](01-setup/swagger-ui.png)

### Contenedores Docker corriendo
![Docker Containers Running](01-setup/docker-containers-running.png)

### Conexión MongoDB (productos)
![MongoDB Connection](01-setup/mongodb-connection.png)

---

## 02 — Jenkins Pipeline CI/CD

### Stage View — todas las etapas
![Jenkins Pipeline Stages](02-jenkins/jenkins-pipeline-stages.png)

### Build UNSTABLE por Quality Gate
![Jenkins Build Unstable](02-jenkins/jenkins-build-unstable.png)

### Reporte de cobertura publicado
![Jenkins Coverage Report](02-jenkins/jenkins-coverage-report.png)

### Reporte OWASP ZAP publicado
![Jenkins ZAP Report](02-jenkins/jenkins-zap-report.png)

---

## 03 — SonarQube (SAST)

### Dashboard Overview
![SonarQube Dashboard](03-sonarqube/sonar-dashboard-overview.png)

### Security Hotspot — Code Injection (eval)
![SonarQube Security Hotspot](03-sonarqube/sonar-security-hotspot.png)

### Cobertura 25.5%
![SonarQube Coverage](03-sonarqube/sonar-coverage.png)

### Measures — Security Review Rating E
![SonarQube Measures](03-sonarqube/sonar-measures.png)

---

## 04 — OWASP ZAP (DAST)

### Resumen del reporte (3 WARN, 117 PASS)
![ZAP Report Summary](04-owasp-zap/zap-report-summary.png)

### Reporte ZAP en Jenkins
![ZAP Jenkins Report](04-owasp-zap/zap-jenkins-report.png)

---

## 05 — Tests Unitarios

### Resultados 6/6 passed
![Unit Tests Results](05-tests/unit-tests-results.png)

### Reporte de cobertura
![Coverage Report](05-tests/coverage-report.png)

---

## 06 — Controles de Seguridad

### ESLint detectando eval can be harmful
![ESLint Eval Error](06-security/eslint-eval-error.png)

### Headers de seguridad (helmet)
![Helmet Headers](06-security/helmet-headers.png)
