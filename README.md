# HireReady — Aplicación web (Angular)

Frontend de HireReady, una plataforma para que estudiantes universitarios practiquen entrevistas laborales por voz y reciban retroalimentación generada con IA. La API está en [hireready-web-services](https://github.com/AuroraaPr/hireready-web-services).

Proyecto académico del curso Arquitectura de Aplicaciones Web — Universidad Peruana de Ciencias Aplicadas (UPC), 2026-1.

## Funcionalidades por rol

- **Postulante:** registro y perfil, bancos de preguntas de su carrera, simulación de entrevista con un avatar que lee las preguntas en voz alta, grabación de respuestas, reporte de retroalimentación, historial y dashboard de desempeño.
- **Empresa:** registro y perfil, creación y consulta de bancos de preguntas, dashboard.
- **Administrador:** dashboard general y gestión de postulantes, empresas, carreras y bancos de preguntas.

## Tecnologías

Angular 21 (NgModules) · TypeScript · Angular Material · ngx-charts · Web Speech API · Firebase Hosting

## Estructura

```
src/app
├── components     # vistas por rol: admin, applicant, company, auth y shared
├── guards         # acceso por rol (admin, empresa, postulante)
├── interceptors   # agrega el token JWT a cada petición
├── models         # interfaces de datos
├── services       # comunicación con la API
└── modules        # módulo de Angular Material
```

## Cómo ejecutarlo

Requisitos: Node.js y npm (versión compatible con Angular 21) y la API corriendo en local.

```bash
npm install
npm start
```

La aplicación abre en `http://localhost:4200` y usa la API definida en `src/environments/environment.development.ts` (`http://localhost:8080/hireready`).

Para generar la versión de producción:

```bash
npm run build
firebase deploy
```
