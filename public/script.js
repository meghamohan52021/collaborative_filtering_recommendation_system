const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";
const API_KEY = "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"; 

let allProducts = [];
let recommendedProducts = [];
let lastSearchedCategory = null; // To track the last searched category

// Load product data from products.json
fetch('/data/products.json')
    .then(response => response.json())
    .then(data => {
        allProducts = data;
        displayProducts(allProducts);
    })
    .catch(error => console.error("Error loading products:", error));

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

// Handle Search Functionality
document.getElementById('search-button').addEventListener('click', () => {
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();

    const searchResults = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
    );

    // Update category for recommendations
    lastSearchedCategory = searchResults.length > 0 ? searchResults[0].category : null;

    // Display search results
    displayProducts(searchResults);

    // Sync the search input with the chatbox
    syncWithChatbox(searchTerm);

    // Update recommendations
    updateRecommendations();
});

// Sync search input with the chatbox
function syncWithChatbox(message) {
    addMessage(`You searched for "${message}"`, true); // User message
    addMessage(
        "I see that's what you are looking for, feel free to ask me for queries regarding ratings, price, or whatever else is there.",
        false
    ); // Bot response
}

// Update Recommended Items
function updateRecommendations() {
    recommendedProducts = lastSearchedCategory
        ? allProducts.filter(product => product.category === lastSearchedCategory)
        : [];

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

// Chatbox Dynamic Responses
document.getElementById('chatbox-send').addEventListener('click', async () => {
    const userMessage = document.getElementById('chatbox-input').value.trim();

    if (!userMessage) return;

    // Add the user's message to the chatbox
    addMessage(userMessage, true);

    // Clear the input field
    document.getElementById('chatbox-input').value = '';

    // Generate a response using Hugging Face
    const botResponse = await generateBotResponse(userMessage);

    // Add the bot's response to the chatbox
    addMessage(botResponse, false);
});

// Add message to the chatbox
function addMessage(content, isUser = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message bot-message';
    messageDiv.textContent = content;
    document.getElementById('chatbox-messages').appendChild(messageDiv);

    // Auto-scroll to the bottom
    const chatboxMessages = document.getElementById('chatbox-messages');
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
}

// Generate Bot Response with Retry
async function generateBotResponse(message) {
    const MAX_RETRIES = 5; // Maximum retries
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            const response = await fetch(HUGGING_FACE_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: message, 
                }),
            });

            const data = await response.json();

            // Log the full API response for debugging
            console.log("Hugging Face API Full Response:", data);

            if (response.ok) {
                if (data.generated_text) {
                    return data.generated_text;
                } else {
                    console.error("No 'generated_text' in API response:", data);
                    return "I couldn't understand your query. Could you please rephrase?";
                }
            } else if (response.status === 503 && data.error && data.error.includes('currently loading')) {
                const waitTime = data.estimated_time || 5; // Default wait time is 5 seconds
                console.log(`Model loading, retrying in ${waitTime} seconds...`);
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                retries++;
            } else {
                console.error("Error from Hugging Face API:", response.status, response.statusText);
                return `Sorry, the server responded with an error: ${response.status}.`;
            }
        } catch (error) {
            console.error("Error generating bot response:", error);
            return "Sorry, I couldn't process your request. Try again later.";
        }
    }

    return "Sorry, the model is taking too long to load. Please try again later.";
}


// Home Button Functionality
document.getElementById('home-link').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent page refresh
    document.getElementById('search-input').value = ''; // Clear the search input
    displayProducts(allProducts); // Show all products

    // Only reset recommendations if lastSearchedCategory is null
    if (lastSearchedCategory) {
        updateRecommendations();
    } else {
        recommendedProducts = [];
        displayRecommendedProducts();
    }
});
