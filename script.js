const delay = 2000;
let value = 0;
let valueStore = 0;
let tick = 1;
let tickStore = 1;
let tickDiff = 0;
let tickDiffValue = 0;

valBetween = (v, min, max) => Math.min(max, Math.max(min, v));

(function loop() {
	if(navigator.onLine) {
	value = Math.ceil(Math.random() * 100);
	}
	else {
		value=0;
	}
	tick = valBetween(Math.ceil((value / 100) * 28), 1, 28);
	tickDiff = Math.abs(tick - tickStore);
	tickDiffValue = Math.abs(value - valueStore) / tickDiff;

	// console.log(
	// 	"tickDiff: " +
	// 		tickDiffValue +
	// 		" * " +
	// 		tickDiff +
	// 		" = " +
	// 		tickDiffValue * tickDiff
	// );
	let counter = 0;

	const valueStoreTemp = valueStore;
	const tickStoreTemp = tickStore;
	if (value > valueStore) {
		for (i = tickStoreTemp; i <= tick; i++) {
			(i => {
				setTimeout(() => {
					document.querySelector(
						".speedtest-container"
					).style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0.25) 50%, transparent 50%), linear-gradient(${
						$(`#gauge path:nth-child(${i})`)[0].style.fill
					}, ${
						$(`#gauge path:nth-child(${i})`)[0].style.fill
					} 50%, rgba(255, 255, 255, 0) 50%)`;
					document.getElementById(
						"gauge"
					).style.boxShadow = `0 0 32px rgba(21, 55, 172, 0.25), inset 0 -192px 192px -240px ${
						$(`#gauge path:nth-child(${i})`)[0].style.fill
					}, inset 0 0 2px -1px ${$(`#gauge path:nth-child(${i})`)[0].style.fill}`;
					$(`#gauge path:nth-child(${i})`).show();
					$("#gauge-label")
						.css("color", $(`#gauge path:nth-child(${i})`)[0].style.fill)
						.text(
							Math.ceil(valueStoreTemp + tickDiffValue * Math.abs(tickStoreTemp - i))
						);
					if (i == tick) {
						$("#gauge-label").text(value);
					}
					// console.log(i);
				}, 50 * counter);
				counter++;
			})(i);
		}
	} else if (value < valueStore) {
		for (i = tickStoreTemp; i >= tick; i--) {
			(i => {
				setTimeout(() => {
					document.querySelector(
						".speedtest-container"
					).style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0.25) 50%, var(--bg-color) 50%), linear-gradient(${
						$(`#gauge path:nth-child(${i})`)[0].style.fill
					}, ${$(`#gauge path:nth-child(${i})`)[0].style.fill} 50%, #fff 50%)`;
					$("#gauge").css(
						"box-shadow",
						`0 0 32px rgba(21, 55, 172, 0.25), inset 0 -192px 192px -240px ${
							$(`#gauge path:nth-child(${i})`)[0].style.fill
						}, inset 0 0 2px -1px ${$(`#gauge path:nth-child(${i})`)[0].style.fill}`
					);
					$(`#gauge path:nth-child(${i})`).hide();
					$("#gauge-label")
						.css("color", $(`#gauge path:nth-child(${i})`)[0].style.fill)
						.text(
							Math.floor(valueStoreTemp - tickDiffValue * Math.abs(tickStoreTemp - i))
						);
					if (i == tick) {
						$("#gauge-label").text(value);
					}
					// console.log(i);
				}, 50 * counter);
				counter++;
			})(i);
		}
	}
	valueStore = value;
	tickStore = tick;
	window.setTimeout(loop, delay);
})();

const toggleSwitch = document.getElementById("checkbox");
const currentTheme = localStorage.getItem("theme");

if (currentTheme) {
	document.documentElement.setAttribute("data-theme", currentTheme);

	if (currentTheme === "dark") {
		toggleSwitch.checked = true;
	}
}

function switchTheme({ target }) {
	if (target.checked) {
		document.documentElement.setAttribute("data-theme", "dark");
		localStorage.setItem("theme", "dark");
	} else {
		document.documentElement.setAttribute("data-theme", "light");
		localStorage.setItem("theme", "light");
	}
}

toggleSwitch.addEventListener("change", switchTheme, false);

fetch("https://ipapi.co/json/")
	.then(response => response.json())
	.then(data => {
		document.getElementById(
			"client"
		).innerHTML = `<span>${data.city}, ${data.region}, ${data.country}</span><span>${data.ip}</span><span>${data.org}</span>`;
	});
	