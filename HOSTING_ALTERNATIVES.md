# 🚀 Full Stack Хостинг для SolanaSwift

> **ВАЖНО:** Smart contracts деплоятся на Solana blockchain, НЕ на хостинг-платформы!  
> Хостинг нужен только для **frontend приложения**

## 🧠 Как работает Solana архитектура:

### Smart Contracts (Programs):
- ✅ Деплоятся на **Solana blockchain** (devnet/mainnet)
- ✅ Доступны через RPC endpoints
- ✅ Плата в SOL за деплой (~0.5-2 SOL)

### Frontend:
- ✅ Деплоится на **хостинг-платформы**
- ✅ Подключается к smart contracts через RPC
- ✅ Static files или SSR

## 🎯 Проблема с Vercel
- ❌ Нет поддержки Rust/Anchor CLI (но это НЕ нужно!)
- ✅ Отлично подходит для frontend
- ✅ Smart contracts отдельно на Solana

## ✅ Лучшие варианты для Full Stack деплоя

## 🎯 ПРАВИЛЬНЫЙ подход к деплою:

### 1. **Smart Contracts на Solana Devnet**
```bash
# Деплой smart contracts
solana config set --url https://api.devnet.solana.com
solana airdrop 2
anchor build
anchor deploy
# Сохранить Program ID
```

### 2. **Frontend на хостинг-платформах**

#### **Vercel** ⭐ (Рекомендуется)
- ✅ Идеально для Next.js
- ✅ Бесплатный план
- ✅ Автодеплой из GitHub
- ✅ Global CDN

**Инструкция:**
```bash
# 1. Изменить package.json в корне
{
  "scripts": {
    "build": "cd frontend && npm run build",
    "start": "cd frontend && npm start"
  }
}

# 2. Vercel deploy
cd frontend
npx vercel --prod
```

#### **Railway** 🚀 (Full Stack)
- ✅ Поддержка Docker
- ✅ $5 trial credit
- ✅ Rust + Node.js support

**Для демо с backend logic:**
```bash
# railway.app -> GitHub -> Deploy
# Использует наш Dockerfile
```

#### **Render** 🔥
- ✅ Бесплатный план
- ✅ Rust support
- ✅ Docker deployment

**Инструкция:**
```bash
# render.com -> GitHub -> Web Service
# Build Command: docker build .
# Start Command: cd frontend && npm start
```

#### **Fly.io** 🪝
- ✅ Бесплатный план
- ✅ Global edge deployment
- ✅ Docker native

**Инструкция:**
```bash
# 1. Установить flyctl
curl -L https://fly.io/install.sh | sh

# 2. Deploy
fly launch --name solanaswift-demo
fly deploy
```

#### **DigitalOcean App Platform**
- ✅ $5/месяц
- ✅ Predictable pricing
- ✅ Rust + Docker support

**Инструкция:**
```bash
# digitalocean.com -> Apps -> GitHub
# Dockerfile build
```

## 🐳 Универсальный Dockerfile

```dockerfile
# Multi-stage build для оптимизации
FROM rust:1.70 as builder

# Установка Solana и Anchor
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
RUN avm install latest && avm use latest

# Node.js для frontend
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

WORKDIR /app
COPY . .

# Build smart contracts
RUN anchor build

# Build frontend
WORKDIR /app/frontend
RUN npm ci --only=production
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/package*.json ./frontend/
COPY --from=builder /app/target ./target

WORKDIR /app/frontend
RUN npm ci --only=production

EXPOSE 3000
CMD ["npm", "start"]
```

## 📋 Чек-лист для деплоя

### Подготовка:
- [ ] Создать Dockerfile
- [ ] Добавить .dockerignore
- [ ] Настроить environment variables
- [ ] Обновить README с инструкциями

### Environment Variables:
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=11111111111111111111111111111112
```

### Файлы для добавления:
```bash
# .dockerignore
node_modules
.git
.env.local
target/debug
target/deploy
.anchor
```

## 🚀 Быстрый деплой (2 минуты)

### ⚡ Самый быстрый способ:

#### **Vercel (Frontend-only)**
```bash
cd frontend
npx vercel --prod
# Готово! URL в консоли
```

#### **Railway (Full Stack)**
```bash
# 1. Push на GitHub
# 2. railway.app -> GitHub repo -> Deploy
# 3. Готово!
```

### 📋 Environment Variables для всех платформ:
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=11111111111111111111111111111112
```

## 💡 Итоговые рекомендации

### 🏆 ДЛЯ ПРЕЗЕНТАЦИИ:
1. **Vercel** - frontend за 30 секунд  
2. **Smart contracts** - devnet за 2 минуты
3. **Итого**: Полный деплой за 3 минуты!

### 🔥 ДЛЯ ФУЛЛ-СТАК ДЕМО:
1. **Railway** - $5 trial, поддержка всего
2. **Fly.io** - бесплатно, глобальная сеть
3. **Render** - стабильно, бесплатный план

### 🚀 ДЛЯ ПРОДАКШЕНА:
1. **DigitalOcean** - предсказуемая цена
2. **Vercel Pro** - для frontend
3. **AWS/GCP** - enterprise масштаб

## 🎯 План Б: Frontend-only деплой

Если нужно показать только UI:

### Vercel (frontend-only):
```bash
# 1. Изменить package.json root
{
  "scripts": {
    "build": "cd frontend && npm run build",
    "start": "cd frontend && npm start"
  }
}

# 2. Vercel настройки:
# Build Command: cd frontend && npm run build
# Output Directory: frontend/.next
```

### Netlify:
```bash
# netlify.toml
[build]
  command = "cd frontend && npm run build && npm run export"
  publish = "frontend/out"
```

## ⚡ Экстренный вариант (за 2 минуты)

Если время поджимает:

```bash
# 1. Форк репозитория
# 2. Fly.io deploy
fly launch --name solanaswift-demo
fly deploy

# 3. Готово!
# URL: https://solanaswift-demo.fly.dev
```

## 📞 Поддержка

При проблемах с деплоем:
- Railway: отличная поддержка + Discord
- Render: хорошие доки
- Fly.io: активное community

**Время деплоя:** 3-7 минут  
**Стоимость:** $0-5/месяц  
**Надежность:** ⭐⭐⭐⭐⭐