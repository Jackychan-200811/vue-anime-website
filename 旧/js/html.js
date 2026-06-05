const { createApp } = Vue;

createApp({
  setup() {
    // 轮播状态（原功能不变）
    const currentIndex = Vue.ref(0);

    const nextSlide = () => {
      currentIndex.value = (currentIndex.value + 1) % 3;
    };

    const prevSlide = () => {
      currentIndex.value = (currentIndex.value - 1 + 3) % 3;
    };

    const goToSlide = (index) => {
      currentIndex.value = index;
    };

    return {
      currentIndex,
      nextSlide,
      prevSlide,
      goToSlide
    };
  },

  // 你的原页面结构 100% 保留，只改成 template
  template: `
          <div class="header-wrapper">
            <!-- 横幅背景 -->
            <div class="banner-bg">
            </div>

            <!-- 顶部悬浮导航栏 -->
            <div class="top-nav-bar">
                <div class="nav-left">
                    <div class="lk-logo">动漫</div>
                </div>

                <div class="search-area">
                    <a href="html2.html"><input type="text" class="search-input" id="search-input" placeholder="请在此处输入搜寻内容" autocomplete="off"></a>
                    <button class="search-btn" id="search-btn"><a href="html2.html">🔍</a></button>
                </div>

                <div class="nav-right">
                    <a href="#">登入/注册</a>
                    <a href="#">阅览纪录</a>
                    <a href="#" class="publish-btn">发帖</a>
                </div>
            </div>
             <!-- 分类导航 -->
            <div class="category-nav">
                <a href="html.html">首页</a>
                <a href="#">资讯</a>
                <a href="#">小说</a>
                <a href="#">漫画</a>
                <a href="./国漫/2233.html">国漫</a>
                <a href="./日漫/3344.html">日漫</a>
            </div>
            <div class="carousel-and-cards">
                <!-- 轮播区 -->
            <div class="carousel">
            <div class="carousel-slides">
                <!-- 替换图片-->
                <div class="carousel-slide">
                    <img src="https://你的图片地址1.jpg" alt="[N]CARNEADES 1">
                </div>
                <div class="carousel-slide">
                    <img src="https://你的图片地址2.jpg" alt="[N]CARNEADES 2">
                </div>
                <div class="carousel-slide">
                    <img src="https://你的图片地址3.jpg" alt="[N]CARNEADES 3">
                </div>
            </div>
            <button class="carousel-btn prev">&lt;</button>
            <button class="carousel-btn next">&gt;</button>
            <div class="carousel-indicators">
                <span class="indicator active" data-index="0"></span>
                <span class="indicator" data-index="1"></span>
                <span class="indicator" data-index="2"></span>
            </div>
            
        </div>
        <div>
            <div class="card-grid">
        <!-- 卡片1 -->
        <div class="card">
            <img src="你的图片1地址.jpg" alt="[N]大色狼催眠术师之子3" class="card-img">
            <div class="card-title">[N]大色狼催眠术师之子3</div>
        </div>
        <!-- 卡片2 -->
        <div class="card">
            <img src="你的图片2地址.jpg" alt="[N]义妹生活12" class="card-img">
            <div class="card-title">[N]义妹生活12</div>
        </div>
        <!-- 卡片3 -->
        <div class="card">
            <img src="你的图片3地址.jpg" alt="[原创]身为VTuber的我" class="card-img">
            <div class="card-title">[原创]身为VTuber的我，一觉醒来成了地球上最后的女孩</div>
        </div>
        <!-- 卡片4 -->
        <div class="card">
            <img src="你的图片4地址.jpg" alt="[C]苍蓝钢铁的琶音174话" class="card-img">
            <div class="card-title">[C]苍蓝钢铁的琶音174话</div>
        </div>
        <!-- 卡片5 -->
        <div class="card">
            <img src="你的图片5地址.jpg" alt="[A]败犬女主太多了！" class="card-img">
            <div class="card-title">[A]败犬女主太多了！</div>
        </div>
        <!-- 卡片6 -->
        <div class="card">
            <img src="你的图片6地址.jpg" alt="[讨论]《灰与幻想的格林姆迦尔》的吐槽" class="card-img">
            <div class="card-title">[讨论]《灰与幻想的格林姆迦尔》的吐槽</div>
        </div>
    </div>
            </div>
            
        </div>
        <!-- 主内容区 -->
        <div class="main-content">
            <div class="content-left">
                <!-- 国漫模块 -->
                <div class="module">
                    <div class="module-header">
                        <div class="module-title">国漫</div>
                        <a href="./国漫/2233.html" class="module-more">更多</a>
                    </div>
                    <div class="novel-list">
                        <div class="novel-item">
                            <img src="https://picsum.photos/id/243/140/200" alt="唯有这段恋爱要无法推理">
                            <div class="title">唯有这段恋爱要无法推理</div>
                            <div class="stats">💬 1134 📝 3</div>
                        </div>
                        <div class="novel-item">
                            <img src="https://picsum.photos/id/244/140/200" alt="败犬女主太多了！8.5">
                            <div class="title">败犬女主太多了！8.5</div>
                            <div class="stats">💬 35762 📝 90</div>
                        </div>
                        <div class="novel-item">
                            <img src="https://picsum.photos/id/245/140/200" alt="怪人的沙拉碗9">
                            <div class="title">怪人的沙拉碗 9</div>
                            <div class="stats">💬 5364 📝 20</div>
                        </div>
                        <div class="novel-item">
                            <img src="https://picsum.photos/id/246/140/200" alt="难题特别多的餐厅">
                            <div class="title">难题特别多的餐厅</div>
                            <div class="stats">💬 446 📝 3</div>
                        </div>
                        <div class="novel-item">
                            <img src="https://picsum.photos/id/247/140/200" alt="被卷入了勇者召唤事件">
                            <div class="title">被卷入了勇者召唤事件却发现异世界很和平</div>
                            <div class="stats">💬 11659 📝 58</div>
                        </div>
                    </div>
                </div>

                <!-- 日漫模块 -->
                <div class="module">
                    <div class="module-header">
                        <div class="module-title">日漫</div>
                        <a href="./日漫/3344.html" class="module-more">更多</a>
                    </div>
                    <div class="novel-list">
                        <div class="novel-item">
                            <img src="https://picsum.photos/id/243/140/200" alt="唯有这段恋爱要无法推理">
                            <div class="title">唯有这段恋爱要无法推理</div>
                            <div class="stats">💬 1134 📝 3</div>
                        </div>
                        <div class="novel-item">
                            <img src="https://picsum.photos/id/244/140/200" alt="败犬女主太多了！8.5">
                            <div class="title">败犬女主太多了！8.5</div>
                            <div class="stats">💬 35762 📝 90</div>
                        </div>
                        <div class="novel-item">
                            <img src="https://picsum.photos/id/245/140/200" alt="怪人的沙拉碗9">
                            <div class="title">怪人的沙拉碗 9</div>
                            <div class="stats">💬 5364 📝 20</div>
                        </div>
                        <div class="novel-item">
                            <img src="https://picsum.photos/id/246/140/200" alt="难题特别多的餐厅">
                            <div class="title">难题特别多的餐厅</div>
                            <div class="stats">💬 446 📝 3</div>
                        </div>
                        <div class="novel-item">
                            <img src="https://picsum.photos/id/247/140/200" alt="被卷入了勇者召唤事件">
                            <div class="title">被卷入了勇者召唤事件却发现异世界很和平</div>
                            <div class="stats">💬 11659 📝 58</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-right">
                <!-- 国漫排行 -->
                <div class="module">
                    <div class="module-title">国漫排行</div>
                    <div class="rank-list">
                        <div class="rank-item">
                            <span class="rank-num">①</span>
                            <div class="rank-title">[葵天扇]真遗憾 3（玩乐关系/玩死的老婆解体）[他 鸡鸡文库]</div>
                        </div>
                        <div class="rank-stats">2个月前</div>
                        <div class="rank-item">
                            <span class="rank-num">②</span>
                            <div class="rank-title">[まじか]我国魔法使的冒险16(3/20 ...</div>
                        </div>
                        <div class="rank-item">
                            <span class="rank-num">③</span>
                            <div class="rank-title">[七树]与营业科的痴女同事之间，仅仅...</div>
                        </div>
                        <div class="rank-item">
                            <span class="rank-num">④</span>
                            <div class="rank-title">[真人]阔情哥哥病娇妹妹的爱生活 ...</div>
                        </div>
                        <div class="rank-item">
                            <span class="rank-num">⑤</span>
                            <div class="rank-title">第一卷（完）</div>
                        </div>
                        <div class="rank-item">
                            <span class="rank-num">⑥</span>
                            <div class="rank-title">[雨宫 ゆう]那时候曾有好怒的女孩们...</div>
                        </div>
                        <div class="rank-item">
                            <span class="rank-num">⑦</span>
                            <div class="rank-title">[鸭崎 东]卫与爱很沉重的少女们 1[...</div>
                        </div>
                    </div>
                </div>

                <!-- 日漫排行 -->
                <div class="module">
                    <div class="module-title">日漫排行</div>
                    <div class="rank-list">
                        <div class="rank-item">
                            <span class="rank-num">①</span>
                            <div class="rank-title">[葵天扇]真遗憾 3（玩乐关系/玩死的老婆解体）[他 鸡鸡文库]</div>
                        </div>
                        <div class="rank-stats">2个月前</div>
                        <div class="rank-item">
                            <span class="rank-num">②</span>
                            <div class="rank-title">[まじか]我国魔法使的冒险16(3/20 ...</div>
                        </div>
                        <div class="rank-item">
                            <span class="rank-num">③</span>
                            <div class="rank-title">[七树]与营业科的痴女同事之间，仅仅...</div>
                        </div>
                        <div class="rank-item">
                            <span class="rank-num">④</span>
                            <div class="rank-title">[真人]阔情哥哥病娇妹妹的爱生活 ...</div>
                        </div>
                        <div class="rank-item">
                            <span class="rank-num">⑤</span>
                            <div class="rank-title">第一卷（完）</div>
                        </div>
                        <div class="rank-item">
                            <span class="rank-num">⑥</span>
                            <div class="rank-title">[雨宫 ゆう]那时候曾有好怒的女孩们...</div>
                        </div>
                        <div class="rank-item">
                            <span class="rank-num">⑦</span>
                            <div class="rank-title">[鸭崎 东]卫与爱很沉重的少女们 1[...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
  `
}).mount('#app');