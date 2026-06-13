---
title: matery自建音乐播放api
author: Awesone
top: false
cover: false
comments: true
toc: true
copyright: true
date: 2026-06-13 17:56:56
img:
coverImg:
password:
summary:
categories:
  - matery
  - Hexo
  - 歌单
tags:
  - API
  - 音乐播放器
---

<!-- 在此处开始撰写正文 -->

##### 背景

原本在matery中添加音乐歌单功能使用的是公共免费 API:https://api.injahow.cn ,但是运行一段时间后出现问题，无法加载出歌单，详细错误如下：
 > musics:1 Access to fetch at 'https://api.injahow.cn/meting/?server=netease&type=playlist&id=7696612212&r=0.04103702528079056' from origin 'https://personyzh.cn' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
 >  
 
错误原因分析：
- 浏览器出于安全考虑（同源策略），禁止前端页面直接通过 JavaScript（如 fetch 或 XMLHttpRequest）请求不同域名下的资源（https://api.injahow.cn）
- 服务端未配置 CORS‌：api.injahow.cn 这个 API 接口没有在 HTTP 响应头中返回 Access-Control-Allow-Origin 字段，或者返回的值不包含你的域名 https://personyzh.cn
- ‌API 可能已失效或变更‌：公共免费 API 经常会出现服务不稳定、域名变更或停止支持 CORS 的情况

解决方案：
1. 更换可用的 Meting API 地址（最快解决）
很多公开的 Meting API 接口会因为流量过大或维护问题而关闭 CORS 支持。可以尝试替换为其他稳定的公共 API 地址，或者自行搭建。https://api.i-meto.com/meting/api (注：部分用户反馈此接口也可能不稳定，需测试)
‌推荐做法‌：自行部署 Meting API。你可以参考 GitHub 上的开源项目 injahow/meting-api 部署到自己的服务器上，这样你可以完全控制 CORS 配置。
2. 后端代理（Nginx/Node.js/PHP 等）
如果你有自己的后端服务器，可以通过后端发起请求，因为后端服务器之间通信不受浏览器 CORS 限制。
在你的 personyzh.cn 服务器的 Nginx 配置中添加一个反向代理：

```
location /api/meting/ {
    proxy_pass https://api.injahow.cn/meting/;
    # 如果需要处理头部，可以添加
    proxy_set_header Host api.injahow.cn;
}

```
在前端代码中，将请求地址改为 /api/meting/?server=netease...（即同域请求），从而绕过 CORS 限制。

‌以 Node.js (Express) 为例：

```
const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api/meting', async (req, res) => {
    try {
        const response = await axios.get('https://api.injahow.cn/meting/', { params: req.query });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch music data' });
    }
});

```
我采用方案一：自行部署自行部署 Meting API
##### 自行部署详细步骤

1. 准备项目代码
 由于 Vercel 需要特定的项目结构来识别 API 路由，建议直接使用适配了 Vercel 的 Meting API 开源项目。
- ‌获取代码‌
推荐克隆适配较好的仓库（例如 xizeyoupan/Meting-API 或类似分支），确保其包含 vercel.json 配置文件或标准的 API 目录结构。将其上传到git服务远端。
```
git clone https://github.com/xizeyoupan/Meting-API.git
cd Meting-API
```
2. 配置 Vercel 环境
Vercel 通过 vercel.json 或自动检测来构建项目。大多数现代 Node.js Meting API 项目已经包含了必要的配置。如果没有，你需要确保项目根目录下有正确的入口文件。

通常，API 请求会被映射到 /api 目录下的文件，或者通过 vercel.json 重写路由指向主入口。

- 导入Meting API 项目仓库
- 编译 部署
- 自定义域名
 （1）* .vercel.app 域名在中国大陆大部分地区无法直接访问，或被严重干扰。
 （2）绑定自定义域名‌：这是最推荐的方案。购买一个域名，并在 Vercel 的项目设置中添加该域名。Vercel 会自动配置 SSL 证书。
‌DNS 解析‌：将你的域名 CNAME 记录指向 cname.vercel-dns.com.
    我的自定义域名是：metingapi.personyzh.cn
3. 前端调用更新
部署完成后，将你前端代码（APlayer/MetingJS）中的 API 地址替换为新的 Vercel 地址：

```
// 旧地址
// api: 'https://api.injahow.cn/meting/'

// 新地址 (替换为你部署后的域名)
api: 'https://your-project-name.vercel.app' 
// 或者如果你绑定了自定义域名
// api: 'https://metingapi.personyzh.cn/api'

```
至此:自建的API就完成了，








##### 结语
