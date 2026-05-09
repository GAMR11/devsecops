# Evidencias del Proyecto DevSecOps NestJS

Carpeta de evidencias para el documento de investigación.
Guardar las capturas de pantalla en la carpeta correspondiente.

## 01-setup — Configuración inicial
| Archivo | Descripción | Cómo obtenerlo |
|---|---|---|
| `api-health-check.png` | Respuesta del endpoint GET /health | `curl http://localhost:3000/health` |
| `swagger-ui.png` | Interfaz Swagger en http://localhost:3000/api | Captura del navegador |
| `docker-containers-running.png` | Contenedores levantados y healthy | `docker-compose ps` o Docker Desktop |
| `mongodb-connection.png` | POST /products + GET /products con datos | Swagger UI o curl |

## 02-jenkins — Pipeline CI/CD
| Archivo | Descripción | Cómo obtenerlo |
|---|---|---|
| `jenkins-pipeline-stages.png` | Stage View del build #4 (todas las etapas) | http://localhost:8080/job/devsecops-nestjs/ |
| `jenkins-build-unstable.png` | Build marcado como UNSTABLE por Quality Gate | Página principal del job |
| `jenkins-coverage-report.png` | Reporte de cobertura publicado en Jenkins | Build #4 → Coverage Report |
| `jenkins-zap-report.png` | Reporte ZAP publicado en Jenkins | Build #4 → OWASP ZAP Report |
| `jenkins-console-log.txt` | Log completo del build #4 | Build #4 → Console Output → guardar como .txt |

## 03-sonarqube — Análisis estático (SAST)
| Archivo | Descripción | Cómo obtenerlo |
|---|---|---|
| `sonar-dashboard-overview.png` | Overview con Quality Gate PASSED y métricas | http://localhost:9000/dashboard?id=DevSecOps-NestJS-API |
| `sonar-security-hotspot.png` | Detalle del hotspot Code Injection (eval) | Pestaña Security Hotspots |
| `sonar-coverage.png` | Cobertura 25.5% en dashboard | Overview → Coverage |
| `sonar-measures.png` | Vista Measures con Security Review Rating E | Pestaña Measures |

## 04-owasp-zap — Análisis dinámico (DAST)
| Archivo | Descripción | Cómo obtenerlo |
|---|---|---|
| `zap-report-summary.png` | Resumen del reporte ZAP (3 WARN, 117 PASS) | Abrir zap-report.html en navegador |
| `zap-alerts-detail.png` | Detalle de las 3 alertas detectadas | zap-report.html → sección Alerts |
| `zap-jenkins-report.png` | Reporte ZAP publicado en Jenkins | Build #4 → OWASP ZAP Report |

## 05-tests — Pruebas unitarias
| Archivo | Descripción | Cómo obtenerlo |
|---|---|---|
| `unit-tests-results.png` | 6/6 tests pasados con nombres descriptivos | Captura de la terminal con `npm run test:cov` |
| `coverage-report.png` | Tabla de cobertura por archivo | Misma terminal o coverage/lcov-report/index.html |

## 06-security — Controles de seguridad
| Archivo | Descripción | Cómo obtenerlo |
|---|---|---|
| `helmet-headers.png` | Headers de seguridad en respuesta HTTP | DevTools → Network → Response Headers de GET /health |
| `npm-audit-report.json` | Reporte de auditoría de dependencias | Copiar desde `npm-audit-report.json` en raíz del proyecto |
| `eslint-eval-error.png` | ESLint detectando `eval can be harmful` | Captura del lint en Jenkins o terminal |
