// function $(id) {
// 	return document.getElementById(id);
// }

function getRGBtoHex(rgb) {
	if (typeof rgb !== 'string') return '#000000';

	if (rgb.startsWith('#') && (rgb.length === 7 || rgb.length === 4)) {
		return rgb;
	}

	const result = rgb.match(/\d+/g);
	if (!result || result.length < 3) return '#000000';

	const r = parseInt(result[0], 10).toString(16).padStart(2, '0');
	const g = parseInt(result[1], 10).toString(16).padStart(2, '0');
	const b = parseInt(result[2], 10).toString(16).padStart(2, '0');

	return `#${r}${g}${b}`;
}

function getTextColorForBackground(hexColor) {
	const r = parseInt(hexColor.substr(1, 2), 16);
	const g = parseInt(hexColor.substr(3, 2), 16);
	const b = parseInt(hexColor.substr(5, 2), 16);
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;

	return brightness > 200 ? 'black' : 'white';
}

function getAverageColor(image) {
	const canvas = document.createElement('canvas');

	const width = 100;
	const height = 100;
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0, 0, width, height);

	const imageData = ctx.getImageData(0, 0, width, height).data;
	let r = 0, g = 0, b = 0, count = 0;

	for (let i = 0; i < imageData.length; i += 4) {
		r += imageData[i];
		g += imageData[i + 1];
		b += imageData[i + 2];
		count++;
	}
	r = Math.round(r / count);
	g = Math.round(g / count);
	b = Math.round(b / count);

	const color = `rgb(${r}, ${g}, ${b})`;

	return color;
}

function TextLetterSpacing(ctx, text, x, y, spacing, align = 'left') {
	const totalWidth = text.split('').reduce((sum, char) => sum + ctx.measureText(char).width + spacing, -spacing);
	if (align === 'center') {
		x -= totalWidth / 2;
	} else if (align === 'right') {
		x -= totalWidth;
	}
	for (let i = 0; i < text.length; i++) {
		ctx.fillText(text[i], x, y);
		x += ctx.measureText(text[i]).width + spacing;
	}
}

function TextLetterSpacingMultiline(ctx, text, x, y, spacing, lineHeight, align = 'left') {
	const lines = text.split('\n');
	lines.forEach((line, index) => {
		TextLetterSpacing(ctx, line, x, y + index * lineHeight, spacing, align);
	});
}

let selectedBackgroundColor = null;

function drawCoverImage(ctx, image, canvas, destY = 0, destHeight = null) {
	const destWidth = canvas.width;
	if (destHeight === null) destHeight = canvas.height - destY;
	const destAspect = destWidth / destHeight;
	const sourceAspect = image.width / image.height;
	let sx, sy, sWidth, sHeight;

	if (sourceAspect > destAspect) {
		sHeight = image.height;
		sWidth = image.height * destAspect;
		sx = (image.width - sWidth) / 2;
		sy = 0;
	} else {
		sWidth = image.width;
		sHeight = image.width / destAspect;
		sx = 0;
		sy = (image.height - sHeight) / 2;
	}
	ctx.drawImage(
		image,
		sx, sy, sWidth, sHeight,
		0, destY, destWidth, destHeight
	);
}

function renderBackground(ctx, canvas) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = selectedBackgroundColor || '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const shadow = document.getElementById('useShadow').checked;
	const blur = document.getElementById('useBlur').checked;
	const grain = document.getElementById('useGrain').checked;
	const grainStrength = parseInt(document.getElementById('grainStrength')?.value || '20', 10);


	ctx.shadowColor = 'transparent';
	ctx.shadowBlur = 0;

	if (shadow) {
		ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
		ctx.shadowBlur = 20;
	}

	const blurValue = 6;
	if (uploadedImage) {
		if (blur) {
			ctx.filter = `blur(${blurValue}px)`;
			drawCoverImage(ctx, uploadedImage, canvas);
			ctx.filter = 'none';
		} else {
			drawCoverImage(ctx, uploadedImage, canvas);
		}
	}

	if (grain) {
		const grainCanvas = document.createElement('canvas');
		grainCanvas.width = canvas.width;
		grainCanvas.height = canvas.height;
		const grainCtx = grainCanvas.getContext('2d');

		const imageData = grainCtx.createImageData(grainCanvas.width, grainCanvas.height);
		for (let i = 0; i < imageData.data.length; i += 4) {
			const value = Math.random() * 255;
			imageData.data[i] = value;
			imageData.data[i + 1] = value;
			imageData.data[i + 2] = value;
			imageData.data[i + 3] = grainStrength;
		}
		grainCtx.putImageData(imageData, 0, 0);
		ctx.drawImage(grainCanvas, 0, 0);
	}
}

