---
title: matery主题配置进阶二
author: Awesone
top: false
cover: false
comments: true
toc: true
copyright: true
date: 2026-06-08 16:51:00
img:
coverImg:
password:
summary:
categories:
	- 博客搭建
	- 评论系统
	- Hexo
tags:
	- Hexo
	- 个人博客
---

### 引言
  博客搭建好后，如创建了新的文章或者需要单独留言之类的，需要我们有一个留言功能以实现。现阶段我们可用的评论系统有很多,如Waline、Gitalk、Gitment、Disqus、Livere、Valine、Minivaline、Changyan等等，下面将对常用的评论系统进行说明。

- Valine评论系统基于LeanCloud存储,根据LeanCloud官方2026年发布的公告,在2026年1月12日起停止新用户注册和创建新应用,Valine就不讨论了。


### 正文内容


#### 一、Gitalk
  主要涉及 GitHub OAuth 应用创建、仓库准备、github代理服务的搭建、以及主题配置文件的修改。Matery 主题通常内置了对 Gitalk 的支持，因此无需手动编写复杂的模板代码，只需正确配置即可。以下是详细的操作步骤：
  
##### (一) 在 GitHub 上创建 OAuth App
 登录 GitHub，点击右上角头像，选择 ‌Settings‌。
在左侧菜单栏底部找到 ‌Developer settings‌，点击进入。
选择 ‌OAuth Apps‌，然后点击 ‌New OAuth App‌。
填写以下信息：
‌Application name‌: 任意名称（如 MyBlogGitalk）。
‌Homepage URL‌: 你的博客首页地址（例如 https://yourname.github.io）。
‌Authorization callback URL‌: 同样填写你的博客首页地址（例如 https://yourname.github.io）。
点击 ‌Register application‌。
注册成功后，你会看到 ‌Client ID‌ 和 ‌Client Secret‌。‌请妥善保管 Client Secret‌，后续配置需要用到。
##### (二) 创建用于存储评论的仓库
在 GitHub 上创建一个新的公共仓库（Public Repository）。
仓库名称可以任意，例如 blog-comments 或 gitalk-comments。
‌注意‌：记住这个仓库的名称和你的 GitHub 用户名，后续配置需要用到。
（可选）确保该仓库已初始化，或者至少有一个文件，以避免某些边缘情况。

##### (三) 基于Vercel创建github代理服务
 
