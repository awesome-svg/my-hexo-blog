# my-hexo-blog
基于hexo，git,Vercel搭建的个人博客

根目录和主题目录的区别
根目录（站点根目录）
	‌定义‌：指执行 hexo init 命令后生成的整个博客项目的顶层目录。
	‌包含内容‌：
	全局配置文件 _config.yml（控制站点基本信息、URL、部署、插件等）‌‌
	文章存放目录 _posts/
	页面资源目录 source/
	草稿目录 _drafts/
	Node.js 依赖管理文件 package.json
	‌作用‌：管理整个博客站点的全局设置和内容结构。
主题目录
	‌定义‌：位于根目录下的 themes/ 文件夹中，每个主题（如 next、yilia、hueman）都有一个独立子目录。
	‌包含内容‌：
	主题专属配置文件 _config.yml（覆盖或扩展根配置，控制样式、布局、组件等）‌‌
	布局模板文件（如 layout/ 中的 .ejs 或 .swig 文件）
	静态资源（如 source/ 中的 CSS、JS、图片）
	语言文件（languages/）
	‌作用‌：定义博客的外观、交互和部分功能行为。
关键区别
‌	配置优先级‌：Hexo 会先读取‌根目录‌的 _config.yml，再加载‌主题目录‌的 _config.yml；若两者存在相同配置项，‌主题配置通常优先‌
	（具体取决于主题实现）‌‌
‌修改建议‌：
	站点相关设置（如标题、URL、部署）→ 修改‌根目录‌ _config.yml
	主题样式或组件（如导航栏、配色、侧边栏）→ 修改对应‌主题目录‌下的 _config.yml


雪花样式：
   在主题的layout/_partial/head.ejs文件中找地方插入下列代码即可。
    	<link rel="stylesheet" href="/css/snow.css">
	<div id="snowzone">
	</div> 
	<script src="/js/snow.js"></script>
	
测试404错误代码，不要在本地测试，部署到网页上


在菜单栏添加二级菜单时，原主题默认将二级菜单原样显示，所以如果想显示中文,两种方法
1.	将子菜单直接写为中文
2.修改菜单栏配置文件navigation.ejs和mobile-nav.ejs，不管几级菜单都添加进映射,方便统一，需要修改主题源代码
	
	
待完善功能：
   1.天气设置
   2.评论留言设置（gittalk代理设置）
   3.简历页面的圆环百分比显示(自定义变量没有用)
   
	
----------------------------------------------------------------
天气
<!-- 《添加“心知天气”-->
<div id="tp-weather-widget"></div>
<script>
        (function(T, h, i, n, k, P, a, g, e) {
            g = function() {
                P = h.createElement(i);
                a = h.getElementsByTagName(i)[0];
                P.src = k;
                P.charset = "utf-8";
                P.async = 1;
                a.parentNode.insertBefore(P, a)
            };
            T["ThinkPageWeatherWidgetObject"] = n;
            T[n] || (T[n] = function() {
                (T[n].q = T[n].q || []).push(arguments)
            });
            T[n].l = +new Date();
            if (T.attachEvent) {
                T.attachEvent("onload", g)
            } else {
                T.addEventListener("load", g, false)
            }
        }(window, document, "script", "tpwidget", "//widget.thinkpage.cn/widget/chameleon.js"))
    </script>
    <script>
        tpwidget("init", {
            "flavor": "slim",
            "location": "WM6N2PM3WY2K",
            "geolocation": "enabled",
            "language": "zh-chs",
            "unit": "c",
            "theme": "chameleon",
            "container": "tp-weather-widget",
            "bubble": "enabled",
            "alarmType": "badge",
            "color": "#FFFFFF",
            "uid": "U88B4B2797",
            "hash": "c9d7cb43b80ffece52c9a1ebbfbca65f"
        });
        tpwidget("show");
    </script>
<!-- 添加“心知天气”》-->
 
 ==》
 粘贴到 themes/matery/layout/layout.ejs即可。



//gittalk代理设置

/*
CORS Anywhere as a Cloudflare Worker!
(c) 2019 by Zibri (www.zibri.org)
email: zibri AT zibri DOT org
https://github.com/Zibri/cloudflare-cors-anywhere

This Cloudflare Worker script acts as a CORS proxy that allows
cross-origin resource sharing for specified origins and URLs.
It handles OPTIONS preflight requests and modifies response headers accordingly to enable CORS.
The script also includes functionality to parse custom headers and provide detailed information
about the CORS proxy service when accessed without specific parameters.
The script is configurable with whitelist and blacklist patterns, although the blacklist feature is currently unused.
The main goal is to facilitate cross-origin requests while enforcing specific security and rate-limiting policies.
*/

// Configuration: Whitelist and Blacklist (not used in this version)
// whitelist = [ "^http.?://www.zibri.org$", "zibri.org$", "test\\..*" ];  // regexp for whitelisted urls
const blacklistUrls = [];           // regexp for blacklisted urls
const whitelistOrigins = [ ".*" ];   // regexp for whitelisted origins

