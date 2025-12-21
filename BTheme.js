// BTheme_Fixed.js - 修复版：确保总是返回有效数据
const $ = new Env("B站主题修复版");

// 核心：硬编码一个绝对有效的皮肤数据
const fixedSkinData = {
    "code": 0,
    "message": "0",
    "ttl": 1,
    "data": {
        "user_equip": {
            "id": 1765541226001,
            "name": "少潮主题-修复测试",
            "preview": "https://i0.hdslb.com/bfs/garb/183e967c916125ae153ddf471e46d74d3a85e0c4.png",
            "ver": Date.now(), // 使用当前时间戳，防止缓存
            "package_url": "https://i0.hdslb.com/bfs/garb/zip/3609306f8b0872caee8d009790888aeeacd7ab16.zip",
            "data": {
                "color_mode": "dark",
                "color": "#ffffff",
                "color_second_page": "#932E38",
                "tail_color": "#FFFFFF",
                "tail_color_selected": "#DDFF00",
                "head_myself_mp4_play": "loop",
                "tail_icon_mode": "img"
            }
        }
    }
};

// 主处理函数
(async () => {
    try {
        // 只处理皮肤接口，其他请求直接放行
        if (!$request || !$request.url.includes('/x/resource/show/skin')) {
            $done($response);
            return;
        }

        // 关键修复：直接返回我们构造好的完整响应对象
        $done({
            response: {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store' // 建议禁止缓存
                },
                body: JSON.stringify(fixedSkinData)
            }
        });
        
    } catch (e) {
        // 即使出错，也返回一个有效的响应结构，避免阻塞
        $done({
            response: {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: 0, message: "0", data: {} })
            }
        });
    }
})();

// 环境对象
function Env(name) {
    return new class {
        constructor(name) { this.name = name; }
    }(name);
}