function renderWarnings(username, title, subtitle, footer) {
	const WARNING_LENGTH = 10;
	const usernameWarning = document.getElementById('usernameWarning');
	const titleWarning = document.getElementById('titleWarning');
	const subtitleWarning = document.getElementById('subtitleWarning');
	const footerWarning = document.getElementById('footerWarning');

	usernameWarning.innerText = username.length > WARNING_LENGTH ? '⚠️ Warning, detected long text.' : '';
	titleWarning.innerText = title.length > WARNING_LENGTH ? '⚠️ Warning, detected long text.' : '';
	subtitleWarning.innerText = subtitle.length > WARNING_LENGTH ? '⚠️ Warning, detected long text.' : '';
	footerWarning.innerText = footer.length > WARNING_LENGTH ? '⚠️ Warning, detected long text.' : '';
}

const DEFAULT_USERNAME = 'Freefy';
const FREEFY_LOGO_WHITE_URL = '/assets/images/freefy-logo-white.svg';
const FREEFY_LOGO_BLACK_URL = '/assets/images/freefy-logo-black.svg';
let freefyLogoWhiteImage = null;
let freefyLogoBlackImage = null;

// Load Freefy logos
function loadFreefyLogos() {
	// Load white logo
	if (!freefyLogoWhiteImage) {
		freefyLogoWhiteImage = new Image();
		freefyLogoWhiteImage.crossOrigin = 'anonymous';
		freefyLogoWhiteImage.onload = () => {
			render();
		};
		freefyLogoWhiteImage.onerror = () => {
			console.warn('Failed to load Freefy white logo');
		};
		freefyLogoWhiteImage.src = FREEFY_LOGO_WHITE_URL;
	}
	
	// Load black logo
	if (!freefyLogoBlackImage) {
		freefyLogoBlackImage = new Image();
		freefyLogoBlackImage.crossOrigin = 'anonymous';
		freefyLogoBlackImage.onload = () => {
			render();
		};
		freefyLogoBlackImage.onerror = () => {
			console.warn('Failed to load Freefy black logo');
		};
		freefyLogoBlackImage.src = FREEFY_LOGO_BLACK_URL;
	}
}

// Get appropriate logo based on text color and user preference
function getFreefyLogo(textColor) {
	const logoColorSelect = document.getElementById('freefyLogoColor');
	if (!logoColorSelect) return null;
	
	const selectedColor = logoColorSelect.value;
	
	if (selectedColor === 'auto') {
		// Choose logo based on text color
		return textColor === 'white' ? freefyLogoWhiteImage : freefyLogoBlackImage;
	} else if (selectedColor === 'white') {
		return freefyLogoWhiteImage;
	} else {
		return freefyLogoBlackImage;
	}
}

