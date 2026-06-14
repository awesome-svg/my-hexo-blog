---
title: 我的blog介绍
author: Awesone
top: true
cover: false
comments: true
toc: true
copyright: true
date: 2026-06-08 16:46:55
img:
coverImg:
password:
summary:
categories: 
  - Hexo
  - 博客记录
tags:
	- Hexo
---

<!-- 在此处开始撰写正文 -->

#### 说明

本篇文章主要是用来记录我的博客实现的功能、未完成的功能、存在的bug等等，便于自己以后查阅。

##### 一、根目录和主题目录的区别

###### 1. 根目录（站点根目录）
（1）定义：指执行 hexo init 命令后生成的整个博客项目的顶层目录。
（2）包含内容：
- 全局配置文件 _config.yml（控制站点基本信息、URL、部署、插件等）
- 文章存放目录 _posts/
- 页面资源目录 source/
- 草稿目录 _drafts/
- Node.js 依赖管理文件 package.json
- 作用：管理整个博客站点的全局设置和内容结构。
  
###### 2. 主题目录
（1）定义：位于根目录下的 themes/ 文件夹中，每个主题（如 next、yilia、hueman）都有一个独立子目录。
（2）包含内容：
- 主题专属配置文件 _config.yml（覆盖或扩展根配置，控制样式、布局、组件等）
- 布局模板文件（如 layout/ 中的 .ejs 或 .swig 文件）
- 静态资源（如 source/ 中的 CSS、JS、图片）
- 语言文件（languages/）
- 作用：定义博客的外观、交互和部分功能行为。

###### 3. 关键区别
- 配置优先级：Hexo 会先读取根目录的 _config.yml,再加载主题目录的 _config.yml;若两者存在相同配置项，主题配置通常优先（具体取决于主题实现）
- 修改建议：
	站点相关设置（如标题、URL、部署）→ 修改根目_config.yml
	主题样式或组件（如导航栏、配色、侧边栏）→ 修改对应主题目录下的 _config.yml  
  
  
 ##### 二、已实现的功能
 
1. 天气控件显示
2. 评论留言系统功能设置（各种评论）
3. 添加留言板功能
4. 在关于板块,加入简历页
5. 整体替换Banner图片和文章特色图片
6. 增加分类相册功能	
7. 去掉标签页,将其合并至分类页中
8. 修改了一些控件的参数,优化显示
9. 添加页面雪花飘落动效
   在主题的layout/_partial/head.ejs文件中插入下列代码。
   ```
    <link rel="stylesheet" href="/css/snow.css">
	<div id="snowzone">
	</div> 
	<script src="/js/snow.js"></script>
   ``` 
10. 添加在线聊天插件(meiqia) :smile:
11. 加入图片懒加载功能，在根目录配置文件开启和关闭	
12. 支持emoji表情，用markdown emoji语法书写直接生成对应的能跳跃的表情。
13. 增加网站运行时间显示
14. 添加页面樱花飘落动效	
15. 添加鼠标点击烟花爆炸动效	
16. 添加鼠标点击文字特效	
17. 增加视听[视觉听觉影音]板块- douBan
18. 增加动漫模型(看板娘)	
  
 ##### 三、待实现的功能
  

1.


##### 四、遗留的问题
 
1. 简历增加侧边快速导航功能
	```
 	<nav class="sidebar-nav">
        <div class="nav-item active" onclick="scrollToSection('home')" title="首页">
            <i class="fas fa-home"></i>
        </div>
        <div class="nav-item" onclick="scrollToSection('about')" title="基本资料">
            <i class="fas fa-user"></i>
        </div>
        <div class="nav-item" onclick="scrollToSection('skills')" title="专业技能">
            <i class="fas fa-code"></i>
        </div>
        <div class="nav-item" onclick="scrollToSection('education')" title="教育经历">
            <i class="fas fa-graduation-cap"></i>
        </div>
        <div class="nav-item" onclick="scrollToSection('experience')" title="工作经验">
            <i class="fas fa-briefcase"></i>
        </div>
    </nav>
	```
3.
 
##### 五、备忘录

 1. 在菜单栏添加二级菜单时，原主题默认将二级菜单原样显示，所以如果想显示中文,两种方法：
   - 将子菜单直接写为中文。
   - 修改菜单栏配置文件navigation.ejs和mobile-nav.ejs，不管几级菜单都添加进映射,方便统一，需要修改主题源代码
 2. 测试404错误代码，不要在本地测试，先部署到网页上
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
#### 结语
