// click_text.js - 鼠标点击文字特效
var a_idx = 0;
jQuery(document).ready(function ($) {
    $("body").click(function (e) {
        // 自定义点击弹出的文字数组，可随意修改
        var a = new Array("富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治", "爱国", "敬业", "诚信", "友善");
        
        var $i = $("<span/>").text(a[a_idx]);
        a_idx = (a_idx + 1) % a.length;
        
        var x = e.pageX, y = e.pageY;
        $i.css({
            "z-index": 9999, // 提高层级，确保显示在最上层
            "top": y - 20,
            "left": x,
            "position": "absolute",
            "font-weight": "bold",
            "color": "#ff6651" // 可自定义文字颜色
        });
        
        $("body").append($i);
        $i.animate({
            "top": y - 180,
            "opacity": 0
        }, 1500, function () {
            $i.remove();
        });
    });
});