// Function to check if a given URI or origin is listed in the whitelist or blacklist
function isListedInWhitelist(uri, listing) {
    let isListed = false;
    if (typeof uri === "string") {
        listing.forEach((pattern) => {
            if (uri.match(pattern) !== null) {
                isListed = true;
            }
        });
    } else {
        // When URI is null (e.g., when Origin header is missing), decide based on the implementation
        isListed = true; // true accepts null origins, false would reject them
    }
    return isListed;
}

// Event listener for incoming fetch requests
addEventListener("fetch", async event => {
    event.respondWith((async function() {
        const isPreflightRequest = (event.request.method === "OPTIONS");
        
        const originUrl = new URL(event.request.url);

        // Function to modify headers to enable CORS
        function setupCORSHeaders(headers) {
            headers.set("Access-Control-Allow-Origin", event.request.headers.get("Origin"));
            if (isPreflightRequest) {
                headers.set("Access-Control-Allow-Methods", event.request.headers.get("access-control-request-method"));
                const requestedHeaders = event.request.headers.get("access-control-request-headers");

                if (requestedHeaders) {
                    headers.set("Access-Control-Allow-Headers", requestedHeaders);
                }

                headers.delete("X-Content-Type-Options"); // Remove X-Content-Type-Options header
            }
            return headers;
        }

        const targetUrl = decodeURIComponent(decodeURIComponent(originUrl.search.substr(1)));

        const originHeader = event.request.headers.get("Origin");
        const connectingIp = event.request.headers.get("CF-Connecting-IP");

        if ((!isListedInWhitelist(targetUrl, blacklistUrls)) && (isListedInWhitelist(originHeader, whitelistOrigins))) {
            let customHeaders = event.request.headers.get("x-cors-headers");

            if (customHeaders !== null) {
                try {
                    customHeaders = JSON.parse(customHeaders);
                } catch (e) {}
            }

            if (originUrl.search.startsWith("?")) {
                const filteredHeaders = {};
                for (const [key, value] of event.request.headers.entries()) {
                    if (
                        (key.match("^origin") === null) &&
                        (key.match("eferer") === null) &&
                        (key.match("^cf-") === null) &&
                        (key.match("^x-forw") === null) &&
                        (key.match("^x-cors-headers") === null)
                    ) {
                        filteredHeaders[key] = value;
                    }
                }

                if (customHeaders !== null) {
                    Object.entries(customHeaders).forEach((entry) => (filteredHeaders[entry[0]] = entry[1]));
                }

                const newRequest = new Request(event.request, {
                    redirect: "follow",
                    headers: filteredHeaders
                });

                const response = await fetch(targetUrl, newRequest);
                const responseHeaders = new Headers(response.headers);
                const exposedHeaders = [];
                const allResponseHeaders = {};
                for (const [key, value] of response.headers.entries()) {
                    exposedHeaders.push(key);
                    allResponseHeaders[key] = value;
                }
                exposedHeaders.push("cors-received-headers");
                responseHeaders = setupCORSHeaders(responseHeaders);

                responseHeaders.set("Access-Control-Expose-Headers", exposedHeaders.join(","));
                responseHeaders.set("cors-received-headers", JSON.stringify(allResponseHeaders));

                const responseBody = isPreflightRequest ? null : await response.arrayBuffer();

                const responseInit = {
                    headers: responseHeaders,
                    status: isPreflightRequest ? 200 : response.status,
                    statusText: isPreflightRequest ? "OK" : response.statusText
                };
                return new Response(responseBody, responseInit);

            } else {
                const responseHeaders = new Headers();
                responseHeaders = setupCORSHeaders(responseHeaders);

                let country = false;
                let colo = false;
                if (typeof event.request.cf !== "undefined") {
                    country = event.request.cf.country || false;
                    colo = event.request.cf.colo || false;
                }

                return new Response(
                    "CLOUDFLARE-CORS-ANYWHERE\n\n" +
                    "Source:\nhttps://github.com/Zibri/cloudflare-cors-anywhere\n\n" +
                    "Usage:\n" +
                    originUrl.origin + "/?uri\n\n" +
                    "Donate:\nhttps://paypal.me/Zibri/5\n\n" +
                    "Limits: 100,000 requests/day\n" +
                    "          1,000 requests/10 minutes\n\n" +
                    (originHeader !== null ? "Origin: " + originHeader + "\n" : "") +
                    "IP: " + connectingIp + "\n" +
                    (country ? "Country: " + country + "\n" : "") +
                    (colo ? "Datacenter: " + colo + "\n" : "") +
                    "\n" +
                    (customHeaders !== null ? "\nx-cors-headers: " + JSON.stringify(customHeaders) : ""),
                    {
                        status: 200,
                        headers: responseHeaders
                    }
                );
            }
        } else {
            return new Response(
                "Create your own CORS proxy</br>\n" +
                "<a href='https://github.com/Zibri/cloudflare-cors-anywhere'>https://github.com/Zibri/cloudflare-cors-anywhere</a></br>\n" +
                "\nDonate</br>\n" +
                "<a href='https://paypal.me/Zibri/5'>https://paypal.me/Zibri/5</a>\n",
                {
                    status: 403,
                    statusText: 'Forbidden',
                    headers: {
                        "Content-Type": "text/html"
                    }
                }
            );
        }
    })());
});






volantis主题