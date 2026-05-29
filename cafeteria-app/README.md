# ☕ CaféSchool — Cafetería Escolar/Universitaria

**Stack:** Django REST Framework · React.js · Stripe · Google OAuth2 · QR Code

---

## 🚀 Inicio Rápido

### Backend (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env       # Completa con tus claves reales
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend (React)
```bash
cd frontend
npm install
cp .env.example .env       # Completa con tus claves de Stripe y Google
npm start
```

---

## ⚙️ Variables de Entorno Necesarias

### Backend (`.env`)
| Variable | Dónde obtenerla |
|----------|----------------|
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → Developers → API keys → Secret key (test) |
| `STRIPE_PUBLISHABLE_KEY` | Mismo lugar → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | dashboard.stripe.com → Developers → Webhooks → Add endpoint → Signing secret |
| `GOOGLE_CLIENT_ID` | console.cloud.google.com → Credenciales → OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Mismo lugar |

### Frontend (`.env`)
```env
REACT_APP_GOOGLE_CLIENT_ID=tu-cliente-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:8000
```

---

## 🧪 Datos de Prueba

```bash
# Cargar datos de ejemplo (categorías y productos)
python manage.py loaddata initial_data.json
```

---

## 📁 Estructura del Proyecto

```
cafeteria-app/
├── backend/
│   ├── apps/
│   │   ├── authentication/   # Perfiles, Google OAuth, JWT
│   │   ├── products/         # Catálogo, categorías, alérgenos
│   │   ├── orders/           # Pedidos, ítems, generación QR
│   │   └── payments/         # Integración Stripe Sandbox
│   ├── cafeteria/            # Settings, URLs, WSGI
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── context/           # AuthContext, CartContext, FavoritesContext
        ├── hooks/             # useProducts, useOrders
        ├── services/          # api.js (Axios), stripeService.js
        ├── components/        # Navbar, ProductCard, QRModal, etc.
        └── pages/             # Welcome, Login, Catalog, Cart, Admin, etc.
```
