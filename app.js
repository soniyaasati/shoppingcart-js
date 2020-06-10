const cartBtn = document.querySelector(".navigationbar__center--cartbtn");

const clearCartBtn = document.querySelector(".clear_cart");
const cartDom = document.querySelector(".cart");
//const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".navigationbar__center--cartitems");
const cartTotal = document.querySelector(".cart__total");
const cartContent = document.querySelector(".cart__content");
const productsDom = document.querySelector(".productlist__productscenter");
const productlistDom = document.querySelector(".productlist");
//const bodyDom = document.querySelector("productbody");
const lowtohighprice = document.querySelector(".ltoh");
const hightolowprice = document.querySelector(".htol");
const discountprice = document.querySelector(".discount");
const lowtohighpriceM = document.querySelector(".ltohM");
const hightolowpriceM = document.querySelector(".htolM");
const discountpriceM = document.querySelector(".discountM");

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
lowtohighprice.classList.add("productlist__sortBy--pricefilteractive");
hightolowprice.classList.remove("productlist__sortBy--pricefilteractive");
discountprice.classList.remove("productlist__sortBy--pricefilteractive");
lowtohighpriceM.classList.add("productlist__sortBy--pricefilteractive");
hightolowpriceM.classList.remove("productlist__sortBy--pricefilteractive");
discountpriceM.classList.remove("productlist__sortBy--pricefilteractive");

class UI {
  displyProducts(products) {
    cartDom.style.display = "none";

    let result = "";
    products.forEach((product) => {
      result += `
            <article class="productlist__product">
              <div class="productlist__product--imgcontainer">
                  <img src=${
                    product.img_url
                  } class="productlist__product--img" alt="item">
              </div>
              <h3 class="productlist__product--name">${product.name}</h3>
                <h5 class="productlist__product--price" data-price="${
                  product.price - (product.price * product.discount) / 100
                }"><span><i class="fa fa-inr" aria-hidden="true"></i>${
        product.price - (product.price * product.discount) / 100
      }</span>
          
          <del class="productlist__product--delPrice"><i class="fa fa-inr" aria-hidden="true"></i>${
            product.price
          }</del>
          <span class="productlist__product--discPrice">${
            product.discount
          }%</span>
        </h5>
              <button class="productlist__product--itembtn" data-id=${
                product.id
              }>
               Add to Cart
            </button>
          </article>`;
    });
    productsDom.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [
      ...document.querySelectorAll(".productlist__product--itembtn"),
    ];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      console.log(id);
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.style.background = "#cfcfcf";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        button.style.background = "#cfcfcf";
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
      tempTotal +=
        (item.price - (item.price * item.discount) / 100) * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart__item");
    div.innerHTML = `<div class="cart__item--main"><div class="cart__item--img"><img src=${
      cartItem.img_url
    } alt="item"></div>
      <div class="cart__item--counter">
          <h5 class="cart__item--name">${cartItem.name}</h5>        

           
                <h5 class="cart__item--price" data-price="${
                  cartItem.price - (cartItem.price * cartItem.discount) / 100
                }"><span>$</span>
          ${cartItem.price - (cartItem.price * cartItem.discount) / 100}
          <del class="cart__item--delPrice">$${cartItem.price}</del>
          <span class="cart__item--discPrice">${cartItem.discount}%</span>
        </h5>
          
      </div>
     
      <div class="cart__item--counter">
          <i class="fas fa-plus-square" data-id=${cartItem.id}></i>
          <span class="cart__item--amount">${cartItem.amount}</span>
          <i class="fas fa-minus-square" data-id=${cartItem.id}></i>
      </div>
       <div class="cart__item--remove"><span class="remove-item" data-id=${
         cartItem.id
       }>Remove</span></div>
      </div></div>`;
    cartContent.appendChild(div);
  }

  showCart() {
    productlistDom.style.display = "none";
    cartDom.style.display = "block";
    //bodyDom.classList.add("hidescroll");
  }
  setUpApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    productlistDom.style.display = "block";
    cartDom.style.display = "none";
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
    button.style.background = "#f09d51";
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
  lowtohighprice.classList.add("productlist__sortBy--pricefilteractive");
  hightolowprice.classList.remove("productlist__sortBy--pricefilteractive");
  discountprice.classList.remove("productlist__sortBy--pricefilteractive");
  lowtohighpriceM.classList.add("productlist__sortBy--pricefilteractive");
  hightolowpriceM.classList.remove("productlist__sortBy--pricefilteractive");
  discountpriceM.classList.remove("productlist__sortBy--pricefilteractive");

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
      ui.getBagButtons();
      //  ui.cartLogic();
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
  lowtohighprice.classList.remove("productlist__sortBy--pricefilteractive");
  discountprice.classList.remove("productlist__sortBy--pricefilteractive");
  hightolowprice.classList.add("productlist__sortBy--pricefilteractive");
  lowtohighpriceM.classList.remove("productlist__sortBy--pricefilteractive");
  discountpriceM.classList.remove("productlist__sortBy--pricefilteractive");
  hightolowpriceM.classList.add("productlist__sortBy--pricefilteractive");

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
      ui.getBagButtons();
      // ui.cartLogic();
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
  discountprice.classList.add("productlist__sortBy--pricefilteractive");
  hightolowprice.classList.remove("productlist__sortBy--pricefilteractive");
  lowtohighprice.classList.remove("productlist__sortBy--pricefilteractive");
  discountpriceM.classList.add("productlist__sortBy--pricefilteractive");
  hightolowpriceM.classList.remove("productlist__sortBy--pricefilteractive");
  lowtohighpriceM.classList.remove("productlist__sortBy--pricefilteractive");

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
      // ui.cartLogic();
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
searchProductFunction = () => {
  var input, filter, myItems, cards, i, current, h5, text;

  input = document.getElementById("searchProduct__Input");
  filter = input.value.toUpperCase();
  myItems = document.getElementById("productsDisplay");
  cards = myItems.getElementsByClassName("productlist__product");

  for (i = 0; i < cards.length; i++) {
    current = cards[i];
    h5 = current.getElementsByClassName("productlist__product--name")[0];
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
      $(this).closest(".productlist__product").addClass("sliderHide");
    }
  });
}

function showProducts() {
  // Reset filters

  $("#productlistcenter article h5")
    .closest(".productlist__product")
    .removeClass("sliderHide");
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
      $("#amount").val(ui.values[0] + " - " + ui.values[1] + " ");
      $("#amountM").val(ui.values[0] + "- " + ui.values[1] + " ");
    },
    change: function (event, ui) {
      //showProducts();
    },
  };
  $("#price").slider(options);
  $("#priceM").slider(options);
  $("#amount").val(
    $("#price").slider("values", 0) +
      " - " +
      $("#price").slider("values", 1) +
      ""
  );
  $("#amountM").val(
    $("#priceM").slider("values", 0) +
      " - " +
      $("#priceM").slider("values", 1) +
      ""
  );
});
$(".slider__applyfilter--btn").on("click", function () {
  showProducts();
});
