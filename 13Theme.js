/*
 * 13Theme Core Script
 * Privacy Protected Version
 */
const $ = new Env("13Theme Helper");
const URL = new URLs();

// 核心数据库
const DataBase = {
	"13Theme":{
		"Settings":{
			"Switch":true,
			"Skin":{
				"user_equip": 32264, 
				"load_equip": 32263
			},
			"Private":{
				"vip":false
			}
		},
		"Configs":{
			"Skin":{
				"user_equip":[
					{
						"id": 32264,
						"name": "EveOneCat2",
						"preview": "https://i0.hdslb.com/bfs/garb/item/af6ab166af22ed45d429bfde4e3962bb78f270c8.png",
						"ver": 1632051567,
						"package_url": "https://i0.hdslb.com/bfs/garb/zip/4f047ea64e0659dcbcf70092dd6e30c1eadb9390.zip",
						"package_md5": "0f81680da60b12d0ca9ebe869b81e1b1",
						"data":
						{
							"color_mode": "dark",
							"color": "#ffffff",
							"color_second_page": "#32376b",
							"side_bg_color": "#32376b",
							"tail_color": "#e9e9e9",
							"tail_color_selected": "#fff57a",
							"tail_icon_ani": true,
							"tail_icon_ani_mode": "once",
							"head_myself_mp4_play": "loop",
							"tail_icon_mode": "img"
						}
					},
					{
						"id": 34813,
						"name": "嘉然装扮2.0 (蓝)",
						"preview": "https://i0.hdslb.com/bfs/garb/item/4d280c3ac38059c7c528a629b7e043a90bf5ff91.jpg",
						"ver": 1655707875,
						"package_url": "https://i0.hdslb.com/bfs/garb/zip/6349c29877c87ffb6967a13e01c17a237380197d.zip",
						"package_md5": "80fbc07a421a3dd885b9ec7cf6884f66",
						"data":
						{
							"color_mode": "dark",
							"color_second_page": "#9cbcf5",
							"tail_color_selected": "#526fff",
							"color": "#ffffff",
							"tail_color": "#2648a8",
							"head_myself_mp4_play": "loop",
							"tail_icon_ani": false,
							"tail_icon_mode": "img"
						}
					},
					{
						"id": 34814,
						"name": "嘉然装扮2.0 (粉)",
						"preview": "https://i0.hdslb.com/bfs/garb/item/c45dd226c6eeee0dc43307995efb0b1529321e0a.jpg",
						"ver": 1655707892,
						"package_url": "https://i0.hdslb.com/bfs/garb/zip/14d71e4f8fda27e52a3aec6a93b358b5686cbada.zip",
						"package_md5": "3522719bc452ad2b0c4562dd8611734a",
						"data":
						{
							"color_mode": "light",
							"color_second_page": "#fec9dd",
							"tail_color_selected": "#155fe7",
							"color": "#212121",
							"tail_color": "#b93668",
							"head_myself_mp4_play": "loop",
							"tail_icon_ani": false,
							"tail_icon_mode": "img"
						}
					}
				],
				"load_equip":[
					{
						"id": 32263,
						"name": "EveOneCat2",
						"ver": "1632046310",
						"loading_url": "https://i0.hdslb.com/bfs/garb/item/880560233ce3fe7bde792f619bc02ac7b59fb02a.webp"
					},
					{
						"id": 34811,
						"name": "嘉然个性装扮2.0",
						"ver": 1650337335,
						"loading_url": "https://i0.hdslb.com/bfs/garb/item/fed79dceb1ea584a3f336e58689fbe5ae93f69a6.webp"
					}
				]
			}
		}
	},
	"Default": {
		"Settings":{"Switch":"true"}
	}
};

/***************** Processing *****************/
(async () => {
	const { Settings, Configs } = setENV("13Theme", "13Theme", DataBase);
	
	if (!Settings.Switch) {
        $.done();
        return;
    }

	let url = URL.parse($request?.url);
	const PATH = url?.path;
	
    // 简单容错
	let body = { data: {} };
    try {
        body = JSON.parse($response.body);
    } catch(e) {}
	if (!body.data) body.data = {};
	let data = body.data;

	const injectVIP = () => {
		if (Settings?.Private?.vip) {
			data.vip_type = 2;
			data.vip = {
				status: 1,
				type: 2,
				due_date: 4102329600000,
				role: 3,
				label: {
					path: "",
					text: "年度大会员",
					label_theme: "hundred_annual_vip",
					text_color: "#FFFFFF",
					bg_style: 1,
					bg_color: "#FB7299",
					use_img_label: true,
					img_label_uri_hans_static: "https://i0.hdslb.com/bfs/vip/8d7e624d13d3e134251e4174a7318c19a8edbd71.png"
				}
			};
		}
	};

	if (PATH.indexOf("account/myinfo") > -1) {
		injectVIP();
	} 
	else if (PATH.indexOf("account/mine") > -1) {
		injectVIP();
	}
	else if (PATH.indexOf("resource/show/skin") > -1) {
		const targetSkinId = Settings.Skin.user_equip;
		const targetLoadId = Settings.Skin.load_equip;
		
        // 强制类型转换对比，防止 ID 类型不一致
		const skinData = Configs.Skin.user_equip.find(e => e.id == targetSkinId);
		const loadData = Configs.Skin.load_equip.find(e => e.id == targetLoadId);

		if (skinData) {
			$.log(`换肤生效: ${skinData.name}`);
			data.user_equip = skinData;
		}
		if (loadData) {
			data.load_equip = loadData;
		}
	}

	body.data = data;
	$response.body = JSON.stringify(body);
})()
	.catch((e) => $.logErr(e))
	.finally(() => $.done($response));

/***************** Core Functions *****************/
function setENV(name, platform, database) {
	let { Settings, Configs } = getENV(name, platform, database);
	return { Settings, Configs };
};
function getENV(key, name, database){
	// 读取 BoxJs 数据，Key 前缀改为 @13Theme
	let BoxJs = $.getjson("@" + key, database);
	const Store = {
		Settings: database?.Default?.Settings || {},
		Configs: database?.[name]?.Configs || {}
	};
	if (BoxJs?.[name]?.Settings) {
		Store.Settings = { ...Store.Settings, ...BoxJs[name].Settings };
	}
	for (let k in Store.Settings) {
		let v = Store.Settings[k];
		if (v === "true") Store.Settings[k] = true;
		if (v === "false") Store.Settings[k] = false;
		if (!isNaN(v) && typeof v === "string" && v.length > 0) Store.Settings[k] = Number(v);
	}
	return Store;
}
function URLs(t){return new class{constructor(t=[]){this.name="URL v1.2.2",this.opts=t,this.json={scheme:"",host:"",path:"",type:"",query:{}}}parse(t){let s=t.match(/(?:(?<scheme>.+):\/\/(?<host>[^/]+))?\/?(?<path>[^?]+)?\??(?<query>[^?]+)?/)?.groups??null;return s?.path?s.paths=s?.path?.split("/"):s.path="",s?.paths&&(s.type=s?.paths?.[s?.paths?.length-1]?.split(".")?.[1]),s?.query&&(s.query=Object.fromEntries(s.query.split("&").map((t=>t.split("="))))),s}stringify(t=this.json){let s="";return t?.scheme&&t?.host&&(s+=t.scheme+"://"+t.host),t?.path&&(s+=t?.host?"/"+t.path:t.path),t?.query&&(s+="?"+Object.entries(t.query).map((t=>t.join("="))).join("&")),s}}(t)}
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t);break;case"Node.js":this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
