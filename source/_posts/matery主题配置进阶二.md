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

- Valine评论系统基于LeanCloud存储,根据LeanCloud官方2026年发布的公告,在2026年1月12日起停止新用户注册和创建新应用,Valine就不讨论了.
- Disqus评论系统国内被墙,不翻墙基本加载不出来,embed.js和跨域接口脚本域名已经写死,不支持配置加proxy.
- Changyan评论系统:域名必须备案,新账号需要实名认证,否则几天后就无法使用.
- Minivaline评论系统:是Valine的轻量化分支,体积更小,依赖LeanCloud


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
  
#### 三、Gitment
##### (一) 注册 GitHub OAuth Application
 Gitment 基于 GitHub Issues 构建，因此首先需要获取 Client ID 和 Client Secret。

1.  登录 GitHub，进入 ‌Settings‌ > ‌Developer settings‌ > ‌OAuth Apps‌。
- 点击 ‌New OAuth App‌。
填写相关信息：
‌Application name‌: 任意名称（如 MyBlogGitment）。
‌Homepage URL‌: 你的博客首页地址（例如 https://yourname.github.io）。
‌Authorization callback URL‌: 同样填写你的博客首页地址或具体文章页面地址（通常填首页即可，Gitment 会自动处理）。
- 点击 ‌Register application‌。
- 注册成功后，你将获得 ‌Client ID‌ 和 ‌Client Secret‌，请妥善保存。
##### (二) 修改 Matery 主题配置文件
打开 Matery 主题目录下的 _config.yml 文件（路径通常为 themes/hexo-theme-matery/_config.yml），找到评论系统配置部分。

1. 启用 Gitment
在配置文件中找到 comments 或 gitment 相关字段，进行如下配置：

```
# 评论系统配置
comments:
  use: gitment # 将这里修改为 gitment，如果之前是 gitalk 或其他，需切换

# Gitment 具体配置
gitment:
  enable: true # 确保启用
  owner: your_github_username # 你的 GitHub 用户名
  repo: your_repo_name # 用于存储评论的仓库名称（可以是博客所在的仓库，也可以是新创建的专用仓库）
  client_id: your_client_id # 填入第1步获得的 Client ID
  client_secret: your_client_secret # 填入第1步获得的 Client Secret
  perPage: 10 # 每页评论数
  pagerDirection: last # 评论排序方向，'last' 为最新在前

```
2. 修改gitment样式
 Gitment 评论显示在评论框（输入区域）上方是由其‌默认的代码渲染逻辑‌和‌DOM 结构顺序‌决定的，这被视为该插件的一个设计缺陷或固有特性。
 
- 修改gitment.ejs文件
在gitment.render('gitment-content')后面添加代码块。
```
gitment.render('gitment-content');

// 等待Gitment渲染完成后再操作DOM
window.addEventListener('load', function() {
  const rootContainer = document.querySelector('.gitment-root-container');
  if (!rootContainer) return;
  
  // 获取所有子容器
  const header = rootContainer.querySelector('.gitment-header-container');
  const comments = rootContainer.querySelector('.gitment-comments-container');
  const editor = rootContainer.querySelector('.gitment-editor-container');
  const footer = rootContainer.querySelector('.gitment-footer-container');
  
  // 清空根容器
  rootContainer.innerHTML = '';
  
  // 重新按输入框→评论列表→头部→底部的顺序添加
  rootContainer.appendChild(editor);
  rootContainer.appendChild(comments);
  rootContainer.appendChild(header);
  rootContainer.appendChild(footer);
});
```
- 在你的博客自定义 CSS 文件（如 source/css/custom.css 或主题提供的自定义样式入口）中添加以下代码：

