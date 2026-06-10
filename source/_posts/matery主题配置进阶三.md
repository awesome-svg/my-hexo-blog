---
title: matery主题配置进阶三
author: Awesone
top: false
cover: false
comments: true
toc: true
copyright: true
date: 2026-06-10 09:10:00
img:
coverImg:
password:
summary:
categories:
  - 博客搭建
  - Hexo
  - 特色功能
tags:
  - Hexo
  - 相册
  - 音乐播放器
  - CDN
---

<!-- 在此处开始撰写正文 -->

##### 一、分类相册
 
 要在原有matery主题的基础上实现分类相册功能，需要修改一些配置文件和相册渲染文件。
 
###### 1. 准备数据文件

确保你的博客根目录下存在 source/_data/gallery.json。

json文件应包含以下内容：
- name: 相册名称。
- cover: 相册封面图片路径。
- url_name: 相册的唯一标识，通常用于生成页面链接。
- album: 一个数组，包含该相册下的所有图片信息。
- img_url: 图片真实路径。
- title/describe: 图片标题和描述。

gallery.json文件的内容如下：
```
[
	{
	    "name": "旅行记录",
	    "cover": "/gallery/trival/1.jpg",
	    "description": "",
	    "url_name": "",
	    "album": [
			{
		    	"img_url": "/gallery/trival/1.jpg",
		    	"title": "",
		    	"describe": ""
	    	},
	   		{
		    	"img_url": "/gallery/trival/2.jpg",
		    	"title": "",
		    	"describe": ""
	    	}
	    ]	
	},
	{
		"name": "美食记录",
	    "cover": "/gallery/cuisine/10.jpg",
	    "description": "",
	    "url_name": "",
	    "album": [
			{
		    	"img_url": "/gallery/cuisine/10.jpg",
		    	"title": "",
		    	"describe": ""
	    	},
	   		{
		    	"img_url": "/gallery/cuisine/11.jpg",
		    	"title": "",
		    	"describe": ""
	    	}
	    ]
	}
]
```

###### 2. 创建局部模板 
在主题目录 themes/hexo-theme-matery/layout/_partial/ 下创建新文件 galleries.ejs。

这个文件负责渲染相册网格。我们将逻辑简化，直接接收一个相册对象进行渲染，或者根据名称查找。
<引入 BaguetteBox 样式和脚本 (如果全局未引入) >
<注意：Matery 通常全局引入了 baguetteBox，如果已引入可删除下面两行 >
```
<link rel="stylesheet" href="<%- theme.libs.css.baguetteBoxCss %>">
    <script src="<%- theme.libs.js.baguetteBoxJs %>"></script>
```
###### 3. 关于页面引用
推荐修改主题 layout/page.ejs：
- 打开 themes/hexo-theme-matery/layout/page.ejs。
-在 <%- page.content %> ‌  之后‌ 添加以下代码：
```
<% if (page.type === 'about' && site.data && site.data.gallery) { %>
		<hr>
		<h3 class="center-align">我的相册</h3>
		<!-- 调用刚才创建的 partial，传入想展示的相册名称 -->
		<%- partial('_partial/galleries', { galleryName: '我的生活' }) %>
	<% } %>
```
清理并重新生成运行文件，分类相册就实现了。    
- 如果需要在页面上显示特定相册，在galleries.ejs中添加：
```
<% if (page.type === 'about') { %>
    <hr style="margin: 30px 0;">
    <%- partial('_partial/galleries', { galleryName: '我的生活' }) %>
<% } %>
```
- 如果相册无法显示，可以在galleries.ejs顶部添加如下：
```
<!-- 调试开始 -->
	<div style="background: #ffebee; padding: 10px; border: 1px solid red; margin-bottom: 20px;">
		<p><strong>调试信息：</strong></p>
		<p>当前页面标题 (page.title): <strong><%= page.title %></strong></p>
		<p>查找的相册名称: <strong><%= typeof galleryName !== 'undefined' ? galleryName : page.title %></strong></p>
		<p>JSON 数据是否存在: <strong><%= !!site.data.gallery %></strong></p>
		<% if (site.data.gallery) { %>
			<p>JSON 中所有相册名称: 
				<% site.data.gallery.forEach(function(g){ %>
					[<%= g.name %>] 
				<% }); %>
			</p>
		<% } else { %>
			<p style="color:red">❌ 未检测到 site.data.gallery！请检查 source/_data/gallery.json 是否存在且格式正确。</p>
		<% } %>
	</div>
	<!-- 调试结束 -->
	<% 
	   // ... 原有的逻辑代码 ... 
	%>
```
     
###### 4. 性能优化
  
（1） 图片资源优化（最关键，效果最明显）
	图片通常占据页面流量的 80% 以上
- 格式转换 WebP：
	WebP 比 JPG/PNG 小 30%-50%。
	操作：使用工具（如 cwebp 或在线转换网站）将 source/gallery 下的图片批量转为 .webp。
- 修改 JSON：将 gallery.json 中的后缀改为 .webp。
	兼容性问题：Matery 主题较新版本支持 WebP，如果旧版不支持，可以使用 <picture> 标签或在 EJS 中做判断（较复杂），建议直接全站启用 WebP 并测试主流浏览器兼容性。
