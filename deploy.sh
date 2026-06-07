#!/bin/bash

# 服务器部署脚本
# 使用方法：在服务器上执行 bash deploy.sh

set -e

echo "========== 开始部署 =========="

# 1. 安装依赖
echo "1. 安装依赖..."
npm install --production

# 2. 创建环境变量配置
if [ ! -f .env ]; then
    echo "2. 创建 .env 配置文件..."
    cat > .env << 'EOF'
# 数据库配置
DB_HOST=你的数据库地址
DB_USER=你的数据库用户名
DB_PASSWORD=你的数据库密码
DB_NAME=rain_db

# 飞书配置
FEISHU_WEBHOOK=你的飞书Webhook地址
EOF
    echo "   请编辑 .env 文件填写实际配置"
else
    echo "2. .env 文件已存在，跳过创建"
fi

# 3. 导入数据库（如果有 sql 文件）
if [ -f rain_db.sql ]; then
    echo "3. 导入数据库..."
    read -p "请输入数据库地址: " DB_HOST
    read -p "请输入数据库用户名: " DB_USER
    read -s -p "请输入数据库密码: " DB_PASSWORD
    echo
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD rain_db < rain_db.sql
    echo "   数据库导入完成"
else
    echo "3. 未找到 rain_db.sql，跳过数据库导入"
fi

# 4. 启动服务
echo "4. 启动服务..."
pm2 delete rain-ranking 2>/dev/null || true
pm2 start app.js --name rain-ranking
pm2 save

echo "========== 部署完成 =========="
echo "服务状态："
pm2 status rain-ranking
echo ""
echo "查看日志：pm2 logs rain-ranking"
echo "健康检查：curl http://localhost:3000/health"
