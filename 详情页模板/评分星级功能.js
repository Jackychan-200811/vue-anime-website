// 将分数（0-10）转换为 5 星制（每星 2 分），并填充到指定容器
function renderStars(score, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 计算整星个数（每星2分，所以整星数 = floor(score/2)）
    let fullStars = Math.floor(score / 2);
    // 是否有半星：当分数的小数部分 >= 0.5 且未达到下一整星时
    let hasHalfStar = (score - fullStars * 2) >= 0.5;
    // 空星数量 = 总星数5 - 整星数 - (半星数?1:0)
    let emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    // 边界保护：防止分数异常导致整星数超过5
    fullStars = Math.min(fullStars, 5);
    if (fullStars === 5) {
        hasHalfStar = false;
        emptyStars = 0;
    }
    
    let starsHtml = '';
    // 添加整星
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    // 添加半星
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    // 添加空星（使用 far fa-star 轮廓星）
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    container.innerHTML = starsHtml;
}

// 为所有评论渲染星星
function renderReviewStars() {
    const reviewStarsContainers = document.querySelectorAll('.review-score-stars');
    reviewStarsContainers.forEach(container => {
        const reviewItem = container.closest('.review-item');
        const scoreSpan = reviewItem.querySelector('.review-score-number');
        if (scoreSpan) {
            const score = parseFloat(scoreSpan.innerText);
            if (!isNaN(score)) {
                const tempId = 'temp_' + Math.random().toString(36).substr(2, 8);
                container.id = tempId;
                renderStars(score, tempId);
                container.removeAttribute('id');
            }
        }
    });
}

// 页面加载后执行
window.addEventListener('DOMContentLoaded', () => {
    // 渲染顶部主评分
    const scoreElement = document.getElementById('animeScore');
    if (scoreElement) {
        const score = parseFloat(scoreElement.innerText);
        if (!isNaN(score)) {
            renderStars(score, 'starContainer');
        }
    }
    // 渲染所有短评的星星
    renderReviewStars();
});