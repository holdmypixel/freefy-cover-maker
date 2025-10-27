async function searchUnsplashImages(query) {
	if (!query) return;
  
	try {
		const response = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}`);
		const data = await response.json();
	
		const unsplashSelector = document.getElementById("unsplash-selector");
		unsplashSelector.innerHTML = "";
		unsplashSelector.classList.add('grid', 'gap-4');
		unsplashSelector.style.gridTemplateColumns = 'repeat(auto-fit, minmax(112px, 1fr))';
        // unsplashSelector.classList.add('grid', 'grid-cols-7', 'gap-4');
	
		data.results.forEach(({ urls, description, alt_description, user }) => {
			const imgWrapper = document.createElement('div');
			imgWrapper.className = 'unsplash-wrapper aspect-square rounded-2xl w-full p-3';
			imgWrapper.style.border = `3px dashed ${DASHED_COLOR}`;
	
			const img = document.createElement('img');
			img.src = urls.small;
			img.description = description || '';
			img.alt = alt_description || '';
			img.loading = 'lazy';
			img.className = 'rounded-xl w-full aspect-square object-cover hover:scale-105 transition-transform cursor-pointer';
            img.onclick = () => selectUnsplashImage(img.src, urls.full, alt_description || 'Untitled', user.name || 'Unknown');
	
			imgWrapper.appendChild(img);
			unsplashSelector.appendChild(imgWrapper);
		});

        requestAnimationFrame(() => {
            const imagePickerWidth = window.getComputedStyle(imagePicker).width;
            unsplashSelector.style.width = imagePickerWidth;
        });
	} catch (error) {
		console.error('❌ Unsplash API Error:', error);
	}
}

function selectUnsplashImage(path, fullPath, title = 'Untitled', author = 'Unknown') {
	const img = new Image();
	const canvas = document.getElementById('cover');
	showCanvasLoading();
	if (canvas) canvas.style.filter = 'blur(12px)';
	img.crossOrigin = 'Anonymous';

	img.onload = function () {
		uploadedImage = img;

		const avgRgb = getAverageColor(uploadedImage);
		const avgHex = getRGBtoHex(avgRgb);
		selectedTextColor = getTextColorForBackground(avgHex);

		render();
		hideCanvasLoading();
		if (canvas) canvas.style.filter = '';

		updateImageMetadata({
            src: fullPath || path,
            title: title,
            source: '(Unsplash)',
            author: author
        });
	};
	img.src = fullPath;
}
