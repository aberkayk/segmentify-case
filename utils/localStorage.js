import { showQuestion } from "../app/app.js";
import { getProducts } from "../services/products.js";

export const getStorage = () => {
  const storageData = localStorage.getItem("store");
  return storageData ? JSON.parse(storageData) : null;
};

export const updateStorage = async (currentStep, subtype, value) => {
  let store = getStorage();

  if (!store) {
    localStorage.setItem(
      "store",
      JSON.stringify({ step: currentStep, [subtype]: value })
    );
    return showQuestion(currentStep);
  }

  if (currentStep < store.step) {
    store.step = currentStep;
    delete store[subtype];

    localStorage.setItem("store", JSON.stringify(store));
    return showQuestion(currentStep);
  }

  store[subtype] = value;
  store.step = currentStep;
  localStorage.setItem("store", JSON.stringify(store));

  const totalNumberOfSteps = await stepCounter(store);
  if (currentStep === totalNumberOfSteps) return getProducts();

  showQuestion(currentStep);
};

export const stepCounter = async (store) => {
  if (!store) return 0;

  const response = await fetch("../data/questions.json");
  const data = await response.json();

  const { steps } = data.find((element) => element.name === store.category) || {
    steps: [],
  };

  return steps.length;
};
