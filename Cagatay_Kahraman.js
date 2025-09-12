(() => {
    const init = () => {
        buildHTML();
        buildCSS();
        setEvents();
        fetchProducts();
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
        if (w <= 992) return 2;
        if (w <= 1280) return 3;
        if (w <= 1480) return 4;
        return 5;
    };

    // Generate a random integer between min and max for randomized review counts
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const buildHTML = () => {
        const fontLinks = [
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
            'https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap',
        ];
        
        fontLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        });

        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.head.appendChild(viewport);
        }
        
        const html = `
            <div class="carousel-section">
                <div class="carousel-container">
                    <div class="carousel-title">
                        <b>Beğenebileceğinizi Düşündüklerimiz</b>
                    </div>
                    <div class="carousel-wrapper">
                        <div class="carousel-track-container">
                            <div class="carousel-track" id="carouselTrack">
                                <div class="loading">Ürünler yükleniyor...</div>
                            </div>
                        </div>
                        <button class="carousel-nav prev" id="prevBtn">
                            <i class="left-button-icon"></i>
                        </button>
                        <button class="carousel-nav next" id="nextBtn">
                            <i class="next-button-icon"></i>
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
            .carousel-section {
                margin: 20px 0;
                font-family: 'Quicksand', sans-serif;
                max-width: 100vw;
                box-sizing: border-box; 
            }

            .carousel-section * {
                box-sizing: border-box;
            }
            
            .carousel-section .carousel-container {
                width: 100%;
                max-width: 1320px;
                height: fit-content;
                margin: 0 auto;
                padding: 0 15px;
                position: relative;
                border: none;
                box-sizing: border-box;
            }

            .carousel-section .carousel-wrapper {
                position: relative !important;
                display: flex !important;
                align-items: center;
                gap: 16px;
                height: fit-content;
            }

            .carousel-section .carousel-title {
                display: flex !important;
                color: black;
                margin-bottom: clamp(16px, 2vw, 20px);
                min-height: 4rem;
                height: auto;
                align-items: center;
            }

            .carousel-section .carousel-title b {
                font-size: 24px;
                font-family: 'Quicksand-Semibold';
                font-weight: 600;
            }

            .carousel-section .carousel-nav {
                position: absolute !important;
                background-color: var(--Neutral-0---White) !important;
                border: none;
                padding: 1px 4px;
                border-radius: 50% !important;
                box-shadow: inset 0 6px 2px 0 #b0b0b003,0 2px 9px 0 #b0b0b014,0 2px 4px 0 #b0b0b024,0 0 1px 0 #b0b0b03d,0 0 1px 0 #b0b0b047;
                width: clamp(28px, 8vw, 40px);
                height: clamp(28px, 8vw, 40px);
                display: flex !important;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
            }

            .carousel-section .carousel-nav i {
                width: clamp(8px, 4vw, 14px);  
                height: clamp(8px, 4vw, 14px); 
                display: inline-block;
                background-repeat: no-repeat;
                background-size: contain;
                background-position: 50%;
                aspect-ratio: 1;
            }

            .carousel-section .left-button-icon {
                background-image: url('https://cdn06.e-bebek.com/assets/toys/svg/arrow-left.svg');
            }

            .carousel-section .next-button-icon {
                background-image: url('https://cdn06.e-bebek.com/assets/toys/svg/arrow-right.svg');
            }

            .carousel-section .carousel-nav.prev {
                left: -65px;
                top: 50%;
                bottom: auto;
                transform: translateY(-50%);
            }

            .carousel-section .carousel-nav.next {
                right: -65px;
                top: 50%;
                bottom: auto;
                transform: translateY(-50%);
            }

            .carousel-section .carousel-track-container {
                overflow: hidden !important;
                flex: 1;
                position: relative;
            }

            .carousel-section .carousel-track {
                display: flex !important;
                transition: transform 0.25s;
                gap: 16px;
            }

            .carousel-section .product-card {
                flex: 0 0 auto;                   
                width: calc((100% - 64px) / 5) !important;
                aspect-ratio: 243/385;
                max-height: 385px !important;                  
                font-size: clamp(8px, 2.5vw, 12px);
                border-radius: 8px;
                position: relative;
                display: block !important;
                font-family: 'Quicksand', sans-serif;
                background: #fff;
                border: 1px solid var(--Neutral-200);
                overflow: hidden;
                transition: all 0.2s ease;
                cursor: pointer;
                text-decoration: none;
                background-color: var(--Neutral-0---White);
                z-index: 1;
            }

            .carousel-section .product-card:hover {
                border: 1px solid var(--Neutral-500);
            }

            .carousel-section .product-card-wrapper{
                color: unset;
                background: unset;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100%;
            }

            .carousel-section .product-image-container {
                position: relative;
                aspect-ratio: 243/203 important!;
                width: 100% important!;
                height: 203px important!;
                overflow: hidden;
                margin-bottom: 10px;
            }

            .carousel-section .badge-container {
                position: absolute;
                left: 6px;
                top: 6px;
                border-radius: 15px;
                height: fit-content;
                display: flex;
                justify-content: flex-start;
                flex-direction: column;
                gap: 3px;
            }

            .carousel-section .badge-icon {
                display: flex;
                margin-bottom: 2px;
                width: 40px;
                height: auto;
                aspect-ratio: 1;
                background-repeat: no-repeat;
                background-size: contain;
            }

            .carousel-section .badge-icon.top-seller {
                background-image: url('https://cdn06.e-bebek.com/assets/toys/svg/most-seller-product.svg');
            }

            .carousel-section .badge-icon.star-product {
                background-image: url('https://cdn06.e-bebek.com/assets/toys/svg/star-product.svg');
            }

            .carousel-section .video-ar-container {
                display: flex;
                flex-direction: column;
                grid-gap: 2px;
                gap: 2px;
                position: absolute;
                bottom: 6px;
                left: 6px;
                z-index: 2;
            }

            .carousel-section .video-icon-container {
                width: 20px;
                height: 20px;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 100%;
                background-color: var(--Neutral-700);
                z-index: 2;
            }

            .carousel-section .ar-icon-container {
                width: 20px;
                height: 20px;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 100%;
                background-color: var(--Neutral-700);
                z-index: 2;
            }

            .carousel-section .video-icon {
                aspect-ratio: 6.66 / 9.72;
                width: 6.66px;
                margin-left: 1px;
                background-image: url('https://cdn06.e-bebek.com/assets/toys/svg/play-video.svg');
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                display: block;
            }

            .carousel-section .ar-icon {
                aspect-ratio: 8.81 / 9.79;
                width: 11px;
                background-image: url('https://cdn06.e-bebek.com/assets/toys/svg/cube-ar.svg');
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                display: block;
            }

            .carousel-section .line-badge {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 26px;
                text-align: center;
                z-index: 3;
            }

            .carousel-section .free-shipment-bagde {
                height: 100%;
                width: 100%;
                background-color: var(--Primary-200);
                color: var(--Primary-400);
                font-size: 10px;
                font-family: Quicksand-SemiBold;
                display: flex;
                align-items: center;
                justify-content: center;
                grid-gap: 5px;
                gap: 5px;
                text-align: center;
            }

            .carousel-section .truck-icon {
                height: auto;
                width: 15px;
                aspect-ratio: 15/10;
                display: inline-block;
                background-position: 50%;
                background-repeat: no-repeat;
                background-size: contain;
                background-image: url('https://cdn06.e-bebek.com/assets/toys/svg/truck.svg');
            }

            .carousel-section .product-image-wrapper {
                aspect-ratio: 243/203;
                width: 100%;
                height: 203px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .carousel-section .product-image {
                width: auto;
                height: 100%;
                object-fit: contain;
                -webkit-user-drag: none;
                user-select: none;
                pointer-events: none;
            }
                
            .carousel-section .product-info {
                display: block;
                padding: 0 10px;
                padding-bottom: 13px;
                font-family: Quicksand-Medium;
                font-size: 12px;
            }

            .carousel-section .product-brand b {
                font-weight: bolder;
            }

            .carousel-section .product-brand {
                font-size: 12px;
                color: var(--Primary-Black);
                text-overflow: ellipsis;
                overflow: hidden;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                display: -webkit-box;
                margin-bottom: 10px;
            }

            .carousel-section .stars-wrapper {
                display: flex;
                align-items: center !important;
            }

            .carousel-section .review-count {
                font-size: 10px;
                color: var(--Neutral-600);
                margin-bottom: 0px;
            }

            .carousel-section .promotions {
                color: var(--Secondary-400);
                font-size: 10px;
                font-family: Quicksand-SemiBold;
                display: flex;
                flex-direction: column;
                grid-gap: 12px;
                gap: 12px;
            }

            .carousel-section .promotions:has(.promotion-container) {
                margin: 12px 0;
            }

            .carousel-section .promotion-container {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                grid-gap: 5px;
                gap: 5px;
            }

            .carousel-section .star-rating {
                position: relative;
                display: inline-block;
                font-size: 10px;
                line-height: 10px;
            }

            .carousel-section .star-rating i{
                font-size: 10px;
                margin: 0 4px 0 0;
            }

            .carousel-section .stars-outer,
            .carousel-section .stars-inner {
                display: inline-flex;
            }

            .carousel-section .stars-inner {
                position: absolute;
                top: 0;
                left: 0;
                overflow: hidden;     
                white-space: nowrap;
                pointer-events: none;
            }

            .carousel-section .stars-outer i { color: #ffe8cc !important; }                  
            .carousel-section .stars-inner i { color: var(--Secondary-400, #ff8a00) !important; } 


            .carousel-section .review-count {
                margin-bottom: 0;
                margin-top: 0;
                color: var(--Neutral-600);
                font-size: 10px;
                font-style: Quicksand-Medium;
            }

            .carousel-section .promotion-text {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 26px;
                width: fit-content;
                padding: 8px 0px;
                border-radius: 16px;
                margin-bottom: 44px;
            }

            .carousel-section .promotions i{
                width: auto;
                height: 10px;
                background-position: 50%;
                background-repeat: no-repeat;
                background-size: contain;
                background-image: url('https://cdn06.e-bebek.com/assets/toys/svg/money.svg');
                aspect-ratio: 12.36 / 9.89;
            }

            .carousel-section .price-container {
                margin-top: auto;
                position: relative;
                display: flex;
                justify-content: flex-end;
                flex-direction: column;
                padding: 6px 10px 15px;
                font-family: Quicksand-SemiBold;
            }

            .carousel-section .price-group {
                display: flex;
                flex-direction: column;
                gap: 2px;
                height: 100%;
            }

            .carousel-section .price-row-top {
                display: flex;
                align-items: center;
            }

            .carousel-section .original-price {
                font-size: 12px;
                color: var(--Neutral-600);
                margin-right: 8px;
                line-height: normal;
            }

            .carousel-section .discount-badge {
                background-color: var(--Success-400);
                color: var(--Neutral-0---White);
                border-radius: 16px;
                padding: 0 4px;
                font-size: 12px;
            }

            .carousel-section .price-row-bottom {
                font-weight: 700;
                font-size: 20px;
                line-height: 20px;
                var(--Primary-Black);
                margin-right: 8px;
            }

            .carousel-section .current-price.discounted {
                color: var(--Success-400);
            }

            .carousel-section .price-decimal {
                font-size: 14px;
            }

            .carousel-section .favorite-btn {
                top: 0;
                right: 0;
                position: absolute;
                cursor: pointer;
                border-radius: 100%;
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 3;
            }

            .carousel-section .favorite-icon-wrapper {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                background-color: var(--Neutral-0---White);
                border: 1.4px solid var(--Neutral-0---White);
                border-radius: 100%;
                position: relative;
            }

            .carousel-section .favorite-icon {
                position: absolute; /* Position both icons absolutely */
                top: 50%;
                left: 50%;
                height: 15px;
                width: 15px;
                transform: translate(-50%, -50%); /* Center them perfectly */
                background-repeat: no-repeat;
                background-size: contain;
                background-position: 50%;
                aspect-ratio: 1;
            }

            .carousel-section .favorite-icon-outline {
                background-image: url(https://cdn06.e-bebek.com/assets/toys/svg/heart-outline.svg);
                opacity: 1;
                z-index: 10;
            }

            .carousel-section .favorite-icon-orange-outline {
                background-image: url(https://cdn06.e-bebek.com/assets/toys/svg/heart-orange-outline.svg);
                opacity: 0;
                z-index: 11;
            }

            .carousel-section .favorite-btn:hover .favorite-icon-outline {
                opacity: 0;
            }

            .carousel-section .favorite-btn:hover .favorite-icon-orange-outline {
                opacity: 1;
            }

            .carousel-section .favorite-btn.active .favorite-icon-outline {
                opacity: 0;
            }

            .carousel-section .favorite-btn.active .favorite-icon-orange-outline {
                opacity: 1;
            }

            .carousel-section .add-to-cart-wrapper {
                position: absolute;
                bottom: 4px;
                right: 4px;
            }

            .carousel-section .add-to-cart {
                border-radius: 100%;
                overflow: hidden;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 48px;
                height: 48px;
                font-size: 11px;
                font-family: Quicksand-SemiBold;
                color: #fff;
                text-decoration: none;
                transition: none;
                text-align: center;
                vertical-align: middle;
                border: 1px solid #0000;
                background: transparent;
                outline: none;
                z-index: 3;
            }

            .carousel-section .add-to-cart:not(:disabled) {
                cursor: pointer;
            }

            .carousel-section .add-to-cart-container {
                width: 40px;
                height: 40px;
                background-color: #ffffff;
                color: var(--Primary-400---Primary);
                border: none;
                outline: none;
                border-radius: 100%;
                overflow: hidden;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 6px 2px 0 #b0b0b003, 0 2px 9px 0 #b0b0b014, 0 2px 4px 0 #b0b0b024, 0 0 1px 0 #b0b0b03d, 0 0 1px 0 #b0b0b047;
            }

            .carousel-section .add-to-cart i {
                height: auto;
                width: 14px;
                display: inline-block;
                background-size: contain;
                background-repeat: no-repeat;
                background-position: 50%;
                aspect-ratio: 1;
            }

            .carousel-section .add-to-cart .add-to-cart-icon-blue {
                background-image: url('https://cdn06.e-bebek.com/assets/toys/svg/plus-blue.svg');
                display: block;
            }

            .carousel-section .add-to-cart .add-to-cart-icon-white {
                background-image: url('https://cdn06.e-bebek.com/assets/toys/svg/plus-white.svg');
                display: none;
            }

            .carousel-section .add-to-cart:hover .add-to-cart-container{
                background-color: var(--Primary-400---Primary);
            }

            .carousel-section .add-to-cart:hover .add-to-cart-icon-blue {
                display: none;
            }

            .carousel-section .add-to-cart:hover .add-to-cart-icon-white {
                display: block;
            }

            @media (max-width: 1479px) {
                .carousel-section .carousel-track .product-card {
                    flex-basis: calc(25% - 12px) !important;
                    width: calc(25% - 12px) !important;
                    min-width: calc(25% - 12px) !important;
                    max-width: calc(25% - 12px) !important;
                }

                .carousel-section .carousel-container {
                    max-width: 1180px !important;
                }
            }

            @media (max-width: 1279px) {
                .carousel-section .carousel-track .product-card {
                    flex-basis: calc(33.333% - 11px) !important;
                    width: calc(33.333% - 11px) !important;
                    aspect-ratio: 298/383;
                    min-width: calc(33.333% - 11px) !important;
                    max-width: calc(33.333% - 11px) !important;
                }

                .carousel-section .carousel-container {
                    max-width: 960px !important;
                }

                .carousel-section .carousel-container-wrapper {
                    max-width: 960px !important;
                }

                .carousel-section .product-image-container {
                    aspect-ratio: 298/203;
                }

                .carousel-section .product-image-wrapper {
                    aspect-ratio: 298/203; 
                }
            }

            @media (max-width: 991px) {
                .carousel-section .carousel-track .product-card {
                    flex-basis: calc(50% - 8px) !important;
                    width: calc(50% - 8px) !important;
                    aspect-ratio: 337/385;
                    min-width: calc(50% - 8px) !important;
                    max-width: calc(50% - 8px) !important;
                }

                .carousel-section .carousel-container {
                    max-width: 720px !important;
                }

                .carousel-section .carousel-container-wrapper {
                    max-width: 720px !important;
                }

                .carousel-section .product-image-container {
                    aspect-ratio: 337/203;
                }

                .carousel-section .product-image-wrapper {
                    aspect-ratio: 339/203; 
                }
            }

            @media (max-width: 767px) {
                .carousel-section .carousel-track .product-card {
                    flex-basis: calc(50% - 8px) !important;
                    width: calc(50% - 8px) !important;
                    aspect-ratio: 247/385;
                    min-width: calc(50% - 8px) !important;
                    max-width: calc(50% - 8px) !important;
                }

                .carousel-section .carousel-container {
                    max-width: 540px !important;
                }

                .carousel-section .carousel-container-wrapper {
                    max-width: 540px !important;
                }

                .carousel-section .product-image-container {
                    aspect-ratio: 247/203;
                }

                .carousel-section .product-image-wrapper {
                    aspect-ratio: 247/203; 
                }
            }

            @media (max-width: 575px) {
                .carousel-section .carousel-nav {
                    display: none !important;
                }

                .carousel-section .carousel-container {
                    max-width: 100vw !important;
                }

                .carousel-section .carousel-container-wrapper {
                    max-width: 100vw !important;
                }
            }

            @media (max-width: 480px) {
                .carousel-section .carousel-nav {
                    display: none !important;
                }

                .carousel-section .carousel-container {
                    max-width: 100vw !important;
                }

                .carousel-section .carousel-container-wrapper {
                    max-width: 100vw !important;
                }

                .carousel-section .product-image-container {
                    height: 150px;
                    aspect-ratio: 214/150;
                }

                .carousel-section .product-image-wrapper {
                    height: 150px;
                    aspect-ratio: 214/150; 
                }
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
        }).format(price);
    };

    const splitPrice = (price) => {
        const formattedPrice = formatPrice(price);
        const match = formattedPrice.match(/(\d+(?:\.\d{3})*),(\d+)/);

        return match ? [match[1], match[2]] : [price.toString(), "00"];
    };

    // Create product card HTMLs with all details the that are fetched from API
    // Show discount badge if there is a discount
    // Highlight favorite button if product is in favorites list
    // Randomly show badges, review counts and ratings for demo purposes
    // Special case for item ID = "8" where its original and discounted prices are swapped is also handled
    const createProductCard = (product) => {

        const rating = (Math.random() * 4 + 1).toFixed(1); // Random rating between 1 and 5
        const ratingPercent = (rating / 5) * 100;
        const reviewCount = getRandomInt(1, 999);       // Random review count between 1 and 999
        const isFavorite = favorites.includes(product.id);
        
        let displayPrice = Math.min(product.price, product.original_price);
        let displayOriginalPrice = Math.max(product.price, product.original_price);

        const discountPercent = calculateDiscount(displayPrice, displayOriginalPrice);
        const hasDiscount = discountPercent > 0;

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-card-wrapper">
                    <div class="product-item-info-group">
                        <div class="product-image-container">
                            <div class="badge-container">
                                ${(getRandomInt(0, 1) === 1) ? '<i class="badge-icon top-seller"></i>' : ''}
                                ${(getRandomInt(0, 1) === 1) ? '<i class="badge-icon star-product"></i>' : ''}
                            </div>
                            <div class="video-ar-container">
                                ${(getRandomInt(0, 1) === 1) ? '<div class="video-icon-container"><i class="video-icon"></i></div>' : ''}
                                ${(getRandomInt(0, 1) === 1) ? '<div class="ar-icon-container"><i class="ar-icon"></i></div>' : ''}
                            </div>
                            ${(getRandomInt(0, 4) === 0) ? 
                            `<div class="line-badge">
                                    <div class="free-shipment-bagde">
                                        <i class="truck-icon"></i>
                                        <span>Ücretsiz Kargo</span>
                                    </div>
                            </div>`
                            : ''}
                            <div class="product-image-wrapper">
                                <img class="product-image" src="${product.img}" alt="${product.name}" loading="lazy">
                            </div>    
                        </div>

                        <div class="product-info">
                            <h2 class="product-brand">
                                <b>${product.brand} - </b>
                                <span class="product-name">${product.name}</span>
                            </h2>

                            <div class="product-rating">
                                <div class="stars-wrapper">
                                    <div class="star-rating">
                                        <span class="stars-outer" aria-hidden="true">
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                        </span>
                                        <span class="stars-inner" aria-hidden="true" style="width: ${ratingPercent}%;">
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                        </span>
                                    </div>
                                    <p class="review-count">(${reviewCount})</p>
                                </div>
                            </div>

                            <div class="promotions">
                                ${(getRandomInt(0, 4) === 0) ? 
                                `<div class="promotion-container">
                                        <i class="money-icon"></i>
                                        <span>Örnek promosyon</span>
                                </div>`
                                : ''}
                            </div>
                        </div>
                    </div>
                                    
                    <div class="price-container">
                        <div class="price-group">
                            ${hasDiscount ? `
                            <div class="price-row-top">
                                <span class="original-price">
                                    ${splitPrice(displayOriginalPrice)[0]}<span class="original-price-decimal">,${splitPrice(displayOriginalPrice)[1]} TL</span>
                                </span>
                                <span class="discount-badge">${discountPercent}%</span>
                            </div>
                            ` : ''}
                            <div class="price-row-bottom">
                                <strong class="current-price ${hasDiscount ? 'discounted' : 'regular'}">
                                    ${splitPrice(displayPrice)[0]}<span class="price-decimal">,${splitPrice(displayPrice)[1]} TL</span>
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="favorite-btn ${isFavorite ? 'active' : ''}" data-product-id="${product.id}">
                    <div class="favorite-icon-wrapper">
                        <i class="favorite-icon favorite-icon-outline"></i>
                        <i class="favorite-icon favorite-icon-orange-outline hovered"></i>
                    </div>
                </div>


                <div class="add-to-cart-wrapper">
                    <button class="add-to-cart" data-product-id="${product.id}" type="submit">
                        <div class="add-to-cart-container">
                            <i class="add-to-cart-icon-blue"></i>
                            <i class="add-to-cart-icon-white"></i>
                        </div>
                    </button>
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
        
        const firstCard = document.querySelector('.carousel-section .product-card');
        const track = document.querySelector('.carousel-section .carousel-track');
        
        if (firstCard && track) {
            const cardWidth = firstCard.offsetWidth; 
            const trackStyle = window.getComputedStyle(track);
            const gap = parseFloat(trackStyle.gap) || 16;
            
            itemWidth = cardWidth + gap;
            

        } else {
            itemWidth = (containerWidth + 16) / visibleItems;
        }
    };


    // Update carousel position based on currentTranslate value
    // currentTranslate value is calculated in slideNext and slidePrev functions
    // Disable buttons when at the start or end of the carousel
    const updateCarouselPosition = () => {
        const track = document.getElementById('carouselTrack');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (!track) return;
        
        // Apply the transform
        track.style.transform = `translateX(${currentTranslate}px)`;
        
        // Update button states
        if (prevBtn) prevBtn.disabled = (currentTranslate >= 0);
        if (nextBtn) {
            const maxTranslate = -itemWidth * (products.length - visibleItems);
            nextBtn.disabled = (currentTranslate <= maxTranslate);
        }
    };

    // Slide to next or previous item and update currentTranslate value accordingly
    const slideNext = () => {
        const totalItems = products.length;
        if (totalItems <= visibleItems) return;
        
        const maxTranslate = -itemWidth * (totalItems - visibleItems);
        currentTranslate = Math.max(currentTranslate - itemWidth, maxTranslate);
        
        updateCarouselPosition();
    };

    const slidePrev = () => {
        currentTranslate = Math.min(currentTranslate + itemWidth, 0);
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
    const fetchProducts = async () => {
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
        }
    };

    function handleAddToCartClick(e) {
        const addToCartBtn = e.target.closest('.add-to-cart');
        if (!addToCartBtn) return;
        
        const container = addToCartBtn.querySelector('.add-to-cart-container');
        const iconBlue = addToCartBtn.querySelector('.add-to-cart-icon-blue');
        const iconWhite = addToCartBtn.querySelector('.add-to-cart-icon-white');
        
        // Change to green background and white icon
        container.style.backgroundColor = '#00a365';
        if (iconBlue) iconBlue.style.display = 'none';
        if (iconWhite) iconWhite.style.display = 'block';
        
        // After 500ms, return to default style
        setTimeout(() => {
            container.style.backgroundColor = '';  // Remove inline style
            if (iconBlue) iconBlue.style.display = '';   // Remove inline style
            if (iconWhite) iconWhite.style.display = '';  // Remove inline style
        }, 500);
    }

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

            if (e.target.closest('.add-to-cart')) {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCartClick(e);
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
        });

        // Recalculate dimensions and update carousel position on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {

                calculateDimensions();

                currentTranslate = 0;
                
                updateCarouselPosition();
            }, 200);
        });

        // Touch events for swipe functionality
        let startX = 0;
        let isDragging = false;
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
            
            const threshold = itemWidth * 0.4;
            
            if (Math.abs(diffX) > threshold) {
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