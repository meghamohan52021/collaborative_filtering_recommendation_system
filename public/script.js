let allProducts = [];
let recommendedProducts = [];
let lastSearchedCategory = null;  // Track the last searched category

// Load product data from products.json
fetch('/data/products.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load products.json');
        }
        return response.json();
    })
    .then(data => {
        allProducts = data;
        displayProducts(allProducts);
    })
    .catch(error => {
        console.error('Error loading products:', error);
        document.getElementById('product-container').innerHTML = '<p>Error loading products. Please try again later.</p>';
    });

// Display all products
function displayProducts(products) {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price}</div>
        `;
        productContainer.appendChild(productCard);
    });
}

// Search functionality
document.getElementById('search-button').addEventListener('click', () => {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const searchResults = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );

    // If a result is found, set the category for recommendations
    if (searchResults.length > 0) {
        lastSearchedCategory = searchResults[0].category;
    } else {
        lastSearchedCategory = null; // No results, so clear category
    }

    // Update recommendations based on the search term
    updateRecommendations();
    displayProducts(searchResults);
});

// Update recommended items based on the last searched category
function updateRecommendations() {
    if (!lastSearchedCategory) {
        recommendedProducts = [];
    } else {
        recommendedProducts = allProducts.filter(product => 
            product.category === lastSearchedCategory
        );
    }
    displayRecommendedProducts();
}

// Display recommended products
function displayRecommendedProducts() {
    const recommendedContainer = document.getElementById('recommended-container');
    const recommendedSectionTitle = document.getElementById('recommended-section-title');
    
    if (recommendedProducts.length > 0) {
        recommendedSectionTitle.style.display = 'block';
        recommendedContainer.innerHTML = '';

        recommendedProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price}</div>
            `;
            recommendedContainer.appendChild(productCard);
        });
    } else {
        recommendedSectionTitle.style.display = 'none';
    }
}

// Home button functionality
document.getElementById('home-link').addEventListener('click', (event) => {
    event.preventDefault();  // Prevent page refresh
    document.getElementById('search-input').value = '';  // Clear the search input
    displayProducts(allProducts);  // Show all products
    
    // Only reset recommendations if lastSearchedCategory is null
    if (lastSearchedCategory) {
        updateRecommendations();
    } else {
        recommendedProducts = [];
        displayRecommendedProducts();
    }
});

