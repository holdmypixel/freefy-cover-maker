const hueCanvas = document.getElementById('hueCanvas');
const hueCtx = hueCanvas.getContext('2d');

const svCanvas = document.getElementById('svCanvas');
const svCtx = svCanvas.getContext('2d');

// const colorPreview = document.getElementById('colorPreview');
const hexInput = document.getElementById('hexInput');
const copyHexBtn = document.getElementById('copyHexBtn');

let selectedHue = 0;
let selectedColor = '#000000';

function drawHue() {
	const width = hueCanvas.width;
	const height = hueCanvas.height;
	const hueGradient = hueCtx.createLinearGradient(0, 0, 0, height);
	const hues = [
		'rgb(255, 0, 0)', 'rgb(255, 255, 0)', 'rgb(0, 255, 0)',
		'rgb(0, 255, 255)', 'rgb(0, 0, 255)', 'rgb(255, 0, 255)', 'rgb(255, 0, 0)'
	];

	const stops = hues.length - 1;
	hues.forEach((color, i) => {
		hueGradient.addColorStop(i / stops, color);
	});

	hueCtx.fillStyle = hueGradient;
	hueCtx.fillRect(0, 0, width, height);
}

function drawSV(hue) {
	const width = svCanvas.width;
	const height = svCanvas.height;

	const satGradient = svCtx.createLinearGradient(0, 0, width, 0);
	satGradient.addColorStop(0, 'white');
	satGradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
	svCtx.fillStyle = satGradient;
	svCtx.fillRect(0, 0, width, height);

	const valGradient = svCtx.createLinearGradient(0, 0, 0, height);
	valGradient.addColorStop(0, 'rgba(0,0,0,0)');
	valGradient.addColorStop(1, 'black');
	svCtx.fillStyle = valGradient;
	svCtx.fillRect(0, 0, width, height);
}

function rgbToHex(r, g, b) {
	return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function updateSelectedColor(hex) {
	selectedColor = hex;
	selectColorBackground(hex);
//   colorPreview.style.backgroundColor = hex;
	// hexInput.value = hex;
	hexInput.textContent = hex;
	hexInput.style.backgroundColor = hex;
}

function attachDragListener(canvas, callback) {
	let isDragging = false;

	canvas.addEventListener('mousedown', (e) => {
		isDragging = true;
		callback(e);
	});

	canvas.addEventListener('mousemove', (e) => {
		if (isDragging) callback(e);
	});

	window.addEventListener('mouseup', () => {
		isDragging = false;
	});
}

attachDragListener(hueCanvas, (e) => {
	const rect = hueCanvas.getBoundingClientRect();
	let y = e.clientY - rect.top;
	y = Math.min(Math.max(y, 0), hueCanvas.height - 1);

	selectedHue = (y / hueCanvas.height) * 360;
	drawSV(selectedHue);
});

attachDragListener(svCanvas, (e) => {
	const rect = svCanvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	x = Math.min(Math.max(x, 0), svCanvas.width - 1);
	y = Math.min(Math.max(y, 0), svCanvas.height - 1);

	const imageData = svCtx.getImageData(x, y, 1, 1).data;
	const hex = rgbToHex(imageData[0], imageData[1], imageData[2]);
	updateSelectedColor(hex);
});

copyHexBtn.addEventListener('click', () => {
	navigator.clipboard.writeText(hexInput.textContent).then(() => {
		const icon = copyHexBtn.querySelector('i');
		icon.classList.remove('fa-clipboard');
		icon.classList.add('fa-check');
	});
});

const svPointer = document.getElementById('svPointer');

const rect = svCanvas.getBoundingClientRect();

function updateSVPointer(canvasX, canvasY) {
	const svContainer = document.getElementById('svContainer');
	const rect = svContainer.getBoundingClientRect();

	const svCanvas = document.getElementById('svCanvas');
	const scaleX = rect.width / svCanvas.width;
	const scaleY = rect.height / svCanvas.height;

	const cssX = canvasX * scaleX;
	const cssY = canvasY * scaleY;

	const svPointer = document.getElementById('svPointer');
	svPointer.style.left = `${cssX}px`;
	svPointer.style.top = `${cssY}px`;
	svPointer.style.display = 'block';
}

// function updateSVPointer(cssX, cssY) {
// 	const svPointer = document.getElementById('svPointer');
// 	svPointer.style.left = `${cssX}px`;
// 	svPointer.style.top = `${cssY}px`;
// 	svPointer.style.display = 'block';
//   }
  

svCanvas.addEventListener('click', (e) => {
	const rect = svCanvas.getBoundingClientRect();
	const scaleX = svCanvas.width / rect.width;
	const scaleY = svCanvas.height / rect.height;

	const x = (e.clientX - rect.left) * scaleX;
	const y = (e.clientY - rect.top) * scaleY;

	updateSVPointer(x, y);

	const pixel = svCtx.getImageData(x, y, 1, 1).data;
	const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
	updateSelectedColor(hex);
});


// let isDraggingSVPointer = false;

// svPointer.addEventListener('mousedown', (e) => {
//   e.preventDefault();
//   isDraggingSVPointer = true;
// });

// window.addEventListener('mouseup', () => {
//   isDraggingSVPointer = false;
// });

// svCanvas.addEventListener('click', (e) => {
// 	const rect = svCanvas.getBoundingClientRect();
// 	const scaleX = svCanvas.width / rect.width;
// 	const scaleY = svCanvas.height / rect.height;
  
// 	const x = (e.clientX - rect.left) * scaleX;
// 	const y = (e.clientY - rect.top) * scaleY;
  
// 	updateSVPointer(x, y);
  
// 	const pixel = svCtx.getImageData(x, y, 1, 1).data;
// 	const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
// 	updateSelectedColor(hex);
// });

// window.addEventListener('mousemove', (e) => {
// 	if (!isDraggingSVPointer) return;
  
// 	const containerRect = svContainer.getBoundingClientRect();
  
// 	let x = e.clientX - containerRect.left;
// 	let y = e.clientY - containerRect.top;
  
// 	x = Math.min(Math.max(x, 0), containerRect.width);
// 	y = Math.min(Math.max(y, 0), containerRect.height);
  
// 	updateSVPointer(x, y);
  
// 	const scaleX = svCanvas.width / containerRect.width;
// 	const scaleY = svCanvas.height / containerRect.height;
  
// 	const canvasX = x * scaleX;
// 	const canvasY = y * scaleY;
  
// 	const pixel = svCtx.getImageData(canvasX, canvasY, 1, 1).data;
// 	const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
  
// 	updateSelectedColor(hex);
//   });

	

// 초기 그리기 실행
drawHue();
drawSV(selectedHue);
updateSelectedColor(selectedColor);