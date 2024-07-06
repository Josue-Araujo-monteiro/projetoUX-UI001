// Elementos DOM
const productMenu = document.getElementById('product-menu');
const addProductForm = document.getElementById('add-product-form-modal');
const cartIcon = document.getElementById('cart-icon');
const cartBadge = document.getElementById('cart-badge');
const cartModal = document.getElementById('cart-modal');
const closeCartModalBtn = document.getElementById('close-cart-modal');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const paymentMethod = document.getElementById('payment-method');
const cashPayment = document.getElementById('cash-payment');
const cashAmount = document.getElementById('cash-amount');
const changeAmount = document.getElementById('change');
const processPaymentBtn = document.getElementById('process-payment');

// Elementos DOM adicionais
const addProductModal = document.getElementById('add-product-modal');
const openAddProductModalBtn = document.getElementById('open-add-product-modal');
const closeAddProductModalBtn = document.getElementById('close-add-product-modal');
const modalProductName = document.getElementById('modal-product-name');
const modalProductPrice = document.getElementById('modal-product-price');
const modalProductCategory = document.getElementById('modal-product-category');

// Novos elementos DOM
const mainMenu = document.getElementById('main-menu');
const notificationArea = document.getElementById('notification-area');

// Estado da aplicação
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Funções auxiliares
const saveToLocalStorage = () => {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('cart', JSON.stringify(cart));
};

const updateCartBadge = () => {
    cartBadge.textContent = cart.reduce((total, item) => total + item.quantity, 0);
};

const updateCartTotal = () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
};

// Função para mostrar notificações em popup
const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notificationArea.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notificationArea.removeChild(notification);
        }, 500);
    }, 3000);
};

// Renderização de Produtos
const renderProducts = () => {
    productMenu.innerHTML = '';
    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <h3>${product.name}</h3>
            <p>R$ ${product.price.toFixed(2)}</p>
            <p>Categoria: ${product.category}</p>
            <button onclick="addToCart(${index})">Adicionar ao Carrinho</button>
            <button onclick="editProduct(${index})">Editar</button>
            <button onclick="deleteProduct(${index})">Excluir</button>
        `;
        productMenu.appendChild(productCard);
    });
};

// Renderização do Carrinho
const renderCart = () => {
    cartItems.innerHTML = '';
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <span>${item.name} (R$ ${item.price.toFixed(2)}) x ${item.quantity}</span>
            <button onclick="removeFromCart(${index})">Remover</button>
        `;
        cartItems.appendChild(cartItem);
    });
    updateCartTotal();
};

// Funções de manipulação do carrinho e produtos
function addToCart(index) {
    const product = products[index];
    const existingItem = cart.find(item => item.name === product.name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveToLocalStorage();
    updateCartBadge();
    showNotification(`${product.name} adicionado ao carrinho`, 'success');
}

function removeFromCart(index) {
    const item = cart[index];
    cart.splice(index, 1);
    saveToLocalStorage();
    updateCartBadge();
    renderCart();
    showNotification(`${item.name} removido do carrinho`, 'info');
}

function editProduct(index) {
    const product = products[index];
    modalProductName.value = product.name;
    modalProductPrice.value = product.price;
    modalProductCategory.value = product.category;
    openAddProductModal();

    // Substituir o evento de submit existente
    addProductForm.onsubmit = (e) => {
        e.preventDefault();
        products[index] = {
            name: modalProductName.value,
            price: parseFloat(modalProductPrice.value),
            category: modalProductCategory.value
        };
        saveToLocalStorage();
        renderProducts();
        closeAddProductModal();
        showNotification(`${product.name} atualizado com sucesso`, 'success');
    };
}

function deleteProduct(index) {
    const product = products[index];
    if (confirm(`Tem certeza que deseja excluir ${product.name}?`)) {
        products.splice(index, 1);
        saveToLocalStorage();
        renderProducts();
        showNotification(`${product.name} excluído com sucesso`, 'warning');
    }
}

// Funções para abrir e fechar o modal de adicionar produto
const openAddProductModal = () => {
    addProductModal.style.display = 'flex';
};

const closeAddProductModal = () => {
    addProductModal.style.display = 'none';
    addProductForm.reset();
    // Resetar o evento de submit para adicionar novo produto
    addProductForm.onsubmit = handleAddProduct;
};

// Manipulador de evento para adicionar novo produto
const handleAddProduct = (e) => {
    e.preventDefault();
    const newProduct = {
        name: modalProductName.value,
        price: parseFloat(modalProductPrice.value),
        category: modalProductCategory.value
    };
    products.push(newProduct);
    saveToLocalStorage();
    renderProducts();
    closeAddProductModal();
    showNotification(`${newProduct.name} adicionado com sucesso`, 'success');
};

// Evento para adicionar novo produto
addProductForm.onsubmit = handleAddProduct;

// Eventos
if (openAddProductModalBtn) {
    openAddProductModalBtn.addEventListener('click', openAddProductModal);
}

if (closeAddProductModalBtn) {
    closeAddProductModalBtn.addEventListener('click', closeAddProductModal);
}

if (cartIcon) {
    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'block';
        renderCart();
    });
}

