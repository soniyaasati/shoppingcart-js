const cartBtn = document.querySelector(".navigationbar-cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".navigationbar-cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDom = document.querySelector(".productlist-products-center");
const bodyDom = document.querySelector("productbody");

let cart = [];
let buttonsDOM = [];

class Products {
  async getProducts() {
    try {
      let result = await fetch("Cart.json");
      let data = await result.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  displyProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `
            <article class="productlist-product col-xs-6">
              <div class="productlist-img-container">
                  <img src=${
                    product.img_url
                  } class="productlist-product-img" alt="item">
              </div>
              <h3 class="productlist-product-name">${product.name}</h3>
                <h5 class="displayprice" data-price="${
                  product.price - (product.price * product.discount) / 100
                }"><span>$</span>
          ${product.price - (product.price * product.discount) / 100}
          <del class="productlist-delPrice">$${product.price}</del>
          <span class="productlist-discPrice">${product.discount}%</span>
        </h5>
              <button class="productlist-item-btn" data-id=${product.id}>
               Add to Cart
            </button>
          </article>`;
    });
    productsDom.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".productlist-item-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      console.log(id);
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        //get product from products
        let cartItem = { ...Storage.getProducts(id), amount: 1 };
        //add product to cart
        cart = [...cart, cartItem];
        //save cart in local storage
        Storage.saveCart(cart);
        //set cart values
        this.setCartValues(cart);
        //display cart item
        this.addCartItem(cartItem);
        // show the cart
        //this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<div class="cart-main"><div class="cart-img"><img src=${cartItem.img_url} alt="item"></div>
      <div class="cart-counter">
          <h5>${cartItem.name}</h5>
          <h5>$${cartItem.price}</h5>
          
      </div>
     
      <div class="cart-counter">
          <i class="fas fa-plus-square" data-id=${cartItem.id}></i>
          <span class="item-amount">${cartItem.amount}</span>
          <i class="fas fa-minus-square" data-id=${cartItem.id}></i>
      </div>
       <div class="cart-remove"><span class="remove-item" data-id=${cartItem.id}>remove</span></div>
      </div></div>`;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("cart-transparentBcg");
    cartDom.classList.add("cart-showCart");
    bodyDom.classList.add("hidescroll");
  }
  setUpApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("cart-transparentBcg");
    cartDom.classList.remove("cart-showCart");
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(
          removeItem.parentElement.parentElement.parentElement
        );
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-plus-square")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-minus-square")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `Add to Cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//Local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}
lowtohigh = () => {
  const ui = new UI();
  const products = new Products();
  ui.setUpApp();
  //get all products
  products
    .getProducts()
    .then((products) => {
      console.log(products);
      products.sort(function (a, b) {
        return a.price - b.price;
      });
      console.log(products);
      ui.displyProducts(products);
      // Storage.saveProducts(products);
    })
    .then(() => {
      // ui.getBagButtons();
      ui.cartLogic();
    });
};
document.getElementById("ltoh").onclick = function () {
  lowtohigh();
};
document.getElementById("ltohM").onclick = function () {
  lowtohigh();
};
highttolow = () => {
  const ui = new UI();
  const products = new Products();
  ui.setUpApp();
  //get all products
  products
    .getProducts()
    .then((products) => {
      console.log(products);
      products.sort(function (a, b) {
        return b.price - a.price;
      });
      console.log(products);
      ui.displyProducts(products);
      // Storage.saveProducts(products);
    })
    .then(() => {
      // ui.getBagButtons();
      ui.cartLogic();
    });
};
document.getElementById("htol").onclick = function () {
  highttolow();
};
document.getElementById("htolM").onclick = function () {
  highttolow();
};
discount = () => {
  const ui = new UI();
  const products = new Products();
  ui.setUpApp();
  //get all products
  products
    .getProducts()
    .then((products) => {
      console.log(products);
      products.sort(function (a, b) {
        return b.discount - a.discount;
      });
      console.log(products);
      ui.displyProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
};

document.getElementById("discount").onclick = function () {
  discount();
};
document.getElementById("discountM").onclick = function () {
  discount();
};

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setUpApp();
  //get all products
  products
    .getProducts()
    .then((products) => {
      ui.displyProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
// Filter sorting - title//
searchFunction = () => {
  var input, filter, myItems, cards, i, current, h5, text;

  input = document.getElementById("searchFilter");
  filter = input.value.toUpperCase();
  myItems = document.getElementById("productsdisp");
  cards = myItems.getElementsByClassName("productlist-product");

  for (i = 0; i < cards.length; i++) {
    current = cards[i];
    h5 = current.getElementsByClassName("productlist-product-name")[0];
    text = h5.innerText.toUpperCase();
    if (text.indexOf(filter) > -1) {
      current.style.display = "";
    } else {
      current.style.display = "none";
    }
  }
};
//////Slider Script///////
function data_filter(mini, maxi, data_name) {
  $("#productlistcenter article h5").filter(function () {
    var value = $(this).data(data_name);

    if (value > maxi || value < mini) {
      $(this).closest(".productlist-product").addClass("slider1Hide");
    }
  });
}

function showProducts() {
  // Reset filters

  $("#productlistcenter article h5")
    .closest(".productlist-product")
    .removeClass("slider1Hide");
  // Price
  var minP = $("#price").slider("values", 0);
  var maxP = $("#price").slider("values", 1);
  var minM = $("#priceM").slider("values", 0);
  var maxM = $("#priceM").slider("values", 1);

  data_filter(minP, maxP, "price"); // Call the new function
  data_filter(minM, maxM, "price");
}

// Below here, there's no change
$(function () {
  var options = {
    range: true,
    min: 0,
    max: 1000,
    step: 50,
    values: [0, 1000],
    slide: function (event, ui) {
      $("#amount").val(ui.values[0] + " $ - " + ui.values[1] + " $");
      $("#amountM").val(ui.values[0] + " $ - " + ui.values[1] + " $");
    },
    change: function (event, ui) {
      showProducts();
    },
  };
  $("#price").slider(options);
  $("#priceM").slider(options);
  $("#amount").val(
    $("#price").slider("values", 0) +
      " $ - " +
      $("#price").slider("values", 1) +
      " $"
  );
  $("#amountM").val(
    $("#priceM").slider("values", 0) +
      " $ - " +
      $("#priceM").slider("values", 1) +
      " $"
  );
});
