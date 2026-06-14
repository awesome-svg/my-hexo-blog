---
title: matery主题添加动漫模型
author: Awesone
top: false
cover: false
comments: true
toc: true
copyright: true
date: 2026-06-14 16:52:50
img:
coverImg:
password:
summary:
categories:
  - Hexo
  - Live2d
tags:
  - 模型
  - 2D
---

<!-- 在此处开始撰写正文 -->
在Hexo的Matery主题中增加“动漫模型”（通常指 ‌Live2D 看板娘‌，即屏幕角落可交互的二次元角色），可以通过引入live2d-widget插件轻松实现。

以下是详细步骤：
1. 安装 Live2D 插件
在博客根目录执行以下命令安装插件：
```
npm install --save hexo-helper-live2d

```
2. 配置插件
打开博客‌根目录‌下的 _config.yml 文件（注意：不是主题目录下的），在文件末尾添加以下配置：

```
# Live2D 看板娘配置
live2d:
  enable: true
  scriptFrom: local # 默认使用本地资源
  pluginRootPath: live2dw/ # 插件在站点上的根目录(相对路径)
  pluginJsPath: lib/ # 脚本文件相对与插件根目录路径
  pluginModelPath: assets/ # 模型文件相对与插件根目录路径
  tagMode: false # 标签模式, 是否仅替换 live2d tag 内容而非插入到整个页面
  debug: false # 是否开启调试模式, 开启后会在控制台打印日志
  model:
    use: live2d-widget-model-shizuku # 使用的模型名称，可更换
  display:
    position: right # 显示位置：left 或 right
    width: 150 # 模型宽度
    height: 300 # 模型高度
    hOffset: 0 # 水平偏移量
    vOffset: -20 # 垂直偏移量
  mobile:
    show: false # 移动端是否显示，建议关闭以节省性能
  react:
    opacity: 0.7 # 透明度
```
🎨 常用模型推荐
你可以将 model.use 替换为以下任意一个模型包（需先安装对应的 npm 包）：
| 模型名称 | npm 安装命令 | 风格描述 |
| --- | --- | --- |
| ‌shizuku‌ (默认) | npm install live2d-widget-model-shizuku | 经典白衣少女 |
| ‌z16‌ | npm install live2d-widget-model-z16 | 蓝发科技感少女 |
| ‌miku‌ | npm install live2d-widget-model-miku | 初音未来 |
| ‌tororo‌ | npm install live2d-widget-model-tororo | 绿色头发少女 |
| ‌hibiki‌ | npm install live2d-widget-model-hibiki | 黑发少女 |
| ‌koharu‌ | npm install live2d-widget-model-koharu | 可爱型少女 |

例如，如果你想用初音未来，先执行 npm install live2d-widget-model-miku，然后将配置中的 use 改为 live2d-widget-model-miku。

3. 重新生成站点

```
hexo clean && hexo g && hexo s
```
4. 自定义交互（可选）
如果你希望点击模型有语音或特定动作，可以在 themes/matery/source/js/ 下新建 live2d-extra.js，并在 footer.ejs 中引入。但大多数基础模型已内置了鼠标跟随、点击触摸反馈等基础交互。
5. 常见问题排查
- 模型不显示‌：检查浏览器控制台是否有 404 错误，确保 npm install 成功且模型包已下载。
- 移动端遮挡内容‌：建议在配置中将 mobile.show 设为 false，因为手机屏幕较小，看板娘容易遮挡阅读区域。
- 位置调整‌：通过修改 display 下的 hOffset（水平）和 vOffset（垂直）来微调位置。

💡 进阶：添加对话框

如果需要更复杂的对话功能，可以结合 live2d-widget 的 waifu-tips.json 配置，但这通常需要更深入的定制。对于大多数用户，上述步骤已足够实现“增加动漫模型”的需求。




