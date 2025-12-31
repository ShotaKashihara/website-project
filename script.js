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
const downloadButton = document.getElementById('downloadButton');
const resetButton = document.getElementById('resetButton');
const resizedSize = document.getElementById('resizedSize');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const errorClose = document.getElementById('errorClose');

let currentImage = null;
let ctx = resizedCanvas.getContext('2d');
let errorTimeout = null; // エラーメッセージの自動クローズ用タイマー

// mmをピクセルに変換（DPIに基づく）
function mmToPixels(mm, dpi) {
    // 1インチ = 25.4mm
    // ピクセル = (mm / 25.4) * dpi
    return Math.round((mm / 25.4) * dpi);
}

// 余白部分の装飾パターンを作成
function createMarginPattern(ctx, dpi) {
    const patternSize = Math.round(20 * (dpi / 300)); // DPIに応じてパターンサイズを調整
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
    const patternCtx = patternCanvas.getContext('2d');

    // 薄いグレーの背景
    patternCtx.fillStyle = '#f5f5f5';
    patternCtx.fillRect(0, 0, patternSize, patternSize);

    // 斜線パターンを描画
    patternCtx.strokeStyle = '#e0e0e0';
    patternCtx.lineWidth = 1;
    patternCtx.beginPath();
    // 左上から右下への斜線
    patternCtx.moveTo(0, patternSize);
    patternCtx.lineTo(patternSize, 0);
    patternCtx.stroke();
    // 右上から左下への斜線
    patternCtx.beginPath();
    patternCtx.moveTo(patternSize, patternSize);
    patternCtx.lineTo(0, 0);
    patternCtx.stroke();

    // パターンを作成して返す
    return ctx.createPattern(patternCanvas, 'repeat');
}

// サイズとDPIは固定（50mm x 75mm、300 DPI）のため、変更イベントは不要

