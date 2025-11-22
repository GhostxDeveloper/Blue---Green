#!/bin/bash
set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
ENV_FILE="/home/deploy/bluegreen/.env.deployment"
NGINX_CONF="/etc/nginx/sites-available/bluegreen"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Blue-Green Deployment Switch${NC}"
echo -e "${BLUE}========================================${NC}"

# Verificar que existe el archivo de environment
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}ERROR: No se encuentra $ENV_FILE${NC}"
    exit 1
fi

# Leer deployment activo actual
source $ENV_FILE
echo -e "${YELLOW}Deployment activo actual: $ACTIVE_DEPLOYMENT${NC}"

# Determinar nuevo deployment
if [ "$ACTIVE_DEPLOYMENT" = "blue" ]; then
    NEW_DEPLOYMENT="green"
    NEW_PORT="8082"
    OLD_PORT="8081"
else
    NEW_DEPLOYMENT="blue"
    NEW_PORT="8081"
    OLD_PORT="8082"
fi

echo -e "${YELLOW}Cambiando a: $NEW_DEPLOYMENT (puerto $NEW_PORT)${NC}"

# Verificar que el nuevo contenedor está respondiendo
echo -e "${YELLOW}Verificando health del contenedor $NEW_DEPLOYMENT...${NC}"

HEALTH_CHECK=false
for i in {1..5}; do
    if curl -sf http://127.0.0.1:$NEW_PORT/ > /dev/null 2>&1; then
        HEALTH_CHECK=true
        echo -e "${GREEN}Contenedor $NEW_DEPLOYMENT está healthy${NC}"
        break
    fi
    echo "Intento $i/5: Esperando respuesta del contenedor..."
    sleep 3
done

if [ "$HEALTH_CHECK" = false ]; then
    echo -e "${RED}ERROR: El contenedor $NEW_DEPLOYMENT no responde en puerto $NEW_PORT${NC}"
    echo -e "${RED}Abortando switch. El deployment activo sigue siendo: $ACTIVE_DEPLOYMENT${NC}"
    exit 1
fi

# Actualizar configuración NGINX
echo -e "${YELLOW}Actualizando configuración de NGINX...${NC}"
sudo sed -i "s/server 127.0.0.1:$OLD_PORT/server 127.0.0.1:$NEW_PORT/" $NGINX_CONF

# Verificar configuración de NGINX
echo -e "${YELLOW}Verificando configuración de NGINX...${NC}"
if ! sudo nginx -t; then
    echo -e "${RED}ERROR: Configuración de NGINX inválida${NC}"
    # Revertir cambio
    sudo sed -i "s/server 127.0.0.1:$NEW_PORT/server 127.0.0.1:$OLD_PORT/" $NGINX_CONF
    exit 1
fi

# Recargar NGINX
echo -e "${YELLOW}Recargando NGINX...${NC}"
sudo systemctl reload nginx

# Actualizar archivo de estado
echo "ACTIVE_DEPLOYMENT=$NEW_DEPLOYMENT" > $ENV_FILE

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Switch completado exitosamente!${NC}"
echo -e "${GREEN}   $ACTIVE_DEPLOYMENT -> $NEW_DEPLOYMENT${NC}"
echo -e "${GREEN}========================================${NC}"

# Mostrar estado actual
echo ""
echo -e "${BLUE}Estado actual:${NC}"
echo -e "  Ambiente activo: ${GREEN}$NEW_DEPLOYMENT${NC}"
echo -e "  Puerto activo: ${GREEN}$NEW_PORT${NC}"
echo -e "  Ambiente standby: ${YELLOW}$ACTIVE_DEPLOYMENT${NC}"
echo -e "  Puerto standby: ${YELLOW}$OLD_PORT${NC}"