###### 1. 创建 Vercel 项目
- 登录 [ Vercel](https://vercel.com/)
- 点击 ‌"Add New..."‌ -> ‌"Project"‌。
- 您可以选择导入一个空的 GitHub 仓库，或者直接在本地创建一个文件夹。
‌推荐方式‌：在本地创建一个文件夹 gitalk-proxy，并在其中初始化 Git 仓库推送到 GitHub，然后从 GitHub 导入到 Vercel。这样方便后续修改代码。

###### 2. 编写代理代码
在您的项目根目录下，创建文件夹结构如下：
vercel-gitalk-proxy/
├── api/
│   └── proxy.js  (或者 proxy.ts)
├── package.json  (可选，如果需要安装依赖)
└── vercel.json   (可选，用于配置路由)

- api/proxy.js 代码内容：
```
module.exports = async (req, res) => {
  // 1. 设置 CORS 头，允许任何域名访问（因为 Gitalk 可能部署在任何地方）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 2. 处理预检请求 (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. 只处理 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { code, state } = req.body;

    // 4. 验证必要参数
    if (!code) {
      return res.status(400).json({ error: 'Missing code parameter' });
    }

    // 5. 从环境变量获取 GitHub 配置
    const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('Missing env vars');
      return res.status(500).json({ error: 'Server Configuration Error' });
    }

    // 6. 向 GitHub 交换 Access Token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        state: state,
      }),
    });

    const tokenData = await tokenResponse.json();

    // 7. 如果 GitHub 返回错误，转发错误
    if (tokenData.error) {
      return res.status(400).json(tokenData);
    }

    // 8. 返回 Access Token 给前端
    return res.status(200).json({
      access_token: tokenData.access_token,
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
```
- package.json代码内容：

```
{
  "name": "vercel-proxy",
  "version": "1.0.0",
  "description": "A simple proxy deployed on Vercel",
  "main": "api/proxy.js"
}
```
- vercel.json代码内容：
```
{
  "version": 2,
  "builds": [
    {
      "src": "api/proxy.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/proxy",
      "dest": "api/proxy.js"
    }
  ]
}
```
###### 3. 配置环境变量
- 在 Vercel 项目页面，进入 ‌Settings‌ -> ‌Environment Variables‌。
添加两个变量：
- GITHUB_CLIENT_ID: 您的 GitHub OAuth App 的 Client ID
- GITHUB_CLIENT_SECRET: 您的 GitHub OAuth App 的 Client Secret
- 保存后，Vercel 会自动重新部署项目以应用新变量。

###### 4. 绑定自定义子域名（关键步骤）
- 在 Vercel 项目页面，进入 ‌Settings‌ -> ‌Domains‌。
 输入您想要的子域名：gitalk.personyzh.cn。
- 点击 ‌Add‌。
Vercel 会提示您验证域名。它会要求您在 DNS 中添加一条 ‌CNAME 记录‌。
‌
- 回到阿里云 DNS 控制台‌：
- 添加一条记录：
‌主机记录‌：gitalk
‌记录类型‌：CNAME
‌记录值‌：cname.vercel-dns.com (或者 Vercel 提示的具体地址，通常是 your-project-name.vercel.app 的别名，但推荐使用 cname.vercel-dns.com 以获得更好的稳定性)。
‌注意‌：不要加 https://，只填域名。
回到 Vercel 点击 ‌Verify‌。验证通过后，Vercel 会自动为您签发 SSL 证书。

###### 5. 配置 Gitalk
现在，您的代理地址是：https://gitalk.personyzh.cn/api/proxy
在您博客的 Gitalk 配置中，将 proxy 字段修改为上述地址。
‌Hexo/matery主题示例：

```
gitalk:
  enable: true
  clientID: YOUR_GITHUB_CLIENT_ID
  clientSecret: YOUR_GITHUB_CLIENT_SECRET
  repo: YOUR_REPO_NAME
  owner: YOUR_GITHUB_USERNAME
  admin: YOUR_GITHUB_USERNAME
  proxy: https://gitalk.personyzh.cn/api/proxy
  distractionFreeMode: false

```
##### (四)  配置 Matery 主题
打开你的 Hexo 博客根目录下的主题配置文件。
路径通常为：themes/matery/_config.yml
‌注意‌：不是博客根目录下的 _config.yml，而是主题文件夹内的。
找到 gitalk 配置项。如果不存在，可以在文件末尾添加。Matery 主题通常默认包含该配置结构，只需修改值即可。

修改配置如下：
```
# Gitalk 评论模块的配置
gitalk:
  enable: true          # 是否启用 Gitalk，改为 true
  owner: 'YourGitHubUsername'   # 你的 GitHub 用户名
  repo: 'blog-comments'         # 之前创建的用于存储评论的仓库名称
  oauth:
    clientId: 'YourClientID'      # 第一步中获得的 Client ID
    clientSecret: 'YourClientSecret' # 第一步中获得的 Client Secret
  admin: ['YourGitHubUsername'] # 管理员列表，通常是你的 GitHub 用户名，用于初始化评论
  labels: ['Gitalk']            # Issue 标签，可自定义
  perPage: 10                   # 每页显示的评论数
  pagerDirection: last          # 分页方向，last 表示从后往前
  createIssueManually: false    # 是否手动创建 Issue，false 表示自动创建
  distractionFreeMode: false    # 无干扰模式
```
‌关键参数说明：‌

enable: 必须设置为 true 才能生效。
owner: 必须是 GitHub 用户名，区分大小写。
repo: 必须是第二步中创建的仓库名称，而不是仓库地址。
admin: 数组格式，包含拥有写入权限的 GitHub 用户名。首次加载页面时，需要以 admin 账号登录 GitHub 并访问文章页面，Gitalk 才会自动在仓库中创建对应的 Issue。

##### (五) 部署与初始化
在博客根目录下打开bash执行以下命令重新生成并部署博客：
hexo clean
hexo g
hexo d

‌初始化评论‌：
部署完成后，使用浏览器访问你的博客文章页面。
‌务必使用你在 admin 字段中配置的 GitHub 账号登录‌。
滚动到评论区，如果看到 “Login with GitHub” 按钮，点击登录。
登录后，Gitalk 会自动在该仓库中为当前文章创建一个对应的 Issue。
刷新页面，你应该能看到评论框已经正常显示。

#### 二、Waline

  waline代理服务器的配置参考这篇文章:[Vercel配置waline服务](https://waline.js.org/guide/get-started)
  
#### 三、















### 结语
----
 如在配置评论系统的过程中,有任何问题可留言,我协助大家一起解决!