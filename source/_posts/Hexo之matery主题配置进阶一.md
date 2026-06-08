---
title: Hexo之matery主题配置进阶一
author: Awesone
top: false
cover: false
comments: true
toc: 
	enable: true
	number: true
	expand_all: true
	max_depth: 6
copyright: true
date: 2026-06-05 07:16:51
img:
coverImg:
password:
summary:
categories:
	- 博客搭建
	- 教程
	- Hexo
tags: 
	- Hexo
	- 个人博客
---

<!-- 在此处开始撰写正文 -->

matery主题在配置完基础功能后，可以自己添加一些特色功能进去，可以让博客更加丰富多样，如增加天气显示，添加评论，添加音乐等等。以下是我自己的博客添加的一些功能，大家有好的建议欢迎在底下留言评论！
####  一、天气配置

#####  天气组件类型及可用性
1.  心知天气 (Seniverse)
 心知天气的自定义 Widget，因为它支持高度定制样式，能很好地融入 Matery 的头部或侧边栏。
 步骤： 
- 访问 [心知天气网](https://www.seniverse.com)并注册账号。
- 进入控制台，创建一个“免费版”产品。
- 在“产品设置”中获取你的 ‌私钥 (Private Key)‌。
- 在“IP定位”或“城市列表”中确认你希望默认显示的城市（如成都）。
- 添加 HTML/JS 代码

 存在的问题：
   心知天气文件地址 http://widget.seniverse.com/widget/chameleon.js 已失效
- 心知天气主官网和付费API服务‌：目前还能正常访问，付费用户的API接口可正常调用
- 免费的Chameleon变色龙天气Widget（就是我们之前用的嵌入组件）‌：原CDN资源（chameleon.js）已经404下线，官方文档也已经移除了这个组件的入口，这个服务确实已经不可用
- 停止维护所有免费的前端嵌入组件，只保留后端API服务
- 免费API调用额度从原来的每天1000次缩减到每天3次，基本无法个人使用
- 重心转向B端商业气象服务，不再对个人博客提供免费嵌入组件


2. 和风天气的插件，直接可用，无需申请API
  步骤：
- 在导航栏你想放天气的位置（搜索框旁）插入容器：

```
<div id="qweather-widget" class="navbar-item" style="display:flex;align-items:center;margin-right:15px;"></div>

```
- 在</body>前插入以下代码（无需申请密钥，直接用官方提供的免费轻量组件）：
 
```
<script type="text/javascript">
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('qweather-widget');
  if(!container) return;
  
  // 和风天气免费轻量组件，自动定位
  const script = document.createElement('script');
  script.src = 'https://widget.qweather.net/simple/static/js/he-simple-common.js';
  script.dataset.language = 'zh';
  script.dataset.unit = 'c';
  script.dataset.color = 'ffffff';
  // 这里替换成你的城市ID，成都是101270101
  script.dataset.location = '101270101';
  script.async = true;
  container.appendChild(script);
});
</script>

```
- 修改适配matery主题样式

```
/* 适配Matery导航栏的天气组件 */
#qweather-widget {
  color: #fff !important;
  font-size: 14px;
}
#qweather-widget .he-weather {
  line-height: 1 !important;
}
/* 移动端隐藏，节省空间 */
@media screen and (max-width: 768px) {
  #qweather-widget {
    display: none !important;
  }
}

```
存在的问题：
- 和风天气（QWeather）已经彻底弃用并下线了旧的 he-simple-common.js 轻量级 Widget 服务
- 旧版 Widget 已停服‌：以前那种无需 Key、直接引入 JS 就能显示天气的“傻瓜式”组件已不存在。
‌
- 新版要求 API Key‌：现在如果要显示天气，必须注册开发者账号，获取 ‌Key‌，并通过调用后端 API 获取数据，再自行编写前端代码渲染。这对于 Hexo 静态博客来说，存在 ‌CORS（跨域）‌ 和 ‌Key 泄露‌ 的风险，配置非常麻烦。

3. “今日天气” 静态图片服务
 最简单、稳定且‌不需要申请 Key、不需要写复杂 JS‌ 的方案，它们生成一张天气图片，直接嵌入。
 
- 在你想显示天气的位置（例如搜索框旁边）添加以下代码：

```
<div class="navbar-item weather-widget-container">
    <!-- 
      关键修改：
      1. 使用 format=4 或直接在 URL 后加 .png
      2. 这里使用 https://wttr.in/Chengdu.png?1 这种格式，强制返回 PNG 图片
      3. ?1 是为了防止缓存，每次刷新可能略有不同（可选）
    -->
    <img src="https://wttr.in/Chengdu.png?1" 
         alt="Weather" 
         class="weather-img"
         width="80" 
         height="20"
         onerror="this.style.display='none'">
</div>


```
 缺点：
  是一张图片，不能点击交互，样式固定

4. “极简天气” 第三方托管服务
 基于 Vercel 部署的开源天气组件，例如 ‌weather-widget-io‌
 将以下代码添加到需要的地方：
  
```
<div class="navbar-item" id="weather-container" style="margin-right: 15px;">
    <script async src="https://weather-widget-io.github.io/embed.js"></script>
    <weather-widget location="Chengdu, China" unit="c" lang="zh"></weather-widget>
</div>
```

5. 高德地图天气 API‌ 或 ‌百度地图天气 API‌
	最终我选择使用高德地图天气API，亲测可用
优势：
- 国内秒开：服务器在国内，无跨域问题，无 CORB 错误。

- 纯文字动态：实时抓取数据，字体大小、颜色完全由你控制。

- 零配置‌：不需要注册账号，不需要 API Key。

配置步骤如下：   
 
第一步：免费获取高德API Key
- 打开[高德开放平台](https://lbs.amap.com/)，注册个人开发者账号（免费）
- 创建一个「Web服务」类型的应用，直接复制拿到你的API Key（免费额度足够个人博客用）
- 查询你的城市adcode编码：搜索「高德adcode查询」，比如成都的adcode是510100  
 第二步：替换模板和代码

- 插入导航栏容器
打开 themes/hexo-theme-matery/layout/_partial/navbar.ejs，导航栏右侧插入： 

```
<!-- 高德动态天气组件 -->
<div class="navbar-item gaode-weather-container">
  <div id="gaode-weather" style="display: flex;align-items: center;gap: 6px;color: #fff;font-size: 14px;">
    <i id="weather-icon" class="fa fa-sun-o"></i>
    <span id="weather-info">加载中...</span>
  </div>
</div>

```
- 添加请求脚本（替换你的Key和adcode）
 打开 themes/hexo-theme-matery/layout/_partial/footer.ejs，在</body>前插入：
```
<script>
document.addEventListener('DOMContentLoaded', function() {
  // 👇 替换成你自己的配置
  const GAODE_KEY = '你的高德API Key';
  const CITY_ADCODE = '510100'; // 替换成你的城市adcode

  // 天气图标映射（Matery自带FontAwesome，直接用）
  const iconMap = {
    '晴': 'fa-sun-o', '多云': 'fa-cloud', '阴': 'fa-cloud',
    '小雨': 'fa-tint', '中雨': 'fa-tint', '大雨': 'fa-tint',
    '雪': 'fa-snowflake-o', '雾': 'fa-smoke'
  };

  // 高德官方天气接口
  fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${GAODE_KEY}&city=${CITY_ADCODE}&extensions=base`)
    .then(res => res.json())
    .then(data => {
      if(data.status === '1' && data.lives && data.lives.length > 0) {
        const live = data.lives;
        const weather = live.weather;
        const temp = live.temperature;
        // 更新DOM
        document.getElementById('weather-icon').className = `fa ${iconMap[weather] || 'fa-cloud'}`;
        document.getElementById('weather-info').textContent = `${temp}°C ${weather}`;
      } else {
        document.getElementById('gaode-weather').style.display = 'none';
      }
    })
    .catch(() => {
      document.getElementById('gaode-weather').style.display = 'none';
    });
});
</script>

