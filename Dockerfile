# 使用Node.js 22的轻量级基础镜像
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package.json package-lock.json ./

# 安装依赖
RUN npm ci

# 复制项目源代码
COPY . .

# 构建Next.js应用
RUN npm run build

# 暴露容器端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
