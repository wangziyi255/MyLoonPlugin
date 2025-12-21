// bilibili-robust-parser.js
const $ = new Env("B站主题切换-智能解析版");

// 1. 智能数据挖掘器（核心中的核心）
function extractSkinInfo(rawJsonString) {
    let result = {
        user_equip: null,
        load_equip: null,
        play_equip: null,
        warnMessage: []
    };

    try {
        const parsed = JSON.parse(rawJsonString);
        if (!parsed || typeof parsed !== 'object') {
            throw new Error("输入的不是有效的JSON对象");
        }

        // 第一步：尝试直接识别标准化结构（处理B站API原始响应）
        if (parsed.user_equip && parsed.user_equip.id) {
            // 情况A：最规范的数据，直接来自API的data字段
            result.user_equip = parsed.user_equip;
            result.load_equip = parsed.load_equip || parsed.loading_equip; // 兼容不同字段名
            result.play_equip = parsed.play_equip || parsed.play_icon;
            result.warnMessage.push("识别为标准API数据结构");
        } 
        // 第二步：深度遍历挖掘（处理零散、嵌套或结构不规则的数据）
        else {
            // 收集所有可能包含皮肤信息的对象
            const candidates = [];
            
            // 递归遍历函数
            function traverse(obj, path) {
                if (!obj || typeof obj !== 'object') return;
                
                // 判断是否为皮肤对象的关键特征
                const hasPackageUrl = obj.package_url && obj.package_url.includes('hdslb.com');
                const hasSkinId = obj.id && (obj.id.toString().length > 9); // ID通常较长
                
                if (hasPackageUrl && hasSkinId) {
                    candidates.push({...obj, _path: path});
                }
                
                // 继续遍历对象或数组
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        traverse(obj[key], path ? `${path}.${key}` : key);
                    }
                }
            }
            
            traverse(parsed, '');
            
            // 从候选对象中挑选最合适的
            if (candidates.length > 0) {
                // 优先选择包含预览图的
                const bestCandidate = candidates.find(c => c.preview) || candidates[0];
                
                result.user_equip = {
                    id: bestCandidate.id,
                    name: bestCandidate.name || `皮肤ID:${bestCandidate.id}`,
                    preview: bestCandidate.preview || `https://i0.hdslb.com/bfs/garb/default_preview.png`,
                    ver: bestCandidate.ver || Date.now(),
                    package_url: bestCandidate.package_url,
                    data: bestCandidate.data || {
                        color_mode: "light",
                        color_second_page: "#FFFFFF"
                    }
                };
                
                result.warnMessage.push(`从路径【${bestCandidate._path}】挖掘出皮肤数据`);
                
                // 尝试寻找配套的加载动画（特征：包含loading_url）
                const loadingCandidate = candidates.find(c => c.loading_url);
                if (loadingCandidate) {
                    result.load_equip = {
                        id: loadingCandidate.id || result.user_equip.id + 1,
                        name: loadingCandidate.name || "配套加载动画",
                        loading_url: loadingCandidate.loading_url,
                        ver: loadingCandidate.ver || Date.now()
                    };
                }
            }
        }

        // 第三步：最终验证与修正
        if (result.user_equip) {
            // 确保ver是数字（处理字符串类型）
            if (typeof result.user_equip.ver === 'string') {
                result.user_equip.ver = parseInt(result.user_equip.ver) || Date.now();
            }
            
            // 确保data对象存在
            if (!result.user_equip.data) {
                result.user_equip.data = { color_mode: "light" };
            }
            
            console.log(`[解析器] 成功提取皮肤: ${result.user_equip.name} (ID: ${result.user_equip.id})`);
            return result;
        } else {
            throw new Error("在提供的JSON中未找到有效的皮肤数据（需包含id和package_url字段）");
        }
        
    } catch (e) {
        console.log(`[解析器] 解析失败: ${e.message}`);
        result.error = e.message;
        return result;
    }
}

// 2. 主处理逻辑
(async () => {
    // 获取Loon传递的参数
    let params = {};
    if (typeof $argument !== 'undefined' && $argument) {
        $argument.split('&').forEach(item => {
            const [k, v] = item.split('=');
            if (k && v) params[k] = decodeURIComponent(v);
        });
    }
    
    // 仅处理皮肤接口
    if (!$request || !$request.url.includes('/x/resource/show/skin')) {
        console.log(`[主题切换] 跳过非皮肤接口请求`);
        return;
    }
    
    try {
        let body = JSON.parse($response.body);
        if (body.code === 0 && body.data) {
            
            let finalTheme = null;
            let logMessage = "";
            
            // 策略优先级：完整JSON输入 > 仅皮肤ID输入
            if (params.skinJson && params.skinJson.trim()) {
                console.log(`[主题切换] 开始解析用户输入的JSON数据...`);
                const extraction = extractSkinInfo(params.skinJson);
                
                if (extraction.user_equip) {
                    finalTheme = {
                        user_equip: extraction.user_equip,
                        load_equip: extraction.load_equip,
                        play_equip: extraction.play_equip
                    };
                    logMessage = `使用用户输入的皮肤: ${extraction.user_equip.name}`;
                    
                    // 显示解析过程中的提示信息
                    if (extraction.warnMessage.length > 0) {
                        extraction.warnMessage.forEach(msg => console.log(`[提示] ${msg}`));
                    }
                } else {
                    console.log(`[主题切换] JSON解析失败: ${extraction.error}`);
                }
            }
            
            // 如果JSON解析失败或未提供，回退到ID智能构造模式
            if (!finalTheme && params.skinId && params.skinId.trim()) {
                const skinId = parseInt(params.skinId.trim());
                console.log(`[主题切换] 回退到智能构造模式，ID: ${skinId}`);
                // 这里可以接入您之前认可的智能构造函数
                // finalTheme = createThemeForId(skinId);
                logMessage = `智能构造皮肤，ID: ${skinId}`;
            }
            
            // 执行替换
            if (finalTheme) {
                body.data = finalTheme;
                // 强制更新版本号，防止客户端缓存
                if (body.data.user_equip) body.data.user_equip.ver = Date.now();
                console.log(`[主题切换] ✅ ${logMessage}`);
            } else {
                console.log(`[主题切换] ⚠️ 未提供有效数据，返回默认皮肤`);
            }
            
            $response.body = JSON.stringify(body);
        }
    } catch (e) {
        console.log(`[主题切换] 处理出错: ${e.message}`);
    }
})();

// 简易环境封装
function Env(name) {
    return new class {
        constructor(name) { this.name = name; }
        log(...args) { 
            const timestamp = new Date().toLocaleTimeString();
            console.log(`[${timestamp}]`, ...args);
        }
    }(name);
}