```
- 适配matery主题CSS

```
.gaode-weather-container {
  display: flex;
  align-items: center;
  height: 60px !important;
  margin-right: 15px;
}
/* 移动端隐藏，节省空间 */
@media screen and (max-width: 768px) {
  .gaode-weather-container {
    display: none !important;
  }
}

```
增加高德定位功能：核心逻辑是：‌先通过 IP 接口获取当前城市 Adcode，再请求天气接口‌。

```
<script>
document.addEventListener('DOMContentLoaded', function() {
    const KEY = '你的高德Web服务Key'; // ⚠️ 替换为你的 Key
    
    const infoEl = document.getElementById('weather-info');
    const iconEl = document.getElementById('weather-icon');

    // 图标映射函数
    const getIconClass = (weather) => {
        if (!weather) return 'fa-cloud';
        if (weather.includes('晴')) return 'fa-sun-o';
        if (weather.includes('雨')) return 'fa-tint';
        if (weather.includes('雪')) return 'fa-snowflake-o';
        if (weather.includes('云') || weather.includes('阴')) return 'fa-cloud';
        return 'fa-cloud';
    };

    // 核心函数：根据 Adcode 获取天气
    function fetchWeather(adcode) {
        if (!adcode) {
            infoEl.innerText = '定位失败';
            iconEl.className = 'fa fa-exclamation-circle';
            return;
        }
        
        fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${KEY}&city=${adcode}&extensions=base`)
        .then(res => res.json())
        .then(data => {
            if (data.status === '1' && data.lives && data.lives.length > 0) {
                const live = data.lives;
                const temp = live.temperature;
                const weather = live.weather;
                
                infoEl.innerText = `${temp}°C ${weather}`;
                iconEl.className = `fa ${getIconClass(weather)}`;
            } else {
                infoEl.innerText = '获取失败';
            }
        })
        .catch(err => {
            console.error(err);
            infoEl.innerText = '网络错误';
        });
    }

    // 自动定位：通过 IP 获取当前城市 Adcode
    function autoLocateAndShow() {
        // 使用高德 IP 定位接口
        fetch(`https://restapi.amap.com/v3/ip?key=${KEY}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === '1' && data.adcode) {
                // 成功获取到城市 Adcode，立即查询天气
                fetchWeather(data.adcode);
            } else {
                // 如果 IP 定位失败（如本地 localhost），默认显示北京或你指定的城市
                console.warn('IP 定位失败，使用默认城市');
                fetchWeather('110000'); // 默认北京，可改为 '510100' 成都等
            }
        })
        .catch(() => {
            // 网络错误时的兜底
            fetchWeather('110000'); 
        });
    }

    // 页面加载后自动执行
    autoLocateAndShow();
});
</script>

