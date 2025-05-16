# Gunakan image Node.js versi terbaru
FROM node:20

# Set direktori kerja di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Instal dependensi
RUN npm install

# Salin semua file proyek ke dalam container
COPY . .

# Ekspos port yang digunakan aplikasi
EXPOSE 5000

# Jalankan aplikasi
CMD ["npm", "start"]