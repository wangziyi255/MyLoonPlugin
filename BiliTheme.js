/*
* 📺 BiliBili: 👘 Skin Argument Loader
* 核心逻辑：读取 Loon 插件界面的输入参数 ($argument)
*/

const $ = new Env("📺 BiliBili: 👘 Skin Argument");

/***************** Processing *****************/
(async () => {
    const PATH = $request?.url?.split("?")?.[0] || "";
    
    // 🎯 核心改变在这里：读取 Loon 传入的参数
    // $argument 就是你在 Loon 界面填的那一大串 JSON 字符串
    const RAW_ARGUMENT = typeof $argument === "string" ? $argument : "";

    // 创建空响应体
    let body = { "code": 0, "message": "0", "data": {} };

    // 只处理皮肤接口 + 必须有输入的参数
    if (PATH.includes("x/resource/show/skin") && RAW_ARGUMENT) {
        try {
            // 解析 B 站原始响应
            if ($response.body) {
                let originalBody = JSON.parse($response.body);
                body = originalBody; // 先继承原始数据，防止意外覆盖
            }
            
            let data = body.data || {};

            $.log(`📥 接收到 Loon 参数，正在解析...`);
            
            // 解析你在 Loon 里填入的 JSON
            const customData = JSON.parse(RAW_ARGUMENT);

            // 1. 注入皮肤 (User Equip)
            if (customData.user_equip) {
                // 自动刷新时间戳
                customData.user_equip.ver = Date.now().toString().slice(0, 10);
                data.user_equip = customData.user_equip;
                $.log(`✅ 皮肤注入: ${data.user_equip.name}`);
            }

            // 2. 注入加载动画 (Load Equip)
            if (customData.load_equip) {
                data.load_equip = customData.load_equip;
                $.log(`✅ 动画注入: ${data.load_equip.name}`);
            }
            
            // 3. 注入图标 (Play Icon)
            if (customData.play_icon) {
                data.play_icon = customData.play_icon;
            }

            body.data = data;
            $response.body = JSON.stringify(body);

        } catch (e) {
            $.log(`🚫 参数解析失败: ${e.message}`);
            $.log(`请检查 Loon 插件输入框中的 JSON 格式是否正确`);
            // 出错时保持原样返回，不影响 App 使用
        }
    } else {
        // 如果没有参数，或者不是皮肤接口，什么都不做，原样放行
        $.log(`⚠️ 未检测到参数或非目标接口，跳过处理`);
    }

})()
.catch((e) => $.logErr(e))
.finally(() => {
    $.done($response);
});

// ... (这里必须保留原来那个 Env 工具类函数，为了篇幅我省略了，记得把之前代码底部的 Env 函数复制过来) ...
