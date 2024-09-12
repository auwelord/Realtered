# Utiliser une image de base Node.js
FROM node:21.4-alpine as build-stage

# Définir le répertoire de travail
WORKDIR /app

# Copier le fichier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier les fichiers du projet
COPY . .

RUN npm run build

# Étape de production (Nginx)
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]