```
- 如果需要在顶栏和侧边栏均显示天气控件
最佳方案是：‌只发起一次网络请求，然后分别更新两个位置的 DOM 元素‌。
 
 第一步：‌在顶栏和侧边栏各放一套相同的 HTML 结构（注意 ID 要区分，或者用 Class + 遍历更新）。
 为了代码复用，我们定义两套 ID：
顶栏：top-weather-info, top-weather-icon
侧边栏：side-weather-info, side-weather-icon

在 themes/hexo-theme-matery/layout/_partial/navbar.ejs 中：

```
<!-- 顶栏天气 -->
<div class="navbar-item auto-weather-container">
    <div id="top-gaode-weather" style="display: flex; align-items: center; gap: 6px; color: #fff; font-size: 14px;">
        <i id="top-weather-icon" class="fa fa-spinner fa-spin"></i>
        <span id="top-weather-info">定位中...</span>
    </div>
</div>

```
  在 themes/hexo-theme-matery/layout/_partial/sidebar.ejs (或 widget 相关文件) 中
   
```
<!-- 侧边栏天气卡片 -->
<div class="card weather-card">
    <div class="card-content">
        <span class="card-title" style="font-size: 16px; font-weight: bold;">
            <i class="fa fa-cloud"></i> 实时天气
        </span>
        <div id="side-gaode-weather" style="display: flex; align-items: center; gap: 10px; margin-top: 10px; font-size: 15px;">
            <i id="side-weather-icon" class="fa fa-spinner fa-spin fa-2x" style="color: #42b983;"></i>
            <div id="side-weather-info" style="line-height: 1.5;">
                定位中...
            </div>
        </div>
    </div>