function renderTextContent(ctx, canvas, textColor, theme) {
	const usernameInput = document.getElementById('username').value.trim();
	const useFreefyLogo = document.getElementById('useFreefyLogo') ? document.getElementById('useFreefyLogo').checked : false;
	const shouldUseLogo = useFreefyLogo && !usernameInput; // Use logo when toggle is on AND input is empty
	const username = usernameInput || (shouldUseLogo ? '' : DEFAULT_USERNAME); // Use DEFAULT_USERNAME only when not using logo
	const title = document.getElementById('title').value.trim();
	const subtitle = document.getElementById('subtitle').value.trim();
	const footer = document.getElementById('footer').value.trim();

	renderWarnings(username, title, subtitle, footer);

	ctx.textAlign = 'left';
	ctx.globalAlpha = 1.0;
	ctx.fillStyle = textColor;

	if (theme == 'Modern') {
		const logoImage = getFreefyLogo(textColor);
		if (shouldUseLogo && logoImage && logoImage.complete) {
			// Draw Freefy logo with same size as 40px font
			const logoHeight = 40;
			const logoWidth = (logoImage.width / logoImage.height) * logoHeight;
			// Adjust vertical position to match text baseline (92 - font descent)
			ctx.drawImage(logoImage, 64, 62, logoWidth, logoHeight);
		} else {
			ctx.font = '600 40px Pretendard, sans-serif';
			TextLetterSpacing(ctx, username, 64, 92, 1.5, 'left');
		}
		ctx.font = '700 90px Pretendard, sans-serif';
		TextLetterSpacing(ctx, title, 60, 208, -3);
		ctx.font = '400 90px Pretendard, sans-serif';
		TextLetterSpacing(ctx, subtitle, 60, 290, -4);
		ctx.globalAlpha = 0.5;
		ctx.font = '400 30px Pretendard, sans-serif';
		TextLetterSpacing(ctx, footer, 60, canvas.height - 70, 1);
		ctx.globalAlpha = 1.0;
	} else if (theme == 'Normal') {
		const logoImage = getFreefyLogo(textColor);
		if (shouldUseLogo && logoImage && logoImage.complete) {
			// Draw Freefy logo with same size as 34px font
			const logoHeight = 34;
			const logoWidth = (logoImage.width / logoImage.height) * logoHeight;
			// Adjust vertical position to match text baseline (50 - font descent)
			ctx.drawImage(logoImage, canvas.width - 30 - logoWidth, 24, logoWidth, logoHeight);
		} else {
			ctx.font = '500 34px Pretendard, sans-serif';
			TextLetterSpacing(ctx, username, canvas.width - 30, 50, 2, 'right');
		}
		ctx.font = '600 120px Pretendard, sans-serif';
		TextLetterSpacing(ctx, title, canvas.width / 2, 310, -4, 'center');
		ctx.font = '500 34px Pretendard, sans-serif';
		TextLetterSpacing(ctx, subtitle, canvas.width / 2, 370, 0, 'center');
		ctx.globalAlpha = 0.5;
		ctx.font = '400 34px Pretendard, sans-serif';
		TextLetterSpacing(ctx, footer, canvas.width / 2, canvas.height - 100, -1, 'center');
		ctx.globalAlpha = 1.0;
	} else if (theme === 'Essentials') {
		const titleText = 'Essentials';
		const topHeight = 200;
		
		let topFillColor = '#d8c8c5';
		topFillColor = uploadedImage ? getAverageColor(uploadedImage) : selectedBackgroundColor || '#d8c8c5';

		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = topFillColor;
		ctx.fillRect(0, 0, canvas.width, topHeight);
		
		if (uploadedImage) {
			drawCoverImage(ctx, uploadedImage, canvas, topHeight, canvas.height - topHeight);
		}
		else {
			ctx.fillStyle = selectedBackgroundColor || '#000';
			ctx.fillRect(0, topHeight, canvas.width, canvas.height - topHeight);
		}

		const topFillHex = getRGBtoHex(topFillColor);
		const titleTextColor = getTextColorForBackground(topFillHex);
		ctx.fillStyle = titleTextColor;

		ctx.textAlign = 'left';
		const logoImage = getFreefyLogo(titleTextColor);
		if (shouldUseLogo && logoImage && logoImage.complete) {
			// Draw Freefy logo with same size as 34px font
			const logoHeight = 34;
			const logoWidth = (logoImage.width / logoImage.height) * logoHeight;
			// Adjust vertical position to match text baseline (50 - font descent)
			ctx.drawImage(logoImage, canvas.width - 30 - logoWidth, 24, logoWidth, logoHeight);
		} else {
			ctx.font = '500 34px Pretendard, sans-serif';
			TextLetterSpacing(ctx, username, canvas.width - 30, 50, 2, 'right');
		}
		ctx.font = '600 80px Pretendard, sans-serif';
		TextLetterSpacing(ctx, titleText, 30, 160, 0, 'left');
	} else if (theme == 'Classic') {
		const logoImage = getFreefyLogo(textColor);
		if (shouldUseLogo && logoImage && logoImage.complete) {
			// Draw Freefy logo with "Classical" text below, same size as 34px font
			const logoHeight = 34;
			const logoWidth = (logoImage.width / logoImage.height) * logoHeight;
			// Adjust vertical position to match text baseline (50 - font descent)
			ctx.drawImage(logoImage, canvas.width - 30 - logoWidth, 24, logoWidth, logoHeight);
			ctx.font = '500 34px Pretendard, sans-serif';
			TextLetterSpacing(ctx, 'Classical', canvas.width - 30, 90, 2, 'right');
		} else {
			const classic_username = (username === DEFAULT_USERNAME || username === '') ? `${DEFAULT_USERNAME}\nClassical` : `${username}\nClassical`;
			ctx.font = '500 34px Pretendard, sans-serif';
			TextLetterSpacingMultiline(ctx, classic_username, canvas.width - 30, 50, 2, 40, 'right');
		}
		ctx.font = '600 80px Pretendard, sans-serif';
		TextLetterSpacing(ctx, title, canvas.width / 2, ((canvas.height / 2) + 20), 0, 'center');
	}
}

