import { getQuestion } from "../services/questions.js";
import { getProducts } from "../services/products.js";
import {
  getStorage,
  updateStorage,
  stepCounter,
} from "../utils/localStorage.js";

const form = document.getElementById("form");
const content = form.querySelector(".content");

export const showLoading = () => {
  content.innerHTML = `<div class="loading">Filtering Products</div>`;
};

export const notFound = () => {
  content.innerHTML = `
    <div class="not-found">
      <p>Products Not Found</p>
      <button id="backButton">Back</button>
    </div>
  `;

  const backButton = document.getElementById("backButton");

  backButton.addEventListener("click", (event) => {
    event.preventDefault();
    updateStorage(2);
  });
};

export const showFilteredProducts = (products) => {
  const productHTML = products
    .map((product) => {
      return `
      <div class="swiper-slide">
        <div class="slider-image-wrapper"><img src=${
          product.image
        } loading="lazy" /></div>
        <p class="product-title">${product.name}</p>
        <p class="product-price">€${product.price}</p>
        <p class="product-old-price">${
          product.oldPrice ? "€" + product.oldPrice : ""
        }</p>
        <button disabled>VIEW PRODUCT</button>
      </div>
    `;
    })
    .join("");

  content.innerHTML = `
    <div class="product-container">
      <div class="swiper mySwiper">
        <div class="swiper-wrapper">
          ${productHTML}
        </div>
      </div>
      <div class="swiper-button-next"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-pagination"></div>
    </div>
    <div class="reset-button-div">
      <button id="resetButton">Reset</button>
    </div>
  `;

  new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  if (products.length >= 15) {
    document.querySelectorAll(".swiper-pagination-bullet").forEach((el) => {
      el.style.cssText = "width:1.5%";
    });
  }

  const resetButton = document.getElementById("resetButton");

  resetButton.addEventListener("click", (event) => {
    event.preventDefault();
    updateStorage(0);
  });
};

export const showQuestion = async (currentStep) => {
  const [question, stepIndex] = await Promise.all([
    getQuestion(currentStep),
    stepCounter(getStorage()),
  ]);

  const buttonsHTML = question.answers
    .map((btn) => {
      return `<button style=${
        question.subtype === "color"
          ? `background-color:${btn === "Cream" ? "#EADBC8" : btn}`
          : ""
      }>${btn}</button>`;
    })
    .join("");

  const stepSpansHTML = Array.from({ length: stepIndex }, (_, index) => {
    return `<span class=${currentStep >= index ? "active" : ""}></span>`;
  }).join("");

  content.innerHTML = `
    <div class="question">
      <p style=${!question.subtitle ? "display:none" : ""}>${
    question.subtitle
  }</p>
      <h1>${question.title}</h1>
      <div data-button=${question.subtype} class="step-buttons">
        ${buttonsHTML}
      </div>
      <div data-button=${question.subtype} class="prev-next-button-wrapper">
        <button><</button>
        <button>></button>
      </div>
      <div class="step-lines">
        ${stepSpansHTML}
      </div>
    </div>
  `;

  const answerButtons = document.querySelectorAll(
    `.step-buttons[data-button="${question.subtype}"] button`
  );

  const prevButton = document.querySelectorAll(
    `.prev-next-button-wrapper[data-button="${question.subtype}"] button`
  )[0];

  const nextButton = document.querySelectorAll(
    `.prev-next-button-wrapper[data-button="${question.subtype}"] button`
  )[1];

  let selectedAnswer;

  answerButtons.forEach((button, index) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      for (let i = 0; i < answerButtons.length; i++) {
        if (index !== i) {
          answerButtons[i].classList.remove("active");
        }
      }

      button.classList.add("active");
      selectedAnswer = button.innerHTML;
    });
  });

  prevButton.addEventListener("click", (event) => {
    event.preventDefault();

    if (getStorage().step > 0) {
      updateStorage(currentStep - 1, question.subtype, selectedAnswer);
    }
  });

  nextButton.addEventListener("click", (event) => {
    event.preventDefault();

    if (!selectedAnswer) {
      alert("Please select an option.");
    } else {
      updateStorage(currentStep + 1, question.subtype, selectedAnswer);
    }
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  const store = getStorage();

  if (!store) {
    showQuestion(0);
  } else {
    const stepIndex = await stepCounter(store);
    store.step === stepIndex ? getProducts() : showQuestion(store.step);
  }
});
