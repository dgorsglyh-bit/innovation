#!/bin/bash

# Цветовые коды для вывода в терминал
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Запуск сайта 'Инновационная деятельность' для RedOS/Linux...${NC}"

# Проверка наличия Node.js
if ! command -v node &> /dev/null
then
    echo -e "${RED}Ошибка: Node.js не установлен.${NC}"
    echo -e "${YELLOW}Для установки на RedOS выполните команду:${NC}"
    echo -e "sudo dnf install nodejs"
    exit 1
fi

# Проверка версии Node.js (Next.js 16/React 19 требуют Node.js 18.18+)
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)

if [ "$MAJOR_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}Предупреждение: У вас установлена версия Node.js $NODE_VERSION. Рекомендуется версия 18.18 или выше.${NC}"
fi

# Установка зависимостей, если папка node_modules отсутствует
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Папка node_modules не найдена. Установка зависимостей...${NC}"
    npm install
fi

# Запуск сервера разработки
echo -e "${GREEN}Запуск сервера разработки...${NC}"
npm run dev
