import { SHOP_THE_LOOK_DATA, JOURNAL_STORIES } from '../data/collections';
import { PRODUCTS_DATA, Product } from '../data/products';
import { renderProductCard } from '../components/ProductCard';
import { store } from '../data/mockState';

export function renderHomePage(): string {
  // Filter products by selected mood if active
  const moodFilteredProducts =
    store.activeMood === 'ALL'
      ? PRODUCTS_DATA
      : PRODUCTS_DATA.filter((p) => p.mood === store.activeMood);

  // Day vs Night products
  const isNight = store.dayNightTime >= 19;
  const timeFilteredProducts = PRODUCTS_DATA.filter((p) => (isNight ? p.isNight : p.isDay));

  return `
    <!-- 01. Brand Reveal Intro Loader -->
    <div class="brand-reveal-overlay" id="brand-loader">
      <div class="brand-reveal-logo">THE ATELIER</div>
      <div class="brand-reveal-sub">EST. 2026 — HAUTE COUTURE</div>
    </div>

    <!-- 02. Hero Section ("THE NEW ERA") -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-grid">
          <div>
            <span class="hero-tag"><i class="fa-solid fa-sparkles"></i> NEW SEASON 2026</span>
            <h1 class="hero-title font-serif">THE NEW ERA</h1>
            <p class="hero-desc">
              Unveiling a sanctuary of fluid drapery, immaculate tailoring, and haute couture elegance designed for the modern woman.
            </p>
            <div class="flex gap-md" style="flex-wrap: wrap;">
              <button class="btn btn-primary" data-route="shop">SHOP COLLECTION</button>
              <button class="btn btn-secondary" id="hero-explore-looks-btn">EXPLORE EDITORIAL LOOKS</button>
            </div>
          </div>

          <div class="hero-image-wrapper">
            <img src="/images/hero_model.png" alt="THE ATELIER Model" id="hero-parallax-img" />
            <div class="hero-badge-overlay">
              <div class="hero-badge-number">01 / 08</div>
              <div class="hero-badge-text">SPRING / SUMMER EDIT</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 03. The Atelier Index (Magazine Contents Showcase) -->
    <section class="atelier-index-section">
      <div class="container">
        <div class="index-grid">
          <div>
            <div class="subtitle" style="margin-bottom: 12px;">EDITORIAL DIRECTORY</div>
            <h2 class="heading-1 font-serif" style="margin-bottom: var(--space-xl);">THE ATELIER INDEX</h2>

            <div class="index-list">
              <div class="index-item" data-preview="0">
                <div class="flex items-center">
                  <span class="index-num">01</span>
                  <span class="index-name">NEW ERA SILHOUETTES</span>
                </div>
                <i class="fa-solid fa-arrow-right-long index-arrow"></i>
              </div>
              <div class="index-item" data-preview="1">
                <div class="flex items-center">
                  <span class="index-num">02</span>
                  <span class="index-name">THE LOOKS ARCHIVE</span>
                </div>
                <i class="fa-solid fa-arrow-right-long index-arrow"></i>
              </div>
              <div class="index-item" data-preview="2">
                <div class="flex items-center">
                  <span class="index-num">03</span>
                  <span class="index-name">LEATHER & ACCESSORIES</span>
                </div>
                <i class="fa-solid fa-arrow-right-long index-arrow"></i>
              </div>
              <div class="index-item" data-preview="3">
                <div class="flex items-center">
                  <span class="index-num">04</span>
                  <span class="index-name">CREATE YOUR OUTFIT</span>
                </div>
                <i class="fa-solid fa-arrow-right-long index-arrow"></i>
              </div>
              <div class="index-item" data-preview="4">
                <div class="flex items-center">
                  <span class="index-num">05</span>
                  <span class="index-name">JOURNAL & CRAFT</span>
                </div>
                <i class="fa-solid fa-arrow-right-long index-arrow"></i>
              </div>
            </div>
          </div>

          <!-- Dynamic Hover Image Preview Container -->
          <div class="index-preview-container">
            <img src="/images/hero_model.png" class="index-preview-img active" id="idx-img-0" />
            <img src="/images/shop_look_model.png" class="index-preview-img" id="idx-img-1" />
            <img src="/images/designer_bag.png" class="index-preview-img" id="idx-img-2" />
            <img src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80" class="index-preview-img" id="idx-img-3" />
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80" class="index-preview-img" id="idx-img-4" />
          </div>
        </div>
      </div>
    </section>

    <!-- 04 & 05. Shop The Look (Hotspots Section) -->
    <section class="shop-look-section">
      <div class="container">
        <div class="text-center" style="margin-bottom: var(--space-2xl); text-align: center;">
          <div class="subtitle">${SHOP_THE_LOOK_DATA.subtitle}</div>
          <h2 class="heading-display font-serif">${SHOP_THE_LOOK_DATA.title}</h2>
        </div>

        <div class="shop-look-grid">
          <!-- Model Image with Hotspots -->
          <div class="hotspots-image-card">
            <img src="${SHOP_THE_LOOK_DATA.image}" alt="Shop the look" style="width: 100%; height: 600px; object-fit: cover;" />
            
            ${SHOP_THE_LOOK_DATA.hotspots
              .map(
                (hs) => `
              <div class="hotspot-pin" style="top: ${hs.topPercent}%; left: ${hs.leftPercent}%;" data-product-id="${hs.productId}">
                <div class="hotspot-card-popover">
                  <strong>${hs.name}</strong><br>
                  <span style="color: var(--color-gold-bright);">Rs. ${hs.price.toLocaleString()}</span>
                </div>
              </div>
            `
              )
              .join('')}
          </div>

          <!-- Bundle Summary Panel -->
          <div class="look-bundle-card">
            <div class="subtitle" style="margin-bottom: 8px;">CURATED OUTFIT BUNDLE</div>
            <h3 class="heading-2 font-serif" style="margin-bottom: 20px;">COMPLETE NOIR EDIT</h3>
            
            ${SHOP_THE_LOOK_DATA.hotspots
              .map(
                (hs) => `
              <div class="bundle-item-row">
                <div>
                  <div style="font-family: var(--font-serif); font-size: 1.1rem; font-weight: 500;">${hs.name}</div>
                  <div style="font-size: 0.75rem; color: var(--color-muted);">Signature Atelier Piece</div>
                </div>
                <div style="font-weight: 600;">Rs. ${hs.price.toLocaleString()}</div>
              </div>
            `
              )
              .join('')}

            <div class="bundle-total-row">
              <span>Complete Bundle Total</span>
              <span class="text-gold">Rs. 18,699</span>
            </div>

            <button class="btn btn-primary btn-full" id="add-complete-look-btn" style="margin-top: 24px;">
              <i class="fa-solid fa-bag-shopping"></i> ADD COMPLETE LOOK TO BAG
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 06. Mood -> Look Section ("HOW DO YOU WANT TO FEEL?") -->
    <section class="mood-section">
      <div class="container">
        <div class="subtitle">MOOD-BASED SHOPPING</div>
        <h2 class="heading-display font-serif" style="margin-top: 8px;">HOW DO YOU WANT TO FEEL?</h2>
        
        <div class="mood-selector-wrap">
          <button class="mood-btn ${store.activeMood === 'ALL' ? 'active' : ''}" data-mood="ALL">ALL MOODS</button>
          <button class="mood-btn ${store.activeMood === 'CONFIDENT' ? 'active' : ''}" data-mood="CONFIDENT">CONFIDENT</button>
          <button class="mood-btn ${store.activeMood === 'ROMANTIC' ? 'active' : ''}" data-mood="ROMANTIC">ROMANTIC</button>
          <button class="mood-btn ${store.activeMood === 'MINIMAL' ? 'active' : ''}" data-mood="MINIMAL">MINIMAL</button>
          <button class="mood-btn ${store.activeMood === 'BOLD' ? 'active' : ''}" data-mood="BOLD">BOLD</button>
        </div>

        <div class="products-grid">
          ${moodFilteredProducts.slice(0, 4).map(renderProductCard).join('')}
        </div>
      </div>
    </section>

    <!-- 07. Create Your Look (Interactive Look Builder) -->
    <section class="look-builder-section">
      <div class="container">
        <div style="margin-bottom: var(--space-2xl); text-align: center;">
          <div class="subtitle">INTERACTIVE OUTFIT STUDIO</div>
          <h2 class="heading-1 font-serif">CREATE YOUR ATELIER LOOK</h2>
        </div>

        <div class="builder-layout">
          <!-- Step 1: Select Category -->
          <div>
            <div class="form-label" style="margin-bottom: 12px;">1. CHOOSE CATEGORY</div>
            <div class="builder-categories">
              <button class="builder-cat-btn active" data-builder-cat="Clothing">DRESS / TOP</button>
              <button class="builder-cat-btn" data-builder-cat="Bags">HANDBAG</button>
              <button class="builder-cat-btn" data-builder-cat="Footwear">SHOES</button>
              <button class="builder-cat-btn" data-builder-cat="Accessories">JEWELRY</button>
            </div>
          </div>

          <!-- Step 2: Choose Product -->
          <div>
            <div class="form-label">2. SELECT PIECE</div>
            <div class="builder-items-grid" id="builder-items-container">
              ${PRODUCTS_DATA.map(
                (p) => `
                <div class="builder-item-card" data-builder-product-id="${p.id}">
                  <img src="${p.primaryImage}" alt="${p.name}" />
                  <div class="builder-item-info">
                    <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
                    <div class="text-gold">Rs. ${p.price.toLocaleString()}</div>
                  </div>
                </div>
              `
              ).join('')}
            </div>
          </div>

          <!-- Step 3: Summary Panel -->
          <div class="builder-summary-panel">
            <div class="subtitle" style="margin-bottom: 8px;">YOUR STYLED OUTFIT</div>
            <h4 class="font-serif heading-3" style="margin-bottom: 16px;">ATELIER SELECTION</h4>
            
            <div id="builder-selected-list" style="margin-bottom: 20px; font-size: 0.85rem;">
              <div style="padding: 8px 0; border-bottom: 1px solid var(--color-border-light);">
                <strong>Dress:</strong> Noir Evening Gown (Rs. 7,999)
              </div>
              <div style="padding: 8px 0; border-bottom: 1px solid var(--color-border-light);">
                <strong>Bag:</strong> Aura Leather Tote (Rs. 4,500)
              </div>
            </div>

            <div style="font-size: 1.2rem; font-weight: 700; font-family: var(--font-serif); margin-bottom: 16px;">
              Total: <span class="text-gold" id="builder-total-price">Rs. 12,499</span>
            </div>

            <button class="btn btn-primary btn-full" id="builder-add-bundle-btn">
              ADD STYLED LOOK TO BAG
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 08. Day / Night Mode Time Slider -->
    <section class="day-night-section ${isNight ? 'theme-night' : ''}">
      <div class="container">
        <div class="text-center" style="text-align: center;">
          <div class="subtitle">ATMOSPHERIC AMBIANCE</div>
          <h2 class="heading-1 font-serif">DAY TO NIGHT TRANSITION</h2>
          
          <div class="time-slider-wrap">
            <div class="time-slider-labels">
              <span><i class="fa-solid fa-sun text-gold"></i> 10:00 AM (DAY CASUAL)</span>
              <span>10:00 PM (NIGHT GLAM) <i class="fa-solid fa-moon text-gold"></i></span>
            </div>
            <input type="range" min="10" max="22" value="${store.dayNightTime}" class="time-range-input" id="day-night-slider" />
          </div>
        </div>

        <div class="products-grid" style="margin-top: var(--space-xl);">
          ${timeFilteredProducts.slice(0, 4).map(renderProductCard).join('')}
        </div>
      </div>
    </section>

    <!-- 09. Editorial Product Wall -->
    <section style="padding: var(--space-3xl) 0; background-color: var(--color-ivory-warm);">
      <div class="container">
        <div class="flex justify-between items-center" style="margin-bottom: var(--space-2xl);">
          <div>
            <div class="subtitle">CURATED SELECTION</div>
            <h2 class="heading-1 font-serif">NEW ARRIVALS 2026</h2>
          </div>
          <button class="btn btn-secondary" data-route="shop">VIEW ALL 124 PRODUCTS →</button>
        </div>

        <div class="products-grid">
          ${PRODUCTS_DATA.map(renderProductCard).join('')}
        </div>
      </div>
    </section>

    <!-- 10. Style DNA Quiz Banner -->
    <section style="padding: var(--space-3xl) 0; background-color: var(--color-black); color: var(--color-ivory); text-align: center;">
      <div class="container-narrow">
        <i class="fa-solid fa-wand-magic-sparkles text-gold" style="font-size: 3rem; margin-bottom: 16px;"></i>
        <div class="subtitle">AI STYLE RECOMMENDATION ENGINE</div>
        <h2 class="heading-display font-serif" style="color: var(--color-ivory); margin: 12px 0 20px;">DISCOVER YOUR STYLE DNA</h2>
        <p style="font-size: 1rem; color: #B0B0B0; max-width: 540px; margin: 0 auto 30px;">
          Take our interactive 30-second luxury quiz to receive a customized personal edit matching your exact taste, fit, and color palette.
        </p>
        <button class="btn btn-gold" id="start-dna-quiz-cta">START 30-SEC STYLE QUIZ</button>
      </div>
    </section>

    <!-- 11. Atelier Journal -->
    <section style="padding: var(--space-3xl) 0; background-color: var(--color-bg-pure);">
      <div class="container">
        <div style="margin-bottom: var(--space-2xl); text-align: center;">
          <div class="subtitle">EDITORIAL MAGAZINE</div>
          <h2 class="heading-1 font-serif">THE ATELIER JOURNAL</h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-xl);">
          ${JOURNAL_STORIES.map(
            (story) => `
            <div style="border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow: hidden; background-color: #FFFFFF;">
              <img src="${story.image}" alt="${story.title}" style="width: 100%; height: 260px; object-fit: cover;" />
              <div style="padding: 24px;">
                <div class="subtitle" style="font-size: 0.7rem;">${story.date} | BY ${story.author}</div>
                <h3 class="font-serif heading-3" style="margin: 8px 0;">${story.title}</h3>
                <p style="font-size: 0.85rem; color: var(--color-muted); margin-bottom: 16px;">${story.summary}</p>
                <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.75rem;">READ STORY →</button>
              </div>
            </div>
          `
          ).join('')}
        </div>
      </div>
    </section>
  `;
}
