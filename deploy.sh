#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

SERVER="aliyun"
REMOTE_DIR="/opt/rain-ranking"
LOG_FILE="deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
    echo -e "$1"
}

echo -e "${GREEN}========== 开始部署 ==========${NC}"
log "开始部署"

# 1. 同步代码到服务器
echo -e "${GREEN}1. 同步代码到服务器...${NC}"
log "同步代码到服务器"
rsync -avz --exclude 'node_modules' --exclude 'logs' --exclude '.env' --exclude 'deploy.log' \
    ./ $SERVER:$REMOTE_DIR/

if [ $? -ne 0 ]; then
    echo -e "${RED}代码同步失败，终止部署${NC}"
    log "代码同步失败"
    exit 1
fi
echo -e "${GREEN}代码同步成功${NC}"
log "代码同步成功"

# 2. 服务器安装依赖并重启
echo -e "${GREEN}2. 服务器安装依赖并重启...${NC}"
log "服务器安装依赖并重启"
ssh $SERVER << 'EOF'
cd /opt/rain-ranking
npm install --production
pm2 restart rain-ranking
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}========== 部署成功 ==========${NC}"
    log "部署成功"
else
    echo -e "${RED}========== 部署失败 ==========${NC}"
    log "部署失败"
    exit 1
fi
