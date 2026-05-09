# Tabla Comparativa: DevOps Tradicional vs DevSecOps

## Para el capítulo de Discusión / Resultados

| Criterio | DevOps Tradicional | DevSecOps (este proyecto) |
|---|---|---|
| **Etapas del pipeline** | Build → Test → Deploy | Build → Lint → Audit → Test → SAST → Quality Gate → Build Docker → DAST → Deploy |
| **Herramientas de seguridad** | Ninguna integrada en el pipeline | ESLint (no-eval), npm audit, SonarQube, OWASP ZAP |
| **Momento de detección de vulnerabilidades** | Post-producción o en auditorías manuales periódicas | En cada commit, antes de llegar a producción |
| **Tiempo promedio de detección** | Semanas o meses (MTTD alto) | Minutos (durante la ejecución del pipeline) |
| **Análisis de código estático (SAST)** | Manual o ausente | Automatizado en cada ejecución (SonarQube) |
| **Análisis dinámico (DAST)** | Manual o ausente | Automatizado contra la API en ejecución (OWASP ZAP) |
| **Auditoría de dependencias** | Manual o periódica | Automática en cada build (npm audit) |
| **Cobertura de análisis** | Solo funcional | Funcional + seguridad estática + seguridad dinámica + dependencias |
| **Quality Gate de seguridad** | No existe | Bloquea el pipeline si hay hotspots sin revisar |
| **Costo de remediación** | Alto (vulnerabilidad en producción = incidente) | Bajo (detección temprana en desarrollo) |
| **Cumplimiento normativo** | Sin trazabilidad automática | Controles ISO 27001 A.9, A.10, A.12, A.14 documentados |
| **Visibilidad del equipo** | Baja (seguridad es responsabilidad de un área separada) | Alta (cada desarrollador ve los resultados de seguridad en su pipeline) |
| **Time-to-market** | Más rápido en ciclos cortos, pero con deuda técnica de seguridad | Ligeramente más lento por las etapas adicionales, pero sin sorpresas en producción |
| **Cultura de seguridad** | Seguridad como fase final ("bolt-on") | Seguridad integrada en cada etapa del SDLC ("built-in") |

## Resultados obtenidos en este proyecto

| Métrica | Valor |
|---|---|
| Vulnerabilidades detectadas por SAST | 1 Security Hotspot (Code Injection RCE via eval) |
| Vulnerabilidades en dependencias (npm audit) | 30 total: 12 high, 14 moderate, 4 low |
| Alertas DAST (OWASP ZAP) | 3 WARN: Server Error 500, Debug Error Messages, Application Error Disclosure |
| Controles pasados por ZAP | 117 de 120 (97.5%) |
| Cobertura de tests unitarios | 25.5% (64% en products.service.ts) |
| Tests unitarios | 6/6 passed |
| Tiempo de ejecución del pipeline | ~8 minutos (build #4) |
| Builds ejecutados | 4 builds con mejoras progresivas |

## Costo de remediación según fase de detección

Según estudios del NIST (National Institute of Standards and Technology), el costo relativo
de corregir una vulnerabilidad aumenta exponencialmente según la fase en que se detecta:

| Fase de detección | Costo relativo |
|---|---|
| Durante el desarrollo (SAST/lint) | 1x |
| Durante las pruebas (DAST) | 10x |
| En producción | 100x |

Este proyecto demuestra que la integración de herramientas DevSecOps permite detectar
vulnerabilidades en las fases más tempranas y económicas del SDLC.