// 画像をリサイズ
function resizeImage() {
    if (!currentImage) return;

    // 固定DPI: 300 DPI
    const dpi = 300;
    // シールサイズ: 50mm x 75mm（5cm x 7.5cm）
    const stickerWidthMm = 50;
    const stickerHeightMm = 75;
    // 印刷物サイズ: L判 89mm x 127mm
    const printWidthMm = 89;
    const printHeightMm = 127;

    // 印刷物全体のサイズ（L判）
    const printWidthPx = mmToPixels(printWidthMm, dpi);
    const printHeightPx = mmToPixels(printHeightMm, dpi);
    // シール部分のサイズ
    const stickerWidthPx = mmToPixels(stickerWidthMm, dpi);
    const stickerHeightPx = mmToPixels(stickerHeightMm, dpi);

    // キャンバスのサイズをL判に設定
    resizedCanvas.width = printWidthPx;
    resizedCanvas.height = printHeightPx;

    // 余白部分に装飾パターンを描画
    const marginPattern = createMarginPattern(ctx, dpi);
    ctx.fillStyle = marginPattern;
    ctx.fillRect(0, 0, printWidthPx, printHeightPx);

    // シール画像を中央に配置するためのオフセットを計算
    const offsetX = (printWidthPx - stickerWidthPx) / 2;
    const offsetY = (printHeightPx - stickerHeightPx) / 2;

    // 角丸の半径（R=2mm）
    const cornerRadiusMm = 2;
    const cornerRadiusPx = mmToPixels(cornerRadiusMm, dpi);

    // シール部分は白背景で上書き（装飾パターンの上に白いシール領域を描画）
    // 角丸のパスを作成
    ctx.beginPath();
    ctx.moveTo(offsetX + cornerRadiusPx, offsetY);
    ctx.lineTo(offsetX + stickerWidthPx - cornerRadiusPx, offsetY);
    ctx.arcTo(offsetX + stickerWidthPx, offsetY, offsetX + stickerWidthPx, offsetY + cornerRadiusPx, cornerRadiusPx);
    ctx.lineTo(offsetX + stickerWidthPx, offsetY + stickerHeightPx - cornerRadiusPx);
    ctx.arcTo(offsetX + stickerWidthPx, offsetY + stickerHeightPx, offsetX + stickerWidthPx - cornerRadiusPx, offsetY + stickerHeightPx, cornerRadiusPx);
    ctx.lineTo(offsetX + cornerRadiusPx, offsetY + stickerHeightPx);
    ctx.arcTo(offsetX, offsetY + stickerHeightPx, offsetX, offsetY + stickerHeightPx - cornerRadiusPx, cornerRadiusPx);
    ctx.lineTo(offsetX, offsetY + cornerRadiusPx);
    ctx.arcTo(offsetX, offsetY, offsetX + cornerRadiusPx, offsetY, cornerRadiusPx);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // クリッピングパスを設定（角丸のシール領域）
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(offsetX + cornerRadiusPx, offsetY);
    ctx.lineTo(offsetX + stickerWidthPx - cornerRadiusPx, offsetY);
    ctx.arcTo(offsetX + stickerWidthPx, offsetY, offsetX + stickerWidthPx, offsetY + cornerRadiusPx, cornerRadiusPx);
    ctx.lineTo(offsetX + stickerWidthPx, offsetY + stickerHeightPx - cornerRadiusPx);
    ctx.arcTo(offsetX + stickerWidthPx, offsetY + stickerHeightPx, offsetX + stickerWidthPx - cornerRadiusPx, offsetY + stickerHeightPx, cornerRadiusPx);
    ctx.lineTo(offsetX + cornerRadiusPx, offsetY + stickerHeightPx);
    ctx.arcTo(offsetX, offsetY + stickerHeightPx, offsetX, offsetY + stickerHeightPx - cornerRadiusPx, cornerRadiusPx);
    ctx.lineTo(offsetX, offsetY + cornerRadiusPx);
    ctx.arcTo(offsetX, offsetY, offsetX + cornerRadiusPx, offsetY, cornerRadiusPx);
    ctx.closePath();
    ctx.clip();

    // 画像をシールサイズいっぱいに拡大し、はみ出した部分を中央からクロップ（auto fill）
    const imgAspect = currentImage.width / currentImage.height;
    const stickerAspect = stickerWidthPx / stickerHeightPx;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = currentImage.width;
    let sourceHeight = currentImage.height;

    // 画像をシールサイズいっぱいに拡大するために必要なクロップ領域を計算（auto fill）
    if (imgAspect > stickerAspect) {
        // 画像が横長の場合、高さをシールの高さに合わせて拡大
        // 拡大率 = stickerHeightPx / currentImage.height
        // 必要な元画像の幅 = stickerWidthPx / 拡大率 = stickerWidthPx * currentImage.height / stickerHeightPx
        sourceHeight = currentImage.height; // 高さは全体を使用
        sourceWidth = (stickerWidthPx * currentImage.height) / stickerHeightPx;
        sourceX = (currentImage.width - sourceWidth) / 2; // 中央からクロップ
        sourceY = 0;
    } else {
        // 画像が縦長の場合、幅をシールの幅に合わせて拡大
        // 拡大率 = stickerWidthPx / currentImage.width
        // 必要な元画像の高さ = stickerHeightPx / 拡大率 = stickerHeightPx * currentImage.width / stickerWidthPx
        sourceWidth = currentImage.width; // 幅は全体を使用
        sourceHeight = (stickerHeightPx * currentImage.width) / stickerWidthPx;
        sourceX = 0;
        sourceY = (currentImage.height - sourceHeight) / 2; // 中央からクロップ
    }

    // シール部分に画像を描画（拡大して中央からクロップ、シールサイズいっぱいに表示、角丸でクリップ）
    ctx.drawImage(
        currentImage,
        sourceX, sourceY, sourceWidth, sourceHeight, // ソース画像のクロップ領域
        offsetX, offsetY, stickerWidthPx, stickerHeightPx // 描画先の領域（シールサイズいっぱい）
    );

    // クリッピングパスを解除
    ctx.restore();

    // 左中央に矩形をくり抜く（右上頂点と右下頂点にR=9mmの角丸）
    // 矩形の位置：左上頂点がシールの左上頂点から下に2cm、左下頂点が55mm、幅9mm
    const cutoutTopMm = 20; // 2cm = 20mm
    const cutoutBottomMm = 55; // 55mm
    const cutoutWidthMm = 9; // 9mm
    const cutoutHeightMm = cutoutBottomMm - cutoutTopMm; // 55mm - 20mm = 35mm
    const cutoutCornerRadiusMm = 9; // R=9mm
    const cutoutCornerRadiusPx = mmToPixels(cutoutCornerRadiusMm, dpi);

    const cutoutTopPx = mmToPixels(cutoutTopMm, dpi);
    const cutoutWidthPx = mmToPixels(cutoutWidthMm, dpi);
    const cutoutHeightPx = mmToPixels(cutoutHeightMm, dpi);
    const cutoutLeftPx = offsetX;
    const cutoutTopPositionPx = offsetY + cutoutTopPx;
    const cutoutRightPx = cutoutLeftPx + cutoutWidthPx;
    const cutoutBottomPositionPx = cutoutTopPositionPx + cutoutHeightPx;

    // くり抜き処理：destination-outを使用（右上頂点と右下頂点に角丸）
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    // 左上から開始
    ctx.moveTo(cutoutLeftPx, cutoutTopPositionPx);
    // 右上まで直線（角丸の開始位置まで）
    ctx.lineTo(cutoutRightPx - cutoutCornerRadiusPx, cutoutTopPositionPx);
    // 右上頂点の角丸
    ctx.arcTo(cutoutRightPx, cutoutTopPositionPx, cutoutRightPx, cutoutTopPositionPx + cutoutCornerRadiusPx, cutoutCornerRadiusPx);
    // 右辺（右下角丸の開始位置まで）
    ctx.lineTo(cutoutRightPx, cutoutBottomPositionPx - cutoutCornerRadiusPx);
    // 右下頂点の角丸
    ctx.arcTo(cutoutRightPx, cutoutBottomPositionPx, cutoutRightPx - cutoutCornerRadiusPx, cutoutBottomPositionPx, cutoutCornerRadiusPx);
    // 下辺
    ctx.lineTo(cutoutLeftPx, cutoutBottomPositionPx);
    // 左辺
    ctx.lineTo(cutoutLeftPx, cutoutTopPositionPx);
    ctx.closePath();
    ctx.fillStyle = '#000000'; // 色は何でも良い（くり抜き用）
    ctx.fill();

    // 合成モードを元に戻す
    ctx.globalCompositeOperation = 'source-over';

    // くり抜き部分に余白の装飾パターンを描画（同じ角丸パスを使用）
    const cutoutPattern = createMarginPattern(ctx, dpi);
    ctx.beginPath();
    ctx.moveTo(cutoutLeftPx, cutoutTopPositionPx);
    ctx.lineTo(cutoutRightPx - cutoutCornerRadiusPx, cutoutTopPositionPx);
    ctx.arcTo(cutoutRightPx, cutoutTopPositionPx, cutoutRightPx, cutoutTopPositionPx + cutoutCornerRadiusPx, cutoutCornerRadiusPx);
    ctx.lineTo(cutoutRightPx, cutoutBottomPositionPx - cutoutCornerRadiusPx);
    ctx.arcTo(cutoutRightPx, cutoutBottomPositionPx, cutoutRightPx - cutoutCornerRadiusPx, cutoutBottomPositionPx, cutoutCornerRadiusPx);
    ctx.lineTo(cutoutLeftPx, cutoutBottomPositionPx);
    ctx.lineTo(cutoutLeftPx, cutoutTopPositionPx);
    ctx.closePath();
    ctx.fillStyle = cutoutPattern;
    ctx.fill();


    // サイズ情報を更新
    resizedSize.textContent = `L判: ${printWidthMm}mm × ${printHeightMm}mm (${printWidthPx}px × ${printHeightPx}px @ ${dpi}DPI) / シール: ${stickerWidthMm}mm × ${stickerHeightMm}mm`;
}

// ファイル選択
uploadButton.addEventListener('click', (e) => {
    e.stopPropagation(); // uploadAreaへのイベントバブリングを防止
    fileInput.click();
});

uploadArea.addEventListener('click', (e) => {
    // uploadButtonがクリックされた場合は処理しない
    if (e.target === uploadButton || uploadButton.contains(e.target)) {
        return;
    }
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
function showError(message, autoClose = true) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';

    // 既存のタイマーをクリア
    if (errorTimeout) {
        clearTimeout(errorTimeout);
        errorTimeout = null;
    }

    // autoCloseがtrueの場合のみ、5秒後に自動で閉じる
    if (autoClose) {
        errorTimeout = setTimeout(() => {
            hideError();
        }, 5000);
    }
}

// エラーメッセージを非表示
function hideError() {
    // タイマーをクリア
    if (errorTimeout) {
        clearTimeout(errorTimeout);
        errorTimeout = null;
    }
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
                    showError('この画像にはQRコードが検出されませんでした。サポートポケモンチケットの画像にはQRコードが必要です。正しい画像をアップロードしてください。', false);
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
        a.download = `support-pokemon-ticket-L-size-300dpi.png`;
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