function showCanvasLoading() {
	canvasLoadingOverlay?.classList.remove('hidden');
}

function hideCanvasLoading() {
	canvasLoadingOverlay?.classList.add('hidden');
}

function render() {
	const canvas = document.getElementById('cover');
	const ctx = canvas.getContext('2d');

	const textColor = uploadedImage ? selectedTextColor || 'white' : getTextColorForBackground(selectedBackgroundColor || '#000');
	let theme = document.getElementById('themeSelect').value;

	renderBackground(ctx, canvas);
	renderTextContent(ctx, canvas, textColor, theme);

	hideCanvasLoading();
}

function download() {
	const canvas = document.getElementById('cover');
	const format = document.getElementById('format').value;
	const link = document.createElement('a');
	
	link.download = `playlist-cover.${format}`;

	console.log('format: ', format);
	if (format === 'jpg') {
		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = canvas.width;
		tempCanvas.height = canvas.height;
		const tempCtx = tempCanvas.getContext('2d');

		tempCtx.fillStyle = '#fff';
		tempCtx.fillRect(0, 0, canvas.width, canvas.height);
		tempCtx.drawImage(canvas, 0, 0);

		link.href = tempCanvas.toDataURL('image/jpeg');
	} else {
		link.href = canvas.toDataURL('image/png');
	}
	link.click();
}

let uploadedImage = null;

function updateImageMetadata({ src, title, source = 'Unknown', author = 'Unknown' }) {
	if (container) {
		container.style.backgroundImage = `url('${src}')`;
		container.style.backgroundSize = 'cover';
		container.style.backgroundPosition = 'center';
		container.style.backgroundColor = '';
	}
	if (imageTitle) imageTitle.innerText = title;
	if (imageSource) imageSource.innerText = source;
	if (imageAuthor) imageAuthor.innerText = author;
}

document.getElementById('imageUpload').addEventListener('change', function (e) {
	const file = e.target.files[0];
	if (file) {
		showCanvasLoading();
		const reader = new FileReader();
		reader.onload = function (event) {
			uploadedImage = new Image();
			uploadedImage.onload = () => {
				const avgRgb = getAverageColor(uploadedImage);
				const avgHex = getRGBtoHex(avgRgb);
				const textColor = getTextColorForBackground(avgHex);

				selectedTextColor = textColor;
				selectedBackgroundColor = null;

				render();
				updateImageMetadata({
					src: uploadedImage.src,
					title: file.name,
					source: '(User Uploaded)',
					author: 'Unknown'
				});
			};
			uploadedImage.src = event.target.result;
		};
		reader.readAsDataURL(file);
	}
});

let imagePicker, container, imageTitle, imageSource, imageAuthor;
let canvasLoadingOverlay;
let grainCheckbox, grainStrengthContainer, grainStrengthSlider, grainStrengthValue;
const DASHED_COLOR = '#3a3a3a'


document.addEventListener('DOMContentLoaded', async () => {
	imagePicker = document.getElementById('image-selector');
	colorSelector = document.getElementById('color-selector');
	filePicker = document.getElementById('file-selector');
	colorPicker = document.getElementById('color-picker');
	
	container = document.getElementById('mini-image-thumnail');
	imageTitle = document.getElementById('imageTitle');
	imageSource = document.getElementById('imageSource');
	imageAuthor = document.getElementById('imageAuthor');
	
	canvasLoadingOverlay = document.getElementById('canvasLoadingOverlay');
	
	if (canvasLoadingOverlay) hideCanvasLoading();

	const params = new URLSearchParams(window.location.search);
	const searchQuery = params.get('search');
	if (searchQuery) {
		const unsplashSearch = document.getElementById('unsplash-search');
		const resultContainer = document.getElementById('unsplash-selector');

		if (unsplashSearch) {
			unsplashSearch.value = searchQuery;
			searchUnsplashImages(searchQuery);
			searchUnsplashImages(searchQuery).then(() => {
				unsplashSearch.value = '';
				resultContainer.innerHTML = '';
				window.history.replaceState({}, '', window.location.pathname);
			});
		}
	}
	
	const unsplashBtn = document.getElementById('unsplash-img-btn');
	const unsplashSearch = document.getElementById('unsplash-search');

	if (unsplashBtn) {
		unsplashBtn.addEventListener('click', showUnsplashPicker);
	}

	if (unsplashSearch) {
		let debounceTimeout;
		unsplashSearch.addEventListener('input', () => {
			clearTimeout(debounceTimeout);
			debounceTimeout = setTimeout(() => {
				const query = unsplashSearch.value.trim();
				if (query) {
				const newUrl = new URL(window.location.href);
				newUrl.searchParams.set('search', query);
				window.history.pushState({}, '', newUrl);

				searchUnsplashImages(query);
				} else {
				const resultContainer = document.getElementById('unsplash-selector');
				if (resultContainer) {
					resultContainer.innerHTML = '';
				}
				const newUrl = new URL(window.location.href);
				newUrl.searchParams.delete('search');
				window.history.pushState({}, '', newUrl);
				}
			}, 300);
		});
	}

	['username', 'title', 'subtitle', 'footer', 'themeSelect', 'useShadow', 'useBlur', 'useGrain', 'grainStrength', 'useFreefyLogo', 'freefyLogoColor'].forEach(id => {
		const input = document.getElementById(id);
		if (input) {
			input.addEventListener('input', render);
			// Also listen for 'change' event for checkboxes and selects
			if (input.type === 'checkbox' || input.tagName === 'SELECT') {
				input.addEventListener('change', render);
			}
		}
    });

	const buttons = document.querySelectorAll('.theme-button');
    buttons.forEach(btn => {
		btn.style.border = `3px dashed ${DASHED_COLOR}`;
		btn.addEventListener('click', () => {
			buttons.forEach(b => b.style.border = `3px dashed ${DASHED_COLOR}`);
			btn.style.border = '3px dashed #4285F4';
		});
    });

	grainCheckbox = document.getElementById("useGrain");
	grainStrengthContainer = document.getElementById("grainStrengthContainer");
	grainStrengthSlider = document.getElementById("grainStrength");
	grainStrengthValue = document.getElementById("grainStrengthValue");

	if (grainCheckbox && grainStrengthContainer) {
		grainCheckbox.addEventListener("change", () => {
			grainStrengthContainer.style.display = grainCheckbox.checked ? "block" : "none";
		});
		grainStrengthContainer.style.display = grainCheckbox.checked ? "block" : "none";
	}

	if (grainStrengthSlider) {
		grainStrengthSlider.addEventListener('input', updateGrainSliderUI);
		updateGrainSliderUI();
	}

	// Freefy logo color selector visibility
	const freefyLogoToggle = document.getElementById('useFreefyLogo');
	const freefyLogoColorContainer = document.getElementById('freefyLogoColorContainer');
	
	function updateLogoColorVisibility() {
		if (freefyLogoColorContainer && freefyLogoToggle) {
			if (freefyLogoToggle.checked) {
				freefyLogoColorContainer.style.display = 'block';
			} else {
				freefyLogoColorContainer.style.display = 'none';
			}
		}
	}

	if (freefyLogoToggle) {
		freefyLogoToggle.addEventListener('change', updateLogoColorVisibility);
		updateLogoColorVisibility(); // Initialize
	}
});

