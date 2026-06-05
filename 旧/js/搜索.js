const input = document.getElementById('search-input');
const btn = document.getElementById('search-btn');
const suggest = document.getElementById('suggest');

// 动漫数据
const cartoonJson = {
    "top_20": [
        {"rank": 1, "title": "剑来 第二季"},
        {"rank": 2, "title": "仙逆"},
        {"rank": 3, "title": "斗破苍穹 年番"},
        {"rank": 4, "title": "斗罗大陆II 绝世唐门"},
        {"rank": 5, "title": "吞噬星空"},
        {"rank": 6, "title": "完美世界"},
        {"rank": 7, "title": "沧元图"},
        {"rank": 8, "title": "光阴之外"},
        {"rank": 9, "title": "凡人修仙传"},
        {"rank": 10, "title": "一人之下"},
        {"rank": 11, "title": "神印王座"},
        {"rank": 12, "title": "遮天"},
        {"rank": 13, "title": "大主宰"},
        {"rank": 14, "title": "云深不知梦"},
        {"rank": 15, "title": "仙剑奇侠传"},
        {"rank": 16, "title": "神墓"},
        {"rank": 17, "title": "狐妖小红娘"},
        {"rank": 18, "title": "画江湖之不良人"},
        {"rank": 19, "title": "武庚纪"},
        {"rank": 20, "title": "秦时明月"}
    ]
};

// 统一获取链接函数（优化：只写一次链接，复用）
function getLinkByTitle(title) {
    switch (title) {
        case "剑来 第二季": return "https://v.qq.com/x/search/?q=%E5%89%91%E6%9D%A5+%E7%AC%AC%E4%BA%8C%E5%AD%A3";
        case "仙逆": return "https://v.qq.com/x/search/?q=%E4%BB%99%E9%80%86";
        case "斗破苍穹 年番": return "https://v.qq.com/x/search/?q=%E6%96%97%E7%A0%B4%E8%8B%8D%E7%A9%B9%E5%B9%B4%E7%95%AA";
        case "斗罗大陆II 绝世唐门": return "https://v.qq.com/x/search/?q=%E6%96%97%E7%BD%97%E5%A4%A7%E9%99%86";
        case "吞噬星空": return "https://v.qq.com/x/search/?q=%E5%90%9E%E5%99%AC%E6%98%9F%E7%A9%BA";
        case "完美世界": return "https://v.qq.com/x/search/?q=%E5%AE%8C%E7%BE%8E%E4%B8%96%E7%95%8C";
        case "沧元图": return "https://so.youku.com/search/q_%E6%B2%A7%E5%85%83%E5%9B%BE";
        case "光阴之外": return "https://so.youku.com/search/q_%E5%85%89%E9%98%B4%E4%B9%8B%E5%A4%96";
        case "凡人修仙传": return "https://so.youku.com/search/q_%E5%87%A1%E4%BA%BA%E4%BF%AE%E4%BB%99%E4%BC%A0";
        case "一人之下": return "https://v.qq.com/x/search/?q=%E4%B8%80%E4%BA%BA%E4%B9%8B%E4%B8%8B";
        case "神印王座": return "https://v.qq.com/x/search/?q=%E7%A5%9E%E5%8D%B0%E7%8E%8B%E5%BA%A7";
        case "遮天": return "https://v.qq.com/x/search/?q=%E9%81%AE%E5%A4%A9";
        case "大主宰": return "https://v.qq.com/x/search/?q=%E5%A4%A7%E4%B8%BB%E5%AE%B0";
        case "云深不知梦": return "https://so.youku.com/search/q_%E4%BA%91%E6%B7%B1%E4%B8%8D%E7%9F%A5%E6%A2%A6";
        case "仙剑奇侠传": return "https://v.qq.com/x/search/?q=%E4%BB%99%E5%89%91%E5%A5%87%E4%BE%A0%E4%BC%A0";
        case "神墓": return "https://so.youku.com/search/q_%E7%A5%9E%E5%A2%93";
        case "狐妖小红娘": return "https://v.qq.com/x/search/?q=%E7%8B%90%E5%A6%96%E5%B0%8F%E7%BA%A2%E5%A8%98";
        case "画江湖之不良人": return "https://v.qq.com/x/search/?q=%E4%B8%8D%E8%89%AF%E4%BA%BA";
        case "武庚纪": return "https://v.qq.com/x/search/?q=%E6%AD%A6%E5%BA%9A%E7%BA%AA";
        case "秦时明月": return "https://v.qq.com/x/search/?q=%E7%A7%A6%E6%97%B6%E6%98%8E%E6%9C%88";
        default: return "#";
    }
}

// 搜索建议
input.addEventListener('input', function () {
    const kw = input.value.trim().toLowerCase();
    if (!kw) {
        suggest.style.display = 'none';
        return;
    }
    const list = cartoonJson.top_20
        .map(item => item.title)
        .filter(t => t.toLowerCase().includes(kw))
        .slice(0, 5);
    showSuggest(list);
});

function showSuggest(list) {
    suggest.innerHTML = '';
    suggest.style.position = 'absolute';
    suggest.style.background = '#fff';
    suggest.style.border = '1px solid #eee';
    suggest.style.width = input.offsetWidth + 'px';
    suggest.style.zIndex = '999';
    suggest.style.marginTop = '5px';

    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggest-item';
        div.innerText = item;
        div.style.padding = '8px 12px';
        div.style.cursor = 'pointer';
        div.onmouseover = () => div.style.background = '#f5f5f5';
        div.onmouseout = () => div.style.background = '#fff';

        // 点击建议直接跳转
        div.onclick = () => {
            window.open(getLinkByTitle(item), '_blank');
            suggest.style.display = 'none';
        };
        suggest.appendChild(div);
    });
    suggest.style.display = list.length ? 'block' : 'none';
}

// 点击空白关闭建议
document.addEventListener('click', e => {
    if (!e.target.closest('.search-bar') && !e.target.closest('.suggest')) {
        suggest.style.display = 'none';
    }
});

// 搜索按钮功能
function search() {
    const kw = input.value.trim().toLowerCase();
    if (!kw) return;
    suggest.style.display = 'none';
}

// 绑定事件
btn.addEventListener('click', search);
input.addEventListener('keydown', e => e.key === 'Enter' && search());