if (closeCartModalBtn) {
    closeCartModalBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
}

if (paymentMethod) {
    paymentMethod.addEventListener('change', () => {
        cashPayment.style.display = paymentMethod.value === 'cash' ? 'block' : 'none';
    });
}

if (cashAmount) {
    cashAmount.addEventListener('input', () => {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const change = cashAmount.value - total;
        changeAmount.textContent = `Troco: R$ ${Math.max(0, change).toFixed(2)}`;
    });
}

if (processPaymentBtn) {
    processPaymentBtn.addEventListener('click', () => {
        if (paymentMethod.value === '') {
            showNotification('Por favor, selecione um método de pagamento.', 'error');
            return;
        }
        if (paymentMethod.value === 'cash' && parseFloat(cashAmount.value) < parseFloat(cartTotal.textContent.split('R$')[1])) {
            showNotification('Valor em dinheiro insuficiente.', 'error');
            return;
        }
        showNotification('Pagamento processado com sucesso!', 'success');
        generateReceipt();
        cart = [];
        saveToLocalStorage();
        updateCartBadge();
        renderCart();
        cartModal.style.display = 'none';
    });
}

// Função para gerar o recibo em PDF
function generateReceipt() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Recibo de Compra', 105, 20, null, null, 'center');
    
    doc.setFontSize(12);
    let yPos = 40;
    cart.forEach((item, index) => {
        doc.text(`${item.name} - ${item.quantity}x R$ ${item.price.toFixed(2)} = R$ ${(item.quantity * item.price).toFixed(2)}`, 20, yPos);
        yPos += 10;
    });
    
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    yPos += 10;
    doc.setFontSize(14);
    doc.text(`Total: R$ ${total.toFixed(2)}`, 20, yPos);
    
    doc.save('recibo.pdf');
}

// Inicialização
renderProducts();
updateCartBadge();

// Adicionar funcionalidade ao menu principal
mainMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        e.preventDefault();
        const menuItems = mainMenu.querySelectorAll('a');
        menuItems.forEach(item => item.classList.remove('active'));
        e.target.classList.add('active');

        const targetSection = e.target.getAttribute('id').replace('menu-', '');
        const sections = document.querySelectorAll('main > section');
        sections.forEach(section => {
            section.classList.remove('active-section');
            section.classList.add('hidden-section');
        });
        document.getElementById(`${targetSection}-section`).classList.remove('hidden-section');
        document.getElementById(`${targetSection}-section`).classList.add('active-section');
    }
});
// Função para abrir o modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

// Função para fechar o modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Event listeners para abrir e fechar modais
document.getElementById('open-add-product-modal').addEventListener('click', function() {
    openModal('add-product-modal');
});

document.getElementById('close-add-product-modal').addEventListener('click', function() {
    closeModal('add-product-modal');
});

document.getElementById('cart-icon').addEventListener('click', function() {
    openModal('cart-modal');
});

document.getElementById('close-cart-modal').addEventListener('click', function() {
    closeModal('cart-modal');
});

// Interações dos itens com o mouse
document.querySelectorAll('.product-card').forEach(function(card) {
    card.addEventListener('mouseover', function() {
        card.style.transform = 'scale(1.05)';
    });
    card.addEventListener('mouseout', function() {
        card.style.transform = 'scale(1)';
    });
});

// Função para processar pagamento
document.getElementById('process-payment').addEventListener('click', function() {
    alert('Pagamento processado com sucesso!');
});
