(() => {
    const init = () => {
        buildHTML();
        buildCSS();
        setEvents();
        loadProducts();
    };

    // Global variables
    const API_URL = 'https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json'; // Sample API URL for product data
    const STORAGE_KEYS = {
        PRODUCTS: 'carousel_products',
        FAVORITES: 'carousel_favorites'
    }; // Keys for localStorage

    let products = []; // Array that holds product data
    let favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || []; // Array that holds favorite product IDs
    let currentTranslate = 0; 
    let itemWidth = 0; 
    let containerWidth = 0;
    let visibleItems = 0;

    // Responsive breakpoints for carousel item count
    const getVisibleItems = () => {
        const w = window.innerWidth;
        if (w <= 480) return 2;
        if (w <= 768) return 3;
        if (w <= 1024) return 4;
        return 5;
    };

    // Generate a random integer between min and max for randomized review counts
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const buildHTML = () => {
        const fontLinks = [
            'https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap',
            'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,0,1,0&icon_names=percent_discount',
            'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=favorite,star'
        ];
        
        fontLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        });

        const html = `
            <div class="carousel-section">
                <div class="carousel-container">
                    <div class="carousel-title">
                        <b>Beğenebileceğinizi düşündüklerimiz</b>
                    </div>
                    <div class="carousel-wrapper">
                        <div class="carousel-track-container">
                            <div class="carousel-track" id="carouselTrack">
                                <div class="loading">Ürünler yükleniyor...</div>
                            </div>
                        </div>
                        <button class="carousel-nav prev" id="prevBtn">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                            </svg>
                        </button>
                        <button class="carousel-nav next" id="nextBtn">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Find hero banner using class selector or select first section in main to append carousel after it
        const heroSection = document.querySelector('.Section1') || document.querySelector('main > section:first-child');
        if (heroSection) {
            heroSection.insertAdjacentHTML('afterend', html);
        } else {
            const main = document.querySelector('main') || document.body;
            main.insertAdjacentHTML('afterbegin', html);
        }
    };

    const buildCSS = () => {
        const css = `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            :root {
                --Primary-600: #005983;
                --Primary-400: #0091d5;
                --Primary-200: #d5effb;
                --Primary-100: #f2fafe;
                --Secondary-600: #a05e00;
                --Secondary-400: #ff8a00;
                --Secondary-400-Bg: #ff88001e;
                --Secondary-100: #fef8eb;
                --Success-400: #00a365;
                --Success-100: #eafff7;
                --Error-400: #ff4949;
                --Warning-400: #ffc938;
                --Neutral-0: #fff;
                --Neutral-100: #f7f9fa;
                --Neutral-200: #f2f5f7;
                --Neutral-300: #e1e6ea;
                --Neutral-500: #c1ccd4;
                --Neutral-600: #a2b1bc;
                --Neutral-700: #444c56;
                --Neutral-800: #2b2f33;
            }

            .carousel-section { margin: 20px 0px; }
            
            .carousel-container {
                max-width: 1340px;
                height: fit-content;
                margin: 0 auto;
                padding: 0 10px;
                position: relative;
                border: none;
                border-radius: 1.5rem;
                box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.02);
            }

            .carousel-title {
                display: flex;
                background-color: #ff88001e;
                color: var(--Secondary-400);
                border-top-left-radius: 1.5rem;
                border-top-right-radius: 1.5rem;
                margin-bottom: 1rem;
                min-height: 4rem;
                max-height: 60px;
                height: 60px;
                align-items: center;
            }

            .carousel-title b {
                margin-left: 48px;
                font-size: 20px;
                font-family: 'Quicksand';
                font-weight: semi-bold;
            }

            .carousel-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                gap: 16px;
                padding-bottom: 16px;
                height: fit-content;
            }

            .carousel-nav {
                position: absolute;
                background-color: #ff88001e;
                border: none;
                padding: 1px 4px;
                border-radius: 50%;
                width: 42px;
                height: 42px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--Secondary-400);
                cursor: pointer;
                z-index: 10;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .carousel-nav.prev {
                position: absolute;
                left: -5%;
                top: 50%;
                transform: translateY(-50%);
            }

            .carousel-nav.next {
                position: absolute;
                right: -5%;
                top: 50%;
                transform: translateY(-50%);
            }

            .carousel-nav:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .carousel-track-container {
                overflow: hidden;
                flex: 1;
                position: relative;
            }

            .carousel-track {
                display: flex;
                transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                gap: 16px;
            }

            .loading {
                text-align: center;
                padding: 40px;
                color: #666;
                width: 100%;
            }

            .product-card {
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
                background: #fff;
                border-radius: 10px;
                border: 1px solid #ececec;
                overflow: hidden;
                transition: all 0.2s ease;
                cursor: pointer;
                position: relative;
                width: 100%;
                min-width: 160px;
                max-width: 280px;
            }

            .product-card:hover {
                box-shadow: 0 8px 12px rgba(0,0,0,0.10);
            }

            .product-image-container {
                position: relative;
                aspect-ratio: 4/3;
                width: 100%;
                height: auto;
                max-height: 160px;
                overflow: visible;
                background: #FFFFFF;
            }

            .product-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                -webkit-user-drag: none;
                user-select: none;
                pointer-events: none;
            }

            .badge-container {
                position: absolute;
                top: 12px;
                left: 12px;
                display: flex;
                flex-direction: column;
                gap: 4px;
                z-index: 2;
            }

            .badge {
                display: flex;
                justify-content: center;
                align-items: center; 
                background: linear-gradient(180deg,rgba(0, 163, 101, 1) 0%, rgba(0, 209, 129, 1) 95%);
                color: white;
                font-family: Quicksand;
                font-size: 8px;
                font-weight: bold;
                border-radius: 100%;
                height: 42px;
                width: 42px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }

            .favorite-btn {
                position: absolute;
                top: 8px;
                right: 12px;
                background: rgba(255,255,255,0.95);
                border: none;
                border-radius: 50%;
                width: 38px;
                height: 38px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 3;
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
            }

            .favorite-btn:hover {
                box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.45);
                font-variation-settings: 'FILL' 1;
            }

            .favorite-btn .material-symbols-rounded {
                font-size: 24px;
                color: #ff8a00;
            }

            .favorite-btn.active .material-symbols-rounded {
                font-variation-settings: 'FILL' 1;
            }

            .product-info {
                padding: 16px;
                overflow: hidden;
            }

            .product-info b {
                font-size: 12px;
                color: #202020ff;
                font-weight: bold;
                margin-bottom: 4px;
                text-transform: capitalize;
                overflow: hidden;
            }

            .product-info h2 {
                font-size: 12px;
                font-weight: regular;
                color: #202020ff;
                line-height: 1.4;
                margin-bottom: 8px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                min-height: 34px;
            }

            .product-rating {
                display: flex;
                align-items: center;
                margin-bottom: 4px;
                height: 20px;
                padding-left: 8px;
            }

            .product-rating .material-symbols-rounded {
                font-size: 20px;
                color: rgba(143, 137, 137, 0.4);
            }

            .product-rating .material-symbols-rounded.filled {
                color: var(--Warning-400);
                font-variation-settings: 'FILL' 1;
            }

            .review-count {
                font-size: 12px;
                color: #666;
                margin-left: 4px;
            }

            .price-container {
                height: 54px;
                margin-bottom: 8px;
                padding-left: 4px;
            }

            .price-row {
                display: flex;
                height: 20px;
                margin-bottom: 4px;
                align-items: center;
                gap: 6px;
                flex-wrap: nowrap;
            }

            .original-price {
                font-family: 'Quicksand', sans-serif;
                font-size: 12px;
                color: #999;
                text-decoration: line-through;
                font-weight: 500;
            }

            .discount-badge {
                color: var(--Success-400);
                font-size: 16px;
                font-weight: 700;
                line-height: 1;
                min-width: 28px;
                text-align: center;
                display: inline-block;
            }

            .current-price {
                font-family: 'Quicksand', sans-serif;
                font-size: 20px;
                height: 24px;
                margin-bottom: 12px;
                font-weight: 700;
                color: #333;
            }

            .current-price.discounted {
                color: var(--Success-400);
            }

            .promotion-text {
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #00a36411;
                height: 26px;
                width: fit-content;
                padding: 6px 8px;
                border-radius: 16px;
                margin-bottom: 2rem;
            }

            .promotion-text b {
                font-family: 'Quicksand', sans-serif;
                font-size: 10px;
                font-weight: 540;
                color: var(--Success-400);
            }

            .add-to-cart {
                background: var(--Secondary-400-Bg);
                color: var(--Secondary-400);
                border: none;
                border-radius: 24px;
                padding: 12px;
                font-family: 'Quicksand', sans-serif;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                height: 48px;
                width: 100%;
            }

            .add-to-cart:hover {
                background: var(--Secondary-400);
                color: white;
            }

            /* Responsive Design */
            @media (min-width: 1200px) {
                .carousel-container { max-width: 1320px; padding: 0 20px; }
                .carousel-title b { font-size: 24px; margin-left: 48px; }
            }

            @media (min-width: 1024px) and (max-width: 1199px) {
                .carousel-container { max-width: 1120px; padding: 0 18px; }
                .carousel-title b { font-size: 22px; margin-left: 44px; }
                .product-image-container { max-height: 165px; }
            }

            @media (min-width: 768px) and (max-width: 1023px) {
                .carousel-container { padding: 0 16px; border-radius: 1.25rem; }
                .carousel-title { min-height: 3.5rem; }
                .carousel-title b { font-size: 20px; margin-left: 40px; }
                .carousel-nav { width: 40px; height: 40px; visibility: hidden;}
                .product-image-container { max-height: 170px; }
                .product-info { padding: 15px; }
                .current-price { font-size: 19px; }
                .carousel-track { gap: 14px; }
                .carousel-wrapper { gap: 14px; }
            }

            @media (min-width: 481px) and (max-width: 767px) {
                .carousel-section { margin: 40px 0px; }
                .carousel-container { padding: 0 14px; border-radius: 1.2rem; }
                .carousel-title { margin-bottom: 18px; min-height: 3.2rem; }
                .carousel-title b { font-size: 18px; margin-left: 36px; }
                .carousel-nav { width: 38px; height: 38px; }
                .carousel-nav.prev { left: -4px; }
                .carousel-nav.next { right: -4px; }
                .product-image-container { max-height: 150px; }
                .product-info { padding: 14px; }
                .current-price { font-size: 18px; }
                .carousel-track { gap: 12px; }
                .carousel-wrapper { gap: 12px; }
            }

            @media (max-width: 480px) {
                .carousel-section { margin: 30px 0px; }
                .carousel-container { padding: 0 12px; border-radius: 1rem; }
                .carousel-title { margin-bottom: 16px; min-height: 3rem; }
                .carousel-title b { font-size: 16px; margin-left: 28px; }
                .carousel-nav { width: 36px; height: 36px; }
                .carousel-nav.prev { left: -3px; visibility: hidden; }
                .carousel-nav.next { right: -3px; visibility: hidden; }
                .product-image-container { max-height: 135px; }
                .product-info { padding: 12px; }
                .current-price { font-size: 17px; }
                .carousel-track { gap: 8px; }
                .carousel-wrapper { gap: 8px; }
            }

            @media (max-width: 380px) {
                .carousel-container { padding: 0 8px; }
                .carousel-title b { font-size: 14px; margin-left: 24px; }
                .product-image-container { max-height: 120px; }
                .current-price { font-size: 16px; }
            }

            @media (max-height: 500px) and (orientation: landscape) {
                .carousel-section { margin: 20px 0px; }
                .carousel-title { min-height: 2.5rem; margin-bottom: 12px; }
                .product-image-container { max-height: 100px; }
                .current-price { font-size: 15px; }
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };

    // Calculate discount percentage by comparing price and original price
    // If price is greater than or equal to original price, return 0
    // Round to nearest whole number
    const calculateDiscount = (price, originalPrice) => {
        if (price >= originalPrice || originalPrice === price) return 0;
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    // Format price as Turkish Lira with 2 decimal places
    // For example 1234.5 = 1.234,50 TL
    const formatPrice = (price) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price) + ' TL';
    };

    // Create product card HTMLs with all details the that are fetched from API
    // Show discount badge if there is a discount
    // Highlight favorite button if product is in favorites list
    const createProductCard = (product) => {

        const rating = getRandomInt(1, 5); // Random rating between 1 and 5
        const reviewCount = getRandomInt(1, 99999); // Random review count between 1 and 9999
        const isFavorite = favorites.includes(product.id);
        
        let displayPrice = product.price;
        let displayOriginalPrice = product.original_price;
        let starsHtml = '';

        // Generate star rating HTML
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<span class="material-symbols-rounded${i <= rating ? ' filled' : ''}">star</span>`;
        }
        
        // Special case for product with id 8 where price is higher than original_price
        if (product.id === 8 && product.price > product.original_price) {
            displayPrice = product.original_price;
            displayOriginalPrice = product.price;
        }

        const discountPercent = calculateDiscount(displayPrice, displayOriginalPrice);
        const hasDiscount = discountPercent > 0;

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-container">
                    <img class="product-image" src="${product.img}" alt="${product.name}" loading="lazy">
                    <div class="badge-container">
                        <div class="badge">KARGO<br>BEDAVA</div>
                    </div>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-product-id="${product.id}">
                        <span class="material-symbols-rounded">favorite</span>
                    </button>
                </div>
                <div class="product-info">
                    <h2>
                        <b>${product.brand} - </b>
                        ${product.name}
                    </h2>
                    <div class="product-rating">
                        ${starsHtml}
                        <span class="review-count">(${reviewCount})</span>
                    </div>
                    <div class="price-container">
                        <div class="price-row">
                            ${hasDiscount ? `
                            <span class="original-price">${formatPrice(displayOriginalPrice)}</span>
                            <span class="discount-badge">%${discountPercent}</span>
                            <svg class="discount-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00a365"><path d="M480-80q-24 0-46-9t-39-26q-29-29-50-38t-63-9q-50 0-85-35t-35-85q0-42-9-63t-38-50q-17-17-26-39t-9-46q0-24 9-46t26-39q29-29 38-50t9-63q0-50 35-85t85-35q42 0 63-9t50-38q17-17 39-26t46-9q24 0 46 9t39 26q29 29 50 38t63 9q50 0 85 35t35 85q0 42 9 63t38 50q17 17 26 39t9 46q0 24-9 46t-26 39q-29 29-38 50t-9 63q0 50-35 85t-85 35q-42 0-63 9t-50 38q-17 17-39 26t-46 9Zm100-240q25 0 42.5-17.5T640-380q0-25-17.5-42.5T580-440q-25 0-42.5 17.5T520-380q0 25 17.5 42.5T580-320Zm-230-30q12 12 28 12t28-12l204-203q12-12 12-28.5T610-610q-12-12-28.5-12T553-610L350-406q-12 12-12 28t12 28Zm30-170q25 0 42.5-17.5T440-580q0-25-17.5-42.5T380-640q-25 0-42.5 17.5T320-580q0 25 17.5 42.5T380-520Z"/></svg>
                            ` : ''}
                        </div>
                        <div class="current-price${hasDiscount ? ' discounted' : ''}">${formatPrice(displayPrice)}</div>
                    </div>
                    <div class="promotion-text">
                        <b>Farklı Ürünlerde 3 Al 2 Öde</b>
                    </div>
                    <button class="add-to-cart">Sepete Ekle</button>
                </div>
            </div>
        `;
    };

    // Put all products into the carousel track
    const renderProducts = () => {
        const track = document.getElementById('carouselTrack');
        if (!track || !products.length) return;

        track.innerHTML = products.map(createProductCard).join('');
        calculateDimensions();
        updateCarouselPosition();
    };

    // Calculate item width and visible item count based on container width for a responsive design
    const calculateDimensions = () => {
        const container = document.querySelector('.carousel-track-container');
        if (!container) return;
        
        containerWidth = container.offsetWidth;
        visibleItems = getVisibleItems();
        
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.style.flexBasis = `calc(${100/visibleItems}% - ${(16 * (visibleItems-1))/visibleItems}px)`;
        });
        
        itemWidth = containerWidth / visibleItems;
    };

    // Update carousel position based on currentTranslate value
    // currentTranslate value is calculated in slideNext and slidePrev functions
    // Disable buttons when at the start or end of the carousel
    const updateCarouselPosition = () => {
        const track = document.getElementById('carouselTrack');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
            
        // If carousel track is not found, return
        if (!track) return;

        const cards = document.querySelectorAll('.product-card');
        if (cards.length < 2) return;
        
        // Calculate actual card spacing including margin
        const firstCardRect = cards[0].getBoundingClientRect();
        const secondCardRect = cards[1].getBoundingClientRect();
        const actualItemSpacing = secondCardRect.left - firstCardRect.left;
        
        const contentWidth = (products.length - visibleItems) * actualItemSpacing;
        const maxTranslate = -Math.max(0, contentWidth);
        
        const currentIndex = Math.round(Math.abs(currentTranslate) / actualItemSpacing);
        currentTranslate = -currentIndex * actualItemSpacing;
        
        currentTranslate = Math.min(0, Math.max(maxTranslate, currentTranslate));

        track.style.transform = `translateX(${currentTranslate}px)`;

        // Disable prev button at the start, disable next button at the end
        if (prevBtn) {
            prevBtn.disabled = currentTranslate >= 0;
        }
        
        if (nextBtn) {
            const remainingScrolls = Math.max(0, products.length - visibleItems);
            const currentScrollIndex = Math.abs(currentTranslate) / actualItemSpacing;
            nextBtn.disabled = currentScrollIndex >= remainingScrolls;
        }
    };

    // Slide to next or previous item and update currentTranslate value accordingly
    const slideNext = () => {
        const cards = document.querySelectorAll('.product-card');
        if (cards.length < 2) return;
        
        const firstCardRect = cards[0].getBoundingClientRect();
        const secondCardRect = cards[1].getBoundingClientRect();
        const actualItemSpacing = secondCardRect.left - firstCardRect.left;
        
        const contentWidth = (products.length - visibleItems) * actualItemSpacing;
        const maxTranslate = -Math.max(0, contentWidth);
        
        currentTranslate -= actualItemSpacing;
        currentTranslate = Math.max(maxTranslate, currentTranslate);
        
        updateCarouselPosition();
    };

    const slidePrev = () => {
        const cards = document.querySelectorAll('.product-card');
        if (cards.length < 2) return;
        
        const firstCardRect = cards[0].getBoundingClientRect();
        const secondCardRect = cards[1].getBoundingClientRect();
        const actualItemSpacing = secondCardRect.left - firstCardRect.left;
        
        currentTranslate += actualItemSpacing;
        currentTranslate = Math.min(0, currentTranslate);
        
        updateCarouselPosition();
    };

    // Toggle favorite status of a product and update localStorage
    const toggleFavorite = (productId) => {
        const index = favorites.indexOf(productId);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(productId);
        }

        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        
        const favoriteBtn = document.querySelector(`.favorite-btn[data-product-id="${productId}"]`);
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active');
        }
    };

    // Load products from localStorage if available, and if not available fetch from API
    // Cache fetched products in localStorage to use in future
    const loadProducts = async () => {
        try {
            const cachedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
            
            if (cachedProducts) {
                products = JSON.parse(cachedProducts);
                renderProducts();
            } else {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Failed to fetch products');
                
                products = await response.json();
                localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
                renderProducts();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            const track = document.getElementById('carouselTrack');
            // Show error message in carousel track if fetch fails
            if (track) {
                track.innerHTML = '<div class="loading">Ürünler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</div>';
            }
        }
    };

    // Set all event listeners for buttons, window resize etc.
    const setEvents = () => {
        document.addEventListener('click', (e) => {

            // Handle prev and next button clicks
            if (e.target.closest('#prevBtn')) {
                slidePrev();
                return;
            }
            
            if (e.target.closest('#nextBtn')) {
                slideNext();
                return;
            }

            // Handle product card click to open product URL in new tab
            const productCard = e.target.closest('.product-card');
            if (productCard && !e.target.closest('.favorite-btn') && !e.target.closest('.add-to-cart')) {
                const productId = parseInt(productCard.dataset.productId);
                const product = products.find(p => p.id === productId);
                if (product) {
                    window.open(product.url, '_blank');
                }
                return;
            }

            // Handle favorite button click
            const favoriteBtn = e.target.closest('.favorite-btn');
            if (favoriteBtn) {
                e.preventDefault();
                e.stopPropagation();
                const productId = parseInt(favoriteBtn.dataset.productId);
                toggleFavorite(productId);
                return;
            }

            // Handle add to cart button click
            const addToCartBtn = e.target.closest('.add-to-cart');
            if (addToCartBtn) {
                e.preventDefault();
                e.stopPropagation();
                addToCartBtn.textContent = 'Eklendi!';
                addToCartBtn.style.background = '#00a365';
                addToCartBtn.style.color = '#ffffff';
                setTimeout(() => {
                    addToCartBtn.textContent = 'Sepete Ekle';
                    addToCartBtn.style.background = '';
                    addToCartBtn.style.color = '';
                }, 1500);
            }
        });

        // Recalculate dimensions and update carousel position on window resize
        window.addEventListener('resize', () => {
            calculateDimensions();
            updateCarouselPosition();
        });

        let startX = 0;
        let isDragging = false;

        // Touch events for swipe functionality that will be used on mobile devices for responsive design
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.carousel-track')) {
                startX = e.touches[0].clientX;
                isDragging = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        document.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > 30) {
                if (diffX > 0) {
                    slideNext();
                } else {
                    slidePrev();
                }
            } else {
                updateCarouselPosition(); 
            }
            
            isDragging = false;
        });
    };

    init();
})();