- 生成缩略图（Thumbnail）：
	痛点：在列表页或网格页加载原图（比如 5MB）是巨大的浪费。
	操作：为每张图片生成一张小尺寸缩略图（如宽 400px）。
- 目录结构建议：
 source/gallery/
	├── renwu/
	│   ├── thumb/       # 存放缩略图
	│   │   ├── 1.webp
	│   │   └── 2.webp
	│   ├── 1.webp       # 原图
	│   └── 2.webp
	修改 JSON：增加 thumb_url 字段。
	{
	  "img_url": "/gallery/renwu/1.webp",
	  "thumb_url": "/gallery/renwu/thumb/1.webp" 
	}     
- 修改 EJS
```
<!-- 列表/网格显示缩略图 -->
	<img src="<%- photo.thumb_url %>" data-src="<%- photo.img_url %>" ...>
``` 
（2）加载策略优化（Lazy Load & 预加载）
- 确保懒加载生效：
	之前的代码中我们已经加入了“暴力加载”逻辑，但这会一次性请求所有图片。
	优化：恢复标准的懒加载行为。只有当图片进入视口附近时才加载。
- 修改 EJS 中的 img 标签： 
```
<!-- 使用 loading="lazy" (现代浏览器原生支持，性能最好) -->
		<img class="responsive-img" 
			 src="<%- photo.thumb_url %>" 
			 loading="lazy" 
			 alt="<%= photo.title %>">
```	
注意：loading="lazy" 是 HTML5 原生属性，比 JS 实现的 lazyload 性能更好，且不依赖第三方库。
- 分页加载（如果图片超过 50 张）：
	如果一个相册有 100+ 张照片，一次性渲染 DOM 会卡顿。
	简单方案：在 showGalleryDetail 函数中，不要一次性 forEach 渲染所有图片，而是先渲染前 12 张，滚动到底部时再加载下一批（无限滚动）。
      
（3） Hexo 构建与 CDN 优化
- 开启 Hexo 压缩插件：
	安装 hexo-neat 或 hexo-minify，自动压缩 HTML、CSS 和 JS。    
```
bash
	npm install hexo-neat --save
```
- 在 `_config.yml` 中配置：   
```
 neat_enable: true
	  neat_html:
		enable: true
		exclude: ['*.ejs'] # 排除 ejs 防止报错
	  neat_css:
		enable: true
		exclude: ['*.min.css']
	  neat_js:
		enable: true
		exclude: ['*.min.js']
```
- 使用 CDN 加速静态资源‌
	将 source/gallery 目录下的图片托管到对象存储（如阿里云 OSS、腾讯云 COS、七牛云）并开启 CDN。
	‌修改 JSON‌：img_url 填写 CDN 域名地址（如 https://cdn.example.com/gallery/renwu/1.webp）。
	‌优势‌：CDN 边缘节点分发，加载速度远超 GitHub Pages 或普通服务器。
- 开启 Gzip/Brotli 压缩‌：
	如果你部署在 Nginx 或 Vercel/Netlify 上，确保开启了 Gzip 或 Brotli 压缩。这能显著减小 HTML 和 JSON 文件的传输体积。
      
（4）代码层面的微调
- 减少 DOM 节点深度：
	之前的 EJS 代码中，每个图片包裹了多层 div。尽量简化结构。
	例如，去掉不必要的 card 容器，直接使用 img 包裹在 a 标签中，配合 CSS Grid 布局。
- JSON 数据精简‌：
	gallery.json 中只保留必要字段。去掉空的 describe 或不需要的元数据。
 
🚀 推荐实施步骤（按优先级）
	第一步（必做）:图片压缩 + 格式转 WebP。这是零代码成本、收益最大的优化。
	第二步（必做）:启用 loading="lazy"。替换掉复杂的 JS 懒加载逻辑，利用浏览器原生能力。
	第三步（进阶）:生成缩略图。如果原图很大，这一步能将首屏流量降低 90%。
	第四步（高阶）:接入 CDN。将图片移至对象存储，彻底解决加载慢问题。     

###### 5. 添加标题
    
  给相册页添加标题，修改galleries.ejs在 <div id="gallery-app" ...>前加入标题代码。

```
<%
		var allGalleries = site.data.gallery || [];
	%>
	<!-- ================= 新增：相册主标题 ================= -->
	<div class="row" style="margin-top: 20px; margin-bottom: 30px;">
		<div class="col s12 center-align">
			<h3 style="font-weight: bold; color: #444; margin-bottom: 10px;">
				<i class="fas fa-images" style="color: #4285f4;"></i> 我的相册
			</h3>
			<p class="grey-text text-darken-1" style="font-size: 14px;">
				记录生活中的美好瞬间
			</p>
			<div style="width: 60px; height: 4px; background: #4285f4; margin: 10px auto; border-radius: 2px;"></div>
		</div>
	</div>
	<!-- ================= 标题结束 ================= -->
```
###### 6. 相册加密

