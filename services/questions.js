import { getStorage } from "../utils/localStorage.js";

export const getQuestion = async (currentStep) => {
	const store = getStorage();

	try {
		const response = await fetch("../data/questions.json");
		const data = await response.json();

		if (!store || !store.category) {
			return data[0]?.steps[0] || null;
		}

		const category = data.find((element) => element.name === store.category);
		const question = category?.steps.find(
			(element) => element.step === currentStep
		);

		return question || null;
	} catch (error) {
		console.error("Error fetching questions:", error);
		return null;
	}
};
