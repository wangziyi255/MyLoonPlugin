// BiliBili 自定义皮肤脚本（支持分开填 md5 + 智能识别）
(function() {
    'use strict';

    let body = JSON.parse($response.body);
    if (!body.data) $done({});

    const customJson = $persistentStore.read("@BiliBili.Custom.Skin.Json");
    const customMd5 = $persistentStore.read("@BiliBili.Custom.Skin.Md5");  // 新增：单独 md5

    let finalSkins = [];
    let extraLoadEquip = null;
    let extraPlayIcon = null;

    if (customJson) {
        try {
            let parsed = JSON.parse(customJson);

            if (Array.isArray(parsed)) {
                parsed.forEach(item => {
                    const skin = extractSkin(item);
                    if (skin) {
                        // 注入 md5（如果没带，且有自定义 md5）
                        if (customMd5 && !skin.package_md5) {
                            skin.package_md5 = customMd5.trim();
                        }
                        finalSkins.push(skin);
                    }

                    if (item.load_equip && !extraLoadEquip) extraLoadEquip = item.load_equip;
                    if (item.play_icon && !extraPlayIcon) extraPlayIcon = item.play_icon;
                });
            } else {
                const skin = extractSkin(parsed);
                if (skin) {
                    if (customMd5 && !skin.package_md5) {
                        skin.package_md5 = customMd5.trim();
                    }
                    finalSkins.push(skin);
                }

                if (parsed.load_equip) extraLoadEquip = parsed.load_equip;
                if (parsed.play_icon) extraPlayIcon = parsed.play_icon;
            }

            console.log("加载主皮肤数量: " + finalSkins.length);
            if (customMd5) console.log("注入 md5: " + customMd5);
        } catch (e) {
            console.log("JSON 解析失败: " + e);
        }
    }

    if (finalSkins.length > 0) {
        const selectedId = parseInt($persistentStore.read("@BiliBili.Custom.Skin.SelectedId") || finalSkins[0].id);
        const selectedSkin = finalSkins.find(s => s.id === selectedId) || finalSkins[0];

        if (selectedSkin) {
            body.data.user_equip = selectedSkin;
            console.log("装备皮肤: " + selectedSkin.name);
        }

        body.data.list = finalSkins;

        if (extraLoadEquip) {
            body.data.load_equip = extraLoadEquip;
            console.log("注入加载动画: " + extraLoadEquip.name);
        }
        if (extraPlayIcon) {
            body.data.play_icon = extraPlayIcon;
            console.log("注入播放图标");
        }
    }

    $done({ body: JSON.stringify(body) });

    function extractSkin(item) {
        if (!item) return null;

        if (item.user_equip && typeof item.user_equip === 'object') {
            return item.user_equip;
        }

        if (item.id && item.name && item.data) {
            return item;
        }

        return null;
    }
})();