增加相册的加密验证逻辑，使其能够针对‌单个相册‌进行验证，而不是整页验证。最佳方案是：
	‌在点击相册封面时，先进行密码验证，验证通过后才显示该相册的内容。
🚀 方案：点击相册时动态验证密码
  
（1）修改 gallery.json，为需要加密的相册添加密码
	在 source/_data/gallery.json 中，为你想要加密的相册添加 password 字段（明文密码，前端会哈希对比）：
（2） 修改 galleries.ejs，集成加密逻辑
改动逻辑：
	引入了 CryptoJS（如果主题未全局加载，会动态加载）。
	修改了 showGalleryDetail 函数：在显示相册前，检查是否有密码。如果有，弹出输入框验证。
	增加了‌会话缓存‌：验证一次后，刷新页面前无需再次输入（使用 sessionStorage）。	
（3）实现点击直接在新标签页打开原图，修改 galleries.ejs 中的两个地方：
- HTML 结构：将a标签的href指向原图，并添加 target="_blank"属性。
- JavaScript 逻辑‌：‌移除或注释掉 baguetteBox（灯箱效果），因为灯箱会拦截点击事件并在当前页面弹出大图，这与"新标签页打开"冲突。	


##### 二、音乐播放器

###### 1. 获取网易云HTML代码
 Hexo支持解析Markdown文件中的HTML代码，所以可以通过插入音乐界面HTML代码来生成音乐界面。我们可以构建单曲界面，也可以构建歌单界面，分别介绍如下。
 
 （1）单曲：打开网页版网易云音乐，播放要插入的单曲，点击生成外链播放器，这可以调用云音乐提供的iframe插件编辑器，调整尺寸，
		复制底部HTML代码，如下图：
 （2）歌单：打开网页版网易云音乐，打开要插入的歌单，我们要获取的是歌单id。打开歌单时，浏览器地址栏playlist?id=后就是歌单id，复制，黏贴替换下面HTML代码中的id：
```
<!--网易云音乐插件-->
		<!-- require APlayer -->
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css">
		<script src="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js"></script>
		<!-- require MetingJS-->
		<script src="https://cdn.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js"></script> 
		<!--网易云playlist外链地址-->   
		<meting-js
			server="netease"
			type="playlist" 
			id="110119120"
			mini="false"
			fixed="false"
			list-folded="true"
			autoplay="false"
			volume="0.4"
			theme="#FADFA3"
			order="list"
			loop="all"
			preload="auto"
			mutex="true">
		</meting-js>
```
 由于网易云禁用了一键式歌单外链，所以我们歌单界面用第三方插件Aplayer和Metingjs实现，Aplayer是一个功能强大的HTML5音乐播放器，而Metingjs基于Aplayer进行封装[1]，两者已集成到NexT插件pjax中。
  Metingjs封装控制语句参数见下表，可按需调整：

选项   	|	默认    | 描述
---|---|---
id(编号)	|			require		|					歌曲ID /播放列表ID /专辑ID /搜索关键字
server(平台)	 		|require						|	音乐平台：netease，tencent，kugou，xiami，baidu
type（类型）			|require						|song，playlist，album，search，artist
auto（支持类种 类）		|options							|音乐链接，支持：netease，tencent，xiami
fixed（固定模式）		|false								|		启用固定模式
mini（迷你模式）		|false					|	启用迷你模式
autoplay（自动播放）	|	false					|		音频自动播放
theme(主题颜色)			 | #2980b9					|					默认#2980b9
loop（循环）		|	all												|	播放器循环播放，值：“all”，one”，“none”
order(顺序)				|list										|	播放器播放顺序，值：“list”，“random”
preload(加载)			|auto										|		值：“none”，“metadata”，“'auto”
volume（声量）			|0.7									|	默认音量，请注意播放器会记住用户设置，用户自己设置音量后默认音量将不起作用
mutex（限制）		|	true							|	防止同时播放多个玩家，在该玩家开始播放时暂停其他玩家
lrc-type（歌词）	|	0								|歌词显示
list-folded（列表折叠）			|	false						|	指示列表是否应该首先折叠
list-max-height(最大高度)	|		340px				|			列出最大高度
storage-name（储存名称）		|	metingjs				|		存储播放器设置的localStorage键

##### 三、CDN加速
 1. 使用CDN加速的原因:
放在Github的资源在国内加载速度比较慢，因此需要使用CDN加速来优化网站打开速度，jsDelivr+Github便是免费且好用的CDN，非常适合博客网站使用。也可以选择主流云服务商提供的对象存储+CDN来获得更快速及稳定的访问效果，费用低到几乎可忽略。

 2. 用法：
	https://cdn.jsdelivr.net/gh/你的用户名/你的仓库名@发布的版本号/文件路径
	例如：
	https://cdn.jsdelivr.net/gh/lxl80/blog@gh-pages/medias/banner/1.jpg
	注意：版本号不是必需的，是为了区分新旧资源，如果不使用版本号，将会直接引用最新资源。
 3. 还可以配合 PicGo图床上传工具的自定义域名前缀来上传图片，使用极其方便。具体使用方法可参见: 
 使用Typora+iPic/PicGo图床+CDN实现高效Markdown创作


##### 结语