```
/* 1. 强制根容器为Flex布局并提升优先级 */
.gitment-root-container {
	font-family: 'myFont', sans-serif;
    display: flex !important;
    flex-direction: column !important;
    height: auto !important;
}

/* 2. 让所有子容器占满宽度 */
.gitment-root-container > .gitment-container {
    width: 100% !important;
    box-sizing: border-box !important;
}

/* 3. 核心：通过order重新排序 */
.gitment-header-container {
    order: 1 !important;
	margin-bottom: 10px;
}
.gitment-editor-container {
    order: 2 !important;
}
.gitment-comments-container {
    order: 3 !important;
}
.gitment-footer-container {
    order: 4 !important;
}
```
3. gitment无法登录的解决方案
  Gitment无法登录主要是因为其依赖的认证服务器无法正常访问。Gitment‌ 评论系统使用 https://gh-oauth.imsun.net是官方提供的 ‌GitHub OAuth 代理服务器。
    
- 当前状况与替代方案
 这个由 Gitment 原作者维护的公共服务已经不稳定或停止服务‌，这是导致很多用户部署 Gitment 后无法登录的主要原因。

‌如果您正在搭建博客评论系统并遇到登录问题，可以参考以下解决方案：‌

- 使用其他可用的公共代理服务器‌：社区中有其他开发者搭建了类似的代理服务，您可以在 Gitment 的 JS 代码中替换 gh-oauth.imsun.net 为其他可用地址（需谨慎选择可信来源）。
‌
- 自行部署代理服务器‌：您可以克隆 [ imsun/gh-oauth-server](https://github.com/imsun/gh-oauth-server) 这个仓库，将其部署到自己的服务器（如 Heroku, Vercel 等）上，然后在 Gitment 配置中指向您自己的服务器地址。这是最可靠的方法。
‌
- 考虑迁移到其他评论系统‌：由于 Gitment 已停止维护，您也可以考虑迁移到其分支 Gitalk，或更现代的 Waline、Twikoo 等评论系统，它们通常有更活跃的维护和更简单的配置。


#### 四、Livere

Matery主题原生支持Livere（来必力）评论系统，以下是完整的详细配置步骤：

##### (一) 官网注册获取配置信息
 首先前往‌Livere（来必力）官网‌注册账号，选择免费的City版完成安装，安装后会生成City版安装代码，从中提取出client-id参数，你也可以进入管理页面→代码管理→一般网站查看该信息。

##### (二) 修改主题配置文件
打开Matery主题的配置文件：themes/hexo-theme-matery/_config.yml， 在文件末尾新增以下Livere配置项：

```
# Livere评论系统
livere:
  enable: true
  clientId: : 这里替换成你自己的client-id

```
##### (三)  添加评论模块模板
- 在Matery主题的共用模块目录themes/hexo-theme-matery/layout/_partial下，新建文件livere.ejs
- 将你从Livere官网获取的‌完整City版安装代码‌粘贴到新建的livere.ejs文件中保存

```
<div class="livere-card card" data-aos="fade-up">
    <!-- 来必力新版 (V11) 安装代码 -->
    <div id="lv-container" class="card-content">
        <livere-comment client-id="<%- theme.livere.clientId %>"  data-lang="zh_CN"></livere-comment>
    </div>
    <script type="module" src="https://www.livere.org/livere-widget.js"></script>
    <!-- 新版安装代码已完成 -->
</div>

```

##### (四)  引入评论模块到文章页
打开文章详情模板文件themes/hexo-theme-matery/layout/_partial/post-detail.ejs（部分旧版本路径为post.ejs），在你需要显示评论框的位置添加以下引用代码：

```
<%if(theme.Livere && theme.Livere.enable) { %>
  <%-partial('_partial/livere') %>
<% } %>

```
##### (五) 重新部署生效
执行Hexo清理、生成、部署命令，完成后即可看到Livere评论系统生效

----
 存在的问题：
 
1. 本地测试时界面显示错乱，需要在Livere官网申请安装本地测试的网站.
2. 在实际的生产过程中使用对应域名配置的clientId即可
----


### 结语

 如在配置评论系统的过程中,有任何问题可留言,我协助大家一起解决!