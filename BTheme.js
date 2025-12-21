// BTheme_Simple.js - 最简测试版
const $ = new Env("B站主题测试");

// 只内置一个皮肤数据（"少潮主题"）
const SingleSkin = {
  "user_equip": {
    "id": 1765541226001,
    "name": "少潮主题-测试版",
    "preview": "https://i0.hdslb.com/bfs/garb/183e967c916125ae153ddf471e46d74d3a85e0c4.png",
    "ver": 1765775790,
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
};

// 主程序
(async () => {
  // 只处理皮肤接口
  if (!$request || !$request.url.includes('/x/resource/show/skin')) return;
  
  try {
    let body = JSON.parse($response.body);
    if (body.code === 0 && body.data) {
      // 简单粗暴：直接替换为内置的单一皮肤
      body.data = SingleSkin;
      $response.body = JSON.stringify(body);
    }
  } catch (e) {
    // 静默失败
  }
})();

function Env(name) {
  return new class {
    constructor(name) { this.name = name; }
  }(name);
}
