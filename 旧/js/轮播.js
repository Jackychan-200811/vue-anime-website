 const slides = document.querySelector('.carousel-slides');
        const slideItems = document.querySelectorAll('.carousel-slide');
        const prevBtn = document.querySelector('.prev');
        const nextBtn = document.querySelector('.next');
        const indicators = document.querySelectorAll('.indicator');
        let currentIndex = 0;
        const totalSlides = slideItems.length;
        let autoplayInterval;

        // 切换到指定索引
        function goToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;
            slides.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
            updateIndicators();
        }

        // 更新指示器状态
        function updateIndicators() {
            indicators.forEach((ind, i) => {
                ind.classList.toggle('active', i === currentIndex);
            });
        }

        // 自动播放
        function startAutoplay() {
            autoplayInterval = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, 5000);
        }

        // 暂停自动播放
        function stopAutoplay() {
            clearInterval(autoplayInterval);
        }

        // 绑定事件
        prevBtn.addEventListener('click', () => {
            stopAutoplay();
            goToSlide(currentIndex - 1);
            startAutoplay();
        });
        nextBtn.addEventListener('click', () => {
            stopAutoplay();
            goToSlide(currentIndex + 1);
            startAutoplay();
        });
        indicators.forEach(ind => {
            ind.addEventListener('click', () => {
                stopAutoplay();
                goToSlide(parseInt(ind.dataset.index));
                startAutoplay();
            });
        });

        // 鼠标悬停暂停，离开继续
        document.querySelector('.carousel').addEventListener('mouseenter', stopAutoplay);
        document.querySelector('.carousel').addEventListener('mouseleave', startAutoplay);

        // 初始化
        startAutoplay();