function updateGrainSliderUI() {
	const grainStrengthSlider = document.getElementById("grainStrength");
	const grainStrengthValue = document.getElementById("grainStrengthValue");

	if (!grainStrengthSlider) return;

	const min = Number(grainStrengthSlider.min) || 0;
	const max = Number(grainStrengthSlider.max) || 100;
	const value = Number(grainStrengthSlider.value);
	const percent = ((value - min) / (max - min)) * 100;

	grainStrengthSlider.style.setProperty("--value", percent);
	if (grainStrengthValue) {
		grainStrengthValue.textContent = value;
	}
}

let colorNameMap = {};
let defaultImagePaths = [];

async function loadData() {
	try {
		const colorsResponse = await fetch('/assets/json/default-colors.json');
		colorNameMap = await colorsResponse.json();

		const imagesResponse = await fetch('/assets/json/default-images.json');
		defaultImagePaths = await imagesResponse.json();

		loadDefaultColors();
		loadDefaultImages();
	} catch (error) {
		console.error('❌ loadData error:', error);
	}
}
  
function toggleDefaultImages() {
	if (imagePicker.classList.contains('hidden')) {
		if (imagePicker.children.length === 0) {
			defaultImagePaths.forEach((path) => {
				const col = document.createElement('div');
				col.className = 'col';
		
				const img = document.createElement('img');
				img.src = path;
				img.className = 'img-thumbnail rounded';
				img.style.cursor = 'pointer';
				img.style.aspectRatio = '1 / 1';
				img.style.objectFit = 'cover';
				img.onclick = () => selectDefaultImage(path);
		
				col.appendChild(img);
				imagePicker.appendChild(col);
			});
		}
		imagePicker.classList.remove('hidden');
	}
	else {
		imagePicker.classList.add('hidden');
	}
}

function loadDefaultImages() {
	imagePicker.innerHTML = '';

	imagePicker.classList.add('grid', 'gap-4');
	imagePicker.style.gridTemplateColumns = 'repeat(auto-fit, minmax(112px, 1fr))';
	// imagePicker.classList.add('grid', 'grid-cols-7', 'gap-4');

	defaultImagePaths.forEach(({ preview, original }) => {
		const imgWrapper = document.createElement('div');
		imgWrapper.className = 'img-wrapper rounded-2xl w-full p-3';
		imgWrapper.style.border = `3px dashed ${DASHED_COLOR}`;
		
		const img = document.createElement('img');
		img.src = preview;
		img.loading = 'lazy';
		img.className = 'rounded-xl w-full aspect-square object-cover hover:scale-105 transition-transform cursor-pointer';
		img.onclick = () => selectDefaultImage(original);

		imgWrapper.appendChild(img);
		imagePicker.appendChild(imgWrapper);
	});

	requestAnimationFrame(() => {
		const imagePickerWidth = window.getComputedStyle(imagePicker).width;
		colorSelector.style.width = imagePickerWidth;
		colorPicker.style.width = imagePickerWidth;
		filePicker.style.width = imagePickerWidth;
		filePicker.style.border = `3px dashed ${DASHED_COLOR}`;
	});
}

function loadDefaultColors() {
	const defaultColorOptions = Object.keys(colorNameMap);
	if (!colorSelector) return;

	colorSelector.innerHTML = '';
	colorSelector.classList.add('grid', 'gap-4');
	colorSelector.style.gridTemplateColumns = 'repeat(auto-fit, minmax(112px, 1fr))';
	// colorSelector.classList.add('grid', 'grid-cols-7', 'gap-4');

	defaultColorOptions.forEach((color) => {
		const colorWrapper = document.createElement('div');
		colorWrapper.className = 'color-wrapper rounded-2xl w-full p-3';
		colorWrapper.style.border = `3px dashed ${DASHED_COLOR}`;
		
		const colorBox = document.createElement('div');
		colorBox.className = 'rounded-xl w-full aspect-square object-cover hover:scale-105 transition-transform cursor-pointer';
		colorBox.style.backgroundColor = color;
		colorBox.onclick = () => selectColorBackground(color);

		colorWrapper.appendChild(colorBox);
		colorSelector.appendChild(colorWrapper);
	});

	requestAnimationFrame(() => {
		const imagePickerWidth = window.getComputedStyle(imagePicker).width;
		colorSelector.style.width = imagePickerWidth;
		colorPicker.style.width = imagePickerWidth;
		filePicker.style.width = imagePickerWidth;
		filePicker.style.border = `3px dashed ${DASHED_COLOR}`;
	});
}

window.onload = () => {
	loadData();
	loadFreefyLogos(); // Load the Freefy logos

	const defaultBtn = document.getElementById('default-img-btn');
	if (defaultBtn) {
		defaultBtn.click();
	}

	if (container && !uploadedImage && !selectedBackgroundColor) {
		fallback.classList.remove('hidden');
		container.style.backgroundImage = '';
		container.style.backgroundColor = 'transparent';
	}
	if (container && !container.parentElement.classList.contains('thumbnail-wrapper')) {
		const wrapper = document.createElement('div');
		wrapper.className = 'thumbnail-wrapper rounded-2xl w-30 h-30 p-3';
		wrapper.style.border = `3px dashed ${DASHED_COLOR}`;
		container.parentElement.insertBefore(wrapper, container);
		wrapper.appendChild(container);
	}
};

function selectDefaultImage(path) {
	const img = new Image();
	const canvas = document.getElementById('cover');
	showCanvasLoading();
	if (canvas) canvas.style.filter = 'blur(12px)';
	img.crossOrigin = 'Anonymous';

	img.onload = function () {
		uploadedImage = img;

		const avgRgb = getAverageColor(uploadedImage);
		const avgHex = getRGBtoHex(avgRgb);
		const textColor = getTextColorForBackground(avgHex);

		selectedTextColor = textColor;
		selectedBackgroundColor = null;

		render();
		hideCanvasLoading();
		if (canvas) canvas.style.filter = '';

		updateImageMetadata({
			src: uploadedImage.src || path,
			title: 'Untitled',
			source: '(Selected Images)',
			author: 'Unknown'
		});

		const fileInput = document.getElementById('imageUpload');
		if (fileInput) fileInput.value = '';
	};
	img.src = path;
}

function selectColorBackground(color) {
	selectedBackgroundColor = color;
	uploadedImage = null;
	render();

	if (container) {
		container.style.backgroundImage = '';
		container.style.backgroundColor = color;
	}
	if (imageTitle) {
		const colorName = colorNameMap[color] || color;
		imageTitle.innerText = colorName;
	}
	if (imageSource) imageSource.innerText = '(Selected Color)';
	if (imageAuthor) imageAuthor.innerText = color;
}

function toggleVisibility(config) {
	Object.entries(config).forEach(([id, show]) => {
		const el = document.getElementById(id);
		if (!el) return;
		el.classList.toggle('hidden', !show);
		el.classList.toggle('block', show);
	});
}

function showImagePicker() {
	toggleDefaultImages();
	toggleVisibility({
		'image-selector': true,
		'color-selector': false,
		'file-selector': false,
		'color-picker': false,
		'unsplash-searchBar': false,
		'unsplash-selector': false
	});
}

function showColorPicker() {
	loadDefaultColors();
	toggleVisibility({
		'image-selector': false,
		'color-selector': true,
		'file-selector': false,
		'color-picker': true,
		'unsplash-searchBar': false,
		'unsplash-selector': false
	});
}

function showUnsplashPicker() {
	toggleVisibility({
		'image-selector': false,
		'color-selector': false,
		'file-selector': false,
		'color-picker': false,
		'unsplash-searchBar': true,
		'unsplash-selector': true
	});
}

function showFilePicker() {
	toggleVisibility({
		'image-selector': false,
		'color-selector': false,
		'file-selector': true,
		'color-picker': false,
		'unsplash-searchBar': false,
		'unsplash-selector': false
	});
}


