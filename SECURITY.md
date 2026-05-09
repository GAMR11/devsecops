# Security Policy

## Política de Gestión de Secretos

Este documento describe los controles de seguridad implementados en el proyecto **DevSecOps NestJS API**, alineados con los controles de la norma ISO/IEC 27001:2022.

---

## 1. Gestión de Credenciales y Secretos

### Principios
- Ningún secreto (contraseñas, tokens, API keys, URIs de conexión) debe ser commiteado al repositorio de código fuente.
- Todos los secretos se gestionan mediante variables de entorno y sistemas de almacenamiento seguro de credenciales.
- El archivo `.env` está incluido en `.gitignore` y nunca debe subirse al repositorio.

### Implementación
| Componente | Mecanismo | Control ISO 27001 |
|---|---|---|
| Credenciales Jenkins | Jenkins Credentials Store + `withCredentials()` | A.9.2 Gestión de acceso de usuarios |
| Token SonarQube | Secret Text en Jenkins, inyectado como variable de entorno | A.9.4 Control de acceso a sistemas |
| Credenciales MongoDB | Variables de entorno en docker-compose, nunca hardcodeadas | A.10.1 Controles criptográficos |
| Variables de app | `@nestjs/config` + validación con Joi al inicio | A.14.2 Seguridad en el desarrollo |

### Rotación de Credenciales
1. Generar nuevo token/contraseña en el sistema correspondiente
2. Actualizar el valor en Jenkins Credentials Store
3. Actualizar el archivo `.env` local (nunca commitear)
4. Verificar que el pipeline sigue funcionando con las nuevas credenciales
5. Revocar las credenciales anteriores

---

## 2. Controles de Seguridad en el Código

### Headers de Seguridad HTTP
Se utiliza `helmet` en `main.ts` para configurar automáticamente los siguientes headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`
- `Content-Security-Policy`

**Control ISO 27001:** A.14.1 Requisitos de seguridad de los sistemas de información

### Rate Limiting
Se implementa `@nestjs/throttler` con límite de 100 solicitudes por minuto por IP para prevenir ataques de fuerza bruta y DoS.

**Control ISO 27001:** A.13.1 Gestión de la seguridad de las redes

### Validación de Input
Se usa `ValidationPipe` con `whitelist: true` y `forbidNonWhitelisted: true` para rechazar cualquier propiedad no declarada en los DTOs.

**Control ISO 27001:** A.14.2 Seguridad en los procesos de desarrollo y soporte

---

## 3. Vulnerabilidades Intencionales (Evidencia Académica)

Las siguientes vulnerabilidades fueron introducidas intencionalmente para demostrar la capacidad de detección del pipeline DevSecOps. **No deben existir en un entorno de producción.**

| Vulnerabilidad | Archivo | Línea | Herramienta que la detecta |
|---|---|---|---|
| Code Injection via `eval()` | `products.service.ts` | 58 | SonarQube (Security Hotspot) + ESLint (`no-eval`) |
| NoSQL Injection (input sin sanitizar) | `products.service.ts` | 34-35 | SonarQube |
| Sensitive Data Exposure en logs | `products.service.ts` | 68-69 | SonarQube |

### Proceso de Remediación (demostrado en el pipeline)
1. **Detección:** SonarQube detecta el hotspot en cada ejecución del pipeline
2. **Bloqueo:** El Quality Gate marca el build como UNSTABLE
3. **Corrección:** El desarrollador corrige el código
4. **Verificación:** El siguiente build confirma que el hotspot fue resuelto

---

## 4. Pipeline de Seguridad (DevSecOps)

El pipeline implementado en Jenkins ejecuta los siguientes controles automáticos en cada push:

```
Código → Lint (ESLint no-eval) → Tests → SAST (SonarQube) → Quality Gate → Build → DAST (OWASP ZAP)
```

| Fase | Herramienta | Tipo de análisis | Control ISO 27001 |
|---|---|---|---|
| Lint | ESLint | Análisis sintáctico | A.14.2.1 Política de desarrollo seguro |
| Auditoría de dependencias | npm audit | Vulnerabilidades en dependencias | A.12.6 Gestión de vulnerabilidades técnicas |
| SAST | SonarQube | Análisis estático de código fuente | A.14.2.8 Pruebas de seguridad del sistema |
| DAST | OWASP ZAP | Análisis dinámico contra API en ejecución | A.14.2.8 Pruebas de seguridad del sistema |

---

## 5. Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad en este proyecto, por favor repórtala directamente al equipo de desarrollo. No crear issues públicos para vulnerabilidades de seguridad.

---

*Documento elaborado en cumplimiento con ISO/IEC 27001:2022 — Controles A.9, A.10, A.12, A.13, A.14*
