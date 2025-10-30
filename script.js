
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) { 
        scrollToTopBtn.style.display = 'flex';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Scroll the page to the products section when the Shop Now button is clicked
const shopNowBtn = document.querySelector('.cta');
if (shopNowBtn) {
    shopNowBtn.addEventListener('click', (e) => {
        // prevent any default behavior
        e.preventDefault();
        const products = document.getElementById('products');
        if (products) {
            products.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}