</div>

```
‌  第二步：JS‌：请求一次高德 API，获取数据后，同时更新顶栏和侧边栏的文字/图标。
统一 JS 逻辑 (footer.ejs)：

```
<script>
document.addEventListener('DOMContentLoaded', function() {
    const KEY = '你的高德Web服务Key'; // ⚠️ 替换为你的 Key
    
    // 定义两组 DOM 元素
    const topInfoEl = document.getElementById('top-weather-info');
    const topIconEl = document.getElementById('top-weather-icon');
    const sideInfoEl = document.getElementById('side-weather-info');
    const sideIconEl = document.getElementById('side-weather-icon');

    // 图标映射
    const getIconClass = (weather) => {
        if (!weather) return 'fa-cloud';
        if (weather.includes('晴')) return 'fa-sun-o';
        if (weather.includes('雨')) return 'fa-tint';
        if (weather.includes('雪')) return 'fa-snowflake-o';
        if (weather.includes('云') || weather.includes('阴')) return 'fa-cloud';
        return 'fa-cloud';
    };

    // 核心函数：更新 UI
    function updateUI(temp, weather) {
        const iconClass = `fa ${getIconClass(weather)}`;
        const textContent = `${temp}°C ${weather}`;

        // 1. 更新顶栏
        if (topInfoEl) topInfoEl.innerText = textContent;
        if (topIconEl) topIconEl.className = iconClass;

        // 2. 更新侧边栏
        if (sideInfoEl) sideInfoEl.innerText = textContent;
        if (sideIconEl) sideIconEl.className = `${iconClass} fa-2x`; // 侧边栏图标大一点
    }

    // 获取天气并更新
    function fetchWeather(adcode) {
        if (!adcode) {
            updateUI('--', '定位失败');
            return;
        }
        
        fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${KEY}&city=${adcode}&extensions=base`)
        .then(res => res.json())
        .then(data => {
            if (data.status === '1' && data.lives && data.lives.length > 0) {
                const live = data.lives;
                updateUI(live.temperature, live.weather);
            } else {
                updateUI('--', '获取失败');
            }
        })
        .catch(err => {
            console.error(err);
            updateUI('--', '网络错误');
        });
    }

    // 自动定位
    function autoLocateAndShow() {
        fetch(`https://restapi.amap.com/v3/ip?key=${KEY}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === '1' && data.adcode) {
                fetchWeather(data.adcode);
            } else {
                // 定位失败默认成都
                fetchWeather('510100'); 
            }
        })
        .catch(() => {
            fetchWeather('510100'); 
        });
    }

    // 执行
    autoLocateAndShow();
});
</script>

```
第三步：美化侧边栏的天气卡片，并确保顶栏布局正常

```
/* 顶栏容器 */
.auto-weather-container {
    display: flex;
    align-items: center;
    height: 60px !important;
    margin-right: 15px;
}

/* 侧边栏天气卡片美化 */
.weather-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.weather-card .card-title {
    margin-bottom: 10px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

#side-weather-info {
    font-size: 16px;
    color: #333;
    font-weight: 500;
}

/* 移动端隐藏顶栏天气，保留侧边栏（或根据需求调整） */
@media screen and (max-width: 768px) {
    .auto-weather-container {
        display: none !important;
    }
}

```

 
   
#### 结语
