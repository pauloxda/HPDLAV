# 🚀 Deploy do Projeto HPDLAV-main (FastAPI + React) no Render

Este projeto é composto por dois serviços separados:

- **Backend (API)**: FastAPI com MongoDB
- **Frontend (UI)**: React + Tailwind

---

## 🧩 Estrutura do Projeto

```
HPDLAV-main/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── start.sh        ← usado no Render
│
└── frontend/
    ├── package.json
    ├── public/
    ├── src/
    └── yarn.lock
```

---

## 🌐 1. Deploy do Frontend (React) no Render

### Etapas:
1. Acesse: [https://render.com](https://render.com)
2. Clique em: **New > Static Site**
3. Escolha o repositório `HPDLAV-main`
4. Preencha os campos:

| Campo              | Valor                 |
|--------------------|-----------------------|
| **Root Directory** | `frontend`            |
| **Build Command**  | `yarn build`          |
| **Publish Dir**    | `build`               |

> O Render irá gerar automaticamente uma URL pública do site React.

---

## ⚙️ 2. Deploy do Backend (FastAPI) no Render

### Pré-requisitos:
- MongoDB ativo (ex: MongoDB Atlas)
- Criar `.env` com as variáveis de conexão **(não subir no GitHub)**

#### 📁 Crie arquivo: `backend/start.sh`
```bash
#!/bin/bash
uvicorn server:app --host=0.0.0.0 --port=10000
```

#### 🛠️ Torne o script executável:
No terminal (Git Bash ou Linux/Mac):
```bash
chmod +x backend/start.sh
```

---

### Etapas no Render:
1. Vá em **New > Web Service**
2. Conecte seu GitHub
3. Escolha o repositório `HPDLAV-main`
4. Configure os parâmetros:

| Campo               | Valor                  |
|---------------------|------------------------|
| **Root Directory**  | `backend`              |
| **Runtime**         | Python 3.10            |
| **Build Command**   | `pip install -r requirements.txt` |
| **Start Command**   | `./start.sh`           |

### 🌱 Variáveis de Ambiente:
Adicione em "Environment Variables":

```
MONGO_URL=your_mongo_connection_url
DB_NAME=lavtruck
```

---

## 🧪 Testar Integração

No React (`frontend`), configure o `fetch` para usar a URL pública do backend:

```js
const apiUrl = "https://nome-backend.onrender.com/api";
fetch(`${apiUrl}/lavagens`)
```

---

## ✅ Resultado Final

| Serviço     | Tipo        | URL Render                              |
|-------------|-------------|------------------------------------------|
| Backend     | FastAPI     | `https://nome-backend.onrender.com/api` |
| Frontend    | React (SPA) | `https://nome-frontend.onrender.com`    |

---

## ⚠️ Importante

- ❌ Não suba o `.env` no GitHub
- ✅ Configure variáveis sensíveis apenas no painel do Render
- ✅ Use `yarn build` no React e `uvicorn` no FastAPI

---

Feito com ❤️ pela equipa HPDLAV
