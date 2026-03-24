# 🛠️ Help Desk Ticketing System (MVP)

Un sistema de gestión de tickets de soporte técnico (Help Desk) diseñado para ser rápido, intuitivo y escalable. Construido con una arquitectura moderna separando el frontend (React) y el backend (Flask REST API).

El sistema permite a los usuarios normales crear incidencias adjuntando capturas de pantalla, mientras que los técnicos y administradores disponen de un panel avanzado para asignar, gestionar, cambiar el estado y resolver dichos tickets.

---

## ✨ Características Principales

### 👤 Para Usuarios (Clientes)
- **Autenticación segura:** Registro e inicio de sesión protegidos mediante JWT.
- **Creación de Tickets:** Interfaz sencilla para reportar problemas (Título, Categoría, Prioridad, Descripción).
- **Subida de Archivos:** Posibilidad de adjuntar imágenes (PNG/JPG) o documentos (PDF) como evidencia visual.
- **Seguimiento:** Visualización del estado en tiempo real de sus propios tickets.

### 👨‍💻 Para Técnicos / Administradores
- **Dashboard Global:** Vista completa de todos los tickets del sistema con opciones de filtrado y ordenamiento.
- **Mi Cola de Trabajo:** Menú lateral deslizable (*Sidebar*) para acceso rápido a los tickets asignados pendientes.
- **Gestión Ágil:** 
  - Botón de auto-asignación ("Asignarme").
  - Cambio rápido de estados (*Abierto, En progreso, Cerrado*).
  - Modal de confirmación al cerrar un ticket para añadir notas de resolución/feedback.
- **Gestión de Archivos:** Capacidad para visualizar los archivos subidos por el usuario o adjuntar nuevos desde el panel de control.
- **Perfil de Usuario:** Menú desplegable con avatar para gestionar ajustes de cuenta y sesión.

---

## 📸 Capturas de Pantalla
| Login / Registro | Dashboard Principal (Técnico) |
| :---: | :---: |
| <img width="1420" height="897" alt="image" src="https://github.com/user-attachments/assets/600b92b1-9b80-4ec5-b60e-935c8e33fa5d" /> | <img width="1356" height="900" alt="image" src="https://github.com/user-attachments/assets/ccbc95c0-1776-4c1d-90d3-316961d2f0f7" /> |

| Modal de Detalles y Acciones | Creación de Ticket con Archivo |
| :---: | :---: |
| <img width="708" height="520" alt="image" src="https://github.com/user-attachments/assets/89487d94-ab45-4479-b3a7-7fa84257250e" />| <img width="1291" height="866" alt="image" src="https://github.com/user-attachments/assets/3299450f-2590-40cc-a56a-d7e8dee03691" />
 |

| Sidebar "Mi Cola" | Confirmación de Cierre (Feedback) |
| :---: | :---: |
| <img width="589" height="364" alt="image" src="https://github.com/user-attachments/assets/7c5abbb7-9202-4f90-8d60-98d479530b29" />| <img width="702" height="623" alt="image" src="https://github.com/user-attachments/assets/9bcd16c2-e1b6-47b9-893c-8710053b176b" />
 |

---

## 💻 Stack Tecnológico

### Frontend
- **React.js** (v18)
- **React Router Dom** (Navegación y rutas protegidas)
- **CSS Custom** (Diseño moderno, modo oscuro, layout Flexbox/Grid)
- **API Client Custom** (Fetch API nativo con interceptores para JWT)

### Backend
- **Python / Flask** (Framework REST API)
- **Flask-SQLAlchemy** (ORM para base de datos)
- **PostgreSQL** (Motor de Base de Datos recomendado) / SQLite (Desarrollo)
- **Flask-JWT-Extended** (Autenticación por tokens)
- **Flask-Bcrypt** (Cifrado de contraseñas)
- **Flask-CORS** (Manejo de peticiones cruzadas)
- **Werkzeug** (Gestión segura de subida de archivos)

---

## 🚀 Instalación y Despliegue Local

### 1. Clonar el repositorio
```
git clone https://github.com/tu-usuario/help-desk-mvp.git
cd help-desk-mvp
```
### 2. Configuración del Backend (Flask)
- Ve a la carpeta del backend:

```
cd backend
```
- Crea y activa un entorno virtual:

```
# En Windows
python -m venv venv
venv\Scripts\activate

# En Mac/Linux
python3 -m venv venv
source venv/bin/activate
Instala las dependencias:

pip install -r requirements.txt
```
- Configura las variables de entorno. Crea un archivo .env en la raíz de backend/:
```
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=tu_clave_secreta_super_segura
JWT_SECRET_KEY=tu_clave_jwt_super_segura
# DATABASE_URL=postgresql://usuario:pass@localhost/db_name (Si usas Postgres)
```
- Inicia el servidor de desarrollo (correrá en el puerto 5000):
```
flask run
```
### 3. Configuración del Frontend (React)
- Abre una nueva terminal y ve a la carpeta del frontend:
```
cd frontend
```
- Instala las dependencias de Node:
```
npm install
```
- Configura la URL de la API. Verifica que tu archivo src/api/apiClient.js apunte al puerto correcto:

```
const API_URL = 'http://127.0.0.1:5000';
```
Inicia la aplicación en desarrollo (correrá en el puerto 3000):
```
npm start
```

📂 Estructura del Proyecto
El proyecto está diseñado con un enfoque modular (Composición sobre Herencia):

```
help-desk-mvp/
├── backend/
│   ├── database/
│   │   └── dbHelpDesk.py      # Modelos SQLAlchemy (User, Ticket, Attachment, Feedback)
│   ├── tickets/
│   │   └── routes.py          # Endpoints CRUD de tickets y subida de archivos
│   ├── auth/                  # Endpoints de Login y Registro
│   ├── uploads/               # Directorio donde se guardan los archivos adjuntos
│   └── requirements.txt       # Dependencias de Python
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── apiClient.js       # Cliente HTTP centralizado con inyección de JWT
    │   ├── components/            # Componentes reutilizables
    │   │   ├── TicketTable.jsx    # Tabla principal con filtros y sort
    │   │   ├── TicketModal.jsx    # Orquestador del modal de detalles
    │   │   ├── QueueSidebar.jsx   # Menú lateral para técnicos
    │   │   ├── FileUploader.jsx   # Lógica drag&drop / input de archivos
    │   │   └── UserProfileDropdown.jsx 
    │   ├── pages/
    │   │   ├── Tickets.jsx        # Página principal (Dashboard)
    │   │   ├── CreateTicket.jsx   # Formulario de nuevo ticket
    │   │   └── Login.jsx          # Autenticación
    │   └── App.js                 # Enrutador (React Router)
    └── package.json
```
## ✍️ Autor
Desarrollado por Eliasmalx como Producto Mínimo Viable (MVP).
