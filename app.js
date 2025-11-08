// Get DOM elements
const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const qualitySlider = document.getElementById('quality');
const qualityVal = document.getElementById('qualityVal');
const previews = document.getElementById('previews');
const results = document.getElementById('results');

// Update quality value display
qualitySlider.addEventListener('input', () => {
  qualityVal.textContent = qualitySlider.value;
});

// Click dropzone to open file picker
dropzone.addEventListener('click', () => fileInput.click());

// Drag and drop handlers
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.style.borderColor = '#764ba2';
  dropzone.style.background = '#f0f2ff';
});

dropzone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropzone.style.borderColor = '#667eea';
  dropzone.style.background = '#f8f9ff';
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.style.borderColor = '#667eea';
  dropzone.style.background = '#f8f9ff';
  const files = e.dataTransfer.files;
  handleFiles(files);
});

// File input change handler
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

// Handle selected files
function handleFiles(files) {
  previews.innerHTML = '';
  results.innerHTML = '';
  
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  
  Array.from(files).forEach(file => {
    // Validate file type and size
    if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
      showError(`${file.name} is not a JPEG image`);
      return;
    }
    
    if (file.size > MAX_SIZE) {
      showError(`${file.name} is larger than 10MB`);
      return;
    }
    
    // Read and display preview
    const reader = new FileReader();
    reader.onload = function(e) {
      displayPreview(file, e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

// Display image preview with compress button
function displayPreview(file, dataURL) {
  const previewItem = document.createElement('div');
  previewItem.className = 'preview-item';
  
  previewItem.innerHTML = `
    <img src="${dataURL}" alt="${file.name}">
    <h4>${file.name}</h4>
    <div class="stats">
      <strong>Original:</strong> ${formatFileSize(file.size)}
    </div>
    <button onclick="compressImage('${dataURL.replace(/'/g, "\\'")}',' ${file.name.replace(/'/g, "\\'")}',' ${file.size},' this)">Compress Image</button>
  `;
  
  previews.appendChild(previewItem);
}

// Compress image function
window.compressImage = function(dataURL, fileName, originalSize, buttonEl) {
  // Disable button during compression
  buttonEl.disabled = true;
  buttonEl.textContent = 'Compressing...';
  
  const img = new Image();
  img.onload = function() {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image on canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Get quality value
    const quality = qualitySlider.value / 100;
    
    // Compress image
    const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
    
    // Calculate compressed size (base64 to bytes)
    const compressedSize = Math.round((compressedDataURL.length - 'data:image/jpeg;base64,'.length) * 0.75);
    
    // Display result
    displayResult(compressedDataURL, fileName, originalSize, compressedSize);
    
    // Re-enable button
    buttonEl.disabled = false;
    buttonEl.textContent = 'Compress Image';
  };
  
  img.src = dataURL;
};

// Display compression result
function displayResult(compressedDataURL, fileName, originalSize, compressedSize) {
  const resultItem = document.createElement('div');
  resultItem.className = 'result-item';
  
  const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
  const savingsClass = savings > 0 ? '' : 'error';
  
  resultItem.innerHTML = `
    <img src="${compressedDataURL}" alt="Compressed ${fileName}">
    <h4>✅ ${fileName}</h4>
    <div class="stats">
      <strong>Original:</strong> ${formatFileSize(originalSize)}<br>
      <strong>Compressed:</strong> ${formatFileSize(compressedSize)}<br>
      <strong class="${savingsClass}">Saved:</strong> ${savings}%
    </div>
    <a href="${compressedDataURL}" download="compressed_${fileName}">Download Compressed</a>
  `;
  
  results.appendChild(resultItem);
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error';
  errorDiv.textContent = `❌ ${message}`;
  previews.appendChild(errorDiv);
}

// Format file size helper
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
