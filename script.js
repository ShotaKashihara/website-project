// モバイルメニューのトグル
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // モバイルメニューを閉じる
            navMenu.classList.remove('active');
        }
    });
});

// 画像アップロード機能
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const previewContainer = document.getElementById('previewContainer');
const originalPreview = document.getElementById('originalPreview');
const resizedCanvas = document.getElementById('resizedCanvas');
const controls = document.getElementById('controls');
const sizeSelect = document.getElementById('sizeSelect');
const customSizeGroup = document.getElementById('customSizeGroup');
const customWidth = document.getElementById('customWidth');
const customHeight = document.getElementById('customHeight');
const dpiSelect = document.getElementById('dpiSelect');
const downloadButton = document.getElementById('downloadButton');
const resetButton = document.getElementById('resetButton');
const resizedSize = document.getElementById('resizedSize');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const errorClose = document.getElementById('errorClose');

let currentImage = null;
let ctx = resizedCanvas.getContext('2d');

// mmをピクセルに変換（DPIに基づく）
function mmToPixels(mm, dpi) {
    // 1インチ = 25.4mm
    // ピクセル = (mm / 25.4) * dpi
    return Math.round((mm / 25.4) * dpi);
}

// サイズ選択の変更
sizeSelect.addEventListener('change', () => {
    if (sizeSelect.value === 'custom') {
        customSizeGroup.style.display = 'flex';
    } else {
        customSizeGroup.style.display = 'none';
    }
    if (currentImage) {
        resizeImage();
    }
});

// カスタムサイズの変更
customWidth.addEventListener('input', () => {
    if (currentImage && sizeSelect.value === 'custom') {
        resizeImage();
    }
});

customHeight.addEventListener('input', () => {
    if (currentImage && sizeSelect.value === 'custom') {
        resizeImage();
    }
});

// DPIの変更
dpiSelect.addEventListener('change', () => {
    if (currentImage) {
        resizeImage();
    }
});

// 画像をリサイズ
function resizeImage() {
    if (!currentImage) return;

    const dpi = parseInt(dpiSelect.value);
    let widthMm, heightMm;

    if (sizeSelect.value === 'custom') {
        widthMm = parseInt(customWidth.value) || 50;
        heightMm = parseInt(customHeight.value) || 50;
    } else {
        const [w, h] = sizeSelect.value.split('x').map(Number);
        widthMm = w;
        heightMm = h;
    }

    const widthPx = mmToPixels(widthMm, dpi);
    const heightPx = mmToPixels(heightMm, dpi);

    // キャンバスのサイズを設定
    resizedCanvas.width = widthPx;
    resizedCanvas.height = heightPx;

    // 画像をリサイズして描画（アスペクト比を保持）
    const imgAspect = currentImage.width / currentImage.height;
    const canvasAspect = widthPx / heightPx;

    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

    if (imgAspect > canvasAspect) {
        // 画像が横長の場合
        drawHeight = heightPx;
        drawWidth = heightPx * imgAspect;
        offsetX = (widthPx - drawWidth) / 2;
    } else {
        // 画像が縦長の場合
        drawWidth = widthPx;
        drawHeight = widthPx / imgAspect;
        offsetY = (heightPx - drawHeight) / 2;
    }

    // 背景を白に設定
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, widthPx, heightPx);

    // 画像を描画
    ctx.drawImage(currentImage, offsetX, offsetY, drawWidth, drawHeight);

    // サイズ情報を更新
    resizedSize.textContent = `${widthMm}mm × ${heightMm}mm (${widthPx}px × ${heightPx}px @ ${dpi}DPI)`;
}

// ファイル選択
uploadButton.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// ドラッグ&ドロップ
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// エラーメッセージを表示
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    // 3秒後に自動で閉じる
    setTimeout(() => {
        hideError();
    }, 5000);
}

// エラーメッセージを非表示
function hideError() {
    errorMessage.style.display = 'none';
}

// エラーを閉じるボタン
errorClose.addEventListener('click', hideError);

// QRコードを検出
function detectQRCode(image) {
    return new Promise((resolve) => {
        // 一時的なCanvasを作成して画像を描画
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Canvasのサイズを画像に合わせる（大きすぎる場合はリサイズ）
        const maxSize = 1000;
        let width = image.width;
        let height = image.height;

        if (width > maxSize || height > maxSize) {
            const scale = Math.min(maxSize / width, maxSize / height);
            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
        }

        tempCanvas.width = width;
        tempCanvas.height = height;

        // 画像を描画
        tempCtx.drawImage(image, 0, 0, width, height);

        // ImageDataを取得
        const imageData = tempCtx.getImageData(0, 0, width, height);

        // jsQRでQRコードを検出
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        resolve(code !== null);
    });
}

// ファイル処理
async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showError('画像ファイルを選択してください。');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
            // QRコードを検出
            hideError(); // 前のエラーをクリア

            try {
                const hasQRCode = await detectQRCode(img);

                if (!hasQRCode) {
                    showError('この画像にはQRコードが検出されませんでした。サポートカードの画像にはQRコードが必要です。正しい画像をアップロードしてください。');
                    // ファイル入力をリセット
                    fileInput.value = '';
                    return;
                }

                // QRコードが検出された場合、処理を続行
                currentImage = img;
                originalPreview.src = e.target.result;
                uploadArea.style.display = 'none';
                previewContainer.style.display = 'block';
                controls.style.display = 'block';
                resizeImage();
            } catch (error) {
                console.error('QRコード検出エラー:', error);
                showError('QRコードの検出中にエラーが発生しました。もう一度お試しください。');
                fileInput.value = '';
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ダウンロード機能
downloadButton.addEventListener('click', () => {
    if (!currentImage) return;

    resizedCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `support-card-${sizeSelect.value}-${dpiSelect.value}dpi.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
});

// リセット機能
resetButton.addEventListener('click', () => {
    currentImage = null;
    fileInput.value = '';
    uploadArea.style.display = 'block';
    previewContainer.style.display = 'none';
    controls.style.display = 'none';
    originalPreview.src = '';
    ctx.clearRect(0, 0, resizedCanvas.width, resizedCanvas.height);
});

// スクロール時のアニメーション
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// アニメーション対象の要素を監視
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.step-card, .about-content');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
