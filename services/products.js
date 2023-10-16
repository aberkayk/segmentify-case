import { showFilteredProducts, showLoading, notFound } from "../app/app.js";
import { getStorage } from "../utils/localStorage.js";

export const getProducts = async () => {
	showLoading();

	const { category, price, color } = getStorage();
	const [minPrice, maxPrice] = price.split("-").map(Number);

	try {
		const response = await fetch("../data/products.json");
		const data = await response.json();

		const productsMatchingCategory = data.filter((product) =>
			product.category
				.map((el) => el.toLowerCase())
				.some((cat) => cat.includes(category.toLowerCase()))
		);

		const products = productsMatchingCategory
			.filter((product) =>
				product.colors.some((clr) => clr.toLowerCase() === color.toLowerCase())
			)
			.filter((product) => {
				if (price.includes("100+")) {
					return parseFloat(product.price) >= 100;
				}
				return (
					parseFloat(product.price) >= minPrice &&
					parseFloat(product.price) <= maxPrice
				);
			});

		setTimeout(() => {
			products.length > 0 ? showFilteredProducts(products) : notFound();
		}, 1500);
	} catch (error) {
		console.error("Error fetching products:", error);
		notFound();
	}
};
