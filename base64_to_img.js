const fs = require('fs');
const { Jimp } = require('jimp');

const threshold = 195; // 二值图阈值
const inputImagePath = 'input.jpg'; // 输入图像路径
const outputFilePath = 'output.txt'; // 输出文件路径
const base64FilePath = 'merged.b64'; // Base64字符串文件路径


const generateFormattedStringFromImage = (image, base64String) => {
    let result = '';
    const { width, height } = image.bitmap;
    const base64Length = base64String.length;
    let base64Index = 0; // 追踪Base64字符的索引
    let state = 0; // state = 0 表示上一个像素的颜色是白色， state = 1 表示上一个像素的颜色是黑色

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelColor = image.getPixelColor(x, y);

            // 判断是否为黑色
            const isBlack = pixelColor === 0xff; // 黑色的RGBA值

            // 黑色像素
			if (isBlack) {
                if (state === 0) { // 如果上一个像素是白色
                    result += '"'; // 添加引号
                    state = 1; // 更新状态为黑色

				} else { // 如果上一个像素是黑色，就写入base64字符串的数据
                    result += base64String[base64Index];
                    base64Index++; // 增加索引
                }

			} else { // 白色像素

                if (state === 1) { // 如果上一个像素是黑色
                    result += '"'; // 添加引号
                    state = 0; // 更新状态为白色
                } else {
                    result += ' '; // 添加空格
                }
            }

            // 如果Base64字符串用尽，停止处理
            if (base64Index >= base64Length) {
				result += '"';
                break;
            }
        }

        // 行结束处理
        if (state === 1) { // 如果当前状态是黑色
            result += '"'; // 添加引号
            state = 0; // 重置状态
        }

		// 如果Base64字符串用尽，停止处理
		if (base64Index >= base64Length) {
			break;
		}

		result += '\n'; // 每行结束添加换行符
    }
	
	// 处理剩余的base64字符
    if (base64Index < base64Length) {
        result += '"'; // 结束时添加引号
        result += base64String.slice(base64Index); // 添加剩余的base64字符
        result += '"'; // 结束引号
    }

    return result;
};


// 读取Base64字符串文件
const readBase64FromFile = (filePath) => {
    return fs.readFileSync(filePath, 'utf8'); // 读取文件内容
};

Jimp.read(inputImagePath)
    .then(image => {
        image.greyscale(); // 转换为灰度图
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const gray = this.bitmap.data[idx];
            if (gray > threshold) {
                this.bitmap.data[idx] = 255; // 白色
                this.bitmap.data[idx + 1] = 255;
                this.bitmap.data[idx + 2] = 255;
            } else {
                this.bitmap.data[idx] = 0;   // 黑色
                this.bitmap.data[idx + 1] = 0;
                this.bitmap.data[idx + 2] = 0;
            }
        });

		// 去除前后整行白色的像素
        let startRow = 0;
        let endRow = image.bitmap.height - 1;

        // 从顶部开始查找第一行非白色的行
        for (let y = 0; y < image.bitmap.height; y++) {
            let isWhiteRow = true;
            for (let x = 0; x < image.bitmap.width; x++) {
                const idx = (y * image.bitmap.width + x) * 4;
                if (image.bitmap.data[idx] !== 255 || image.bitmap.data[idx + 1] !== 255 || image.bitmap.data[idx + 2] !== 255) {
                    isWhiteRow = false;
                    break;
                }
            }
            if (!isWhiteRow) {
                startRow = y;
                break;
            }
        }

        // 从底部开始查找第一行非白色的行
        for (let y = image.bitmap.height - 1; y >= 0; y--) {
            let isWhiteRow = true;
            for (let x = 0; x < image.bitmap.width; x++) {
                const idx = (y * image.bitmap.width + x) * 4;
                if (image.bitmap.data[idx] !== 255 || image.bitmap.data[idx + 1] !== 255 || image.bitmap.data[idx + 2] !== 255) {
                    isWhiteRow = false;
                    break;
                }
            }
            if (!isWhiteRow) {
                endRow = y;
                break;
            }
        }

        // 去除左右整列白色的像素
        let startCol = 0;
        let endCol = image.bitmap.width - 1;

        // 从左往右查找第一列非白色的列
        for (let x = 0; x < image.bitmap.width; x++) {
            let isWhiteCol = true;
            for (let y = 0; y < image.bitmap.height; y++) {
                const idx = (y * image.bitmap.width + x) * 4;
                if (image.bitmap.data[idx] !== 255 || image.bitmap.data[idx + 1] !== 255 || image.bitmap.data[idx + 2] !== 255) {
                    isWhiteCol = false;
                    break;
                }
            }
            if (!isWhiteCol) {
                startCol = x;
                break;
            }
        }

        // 从右往左查找第一列非白色的列
        for (let x = image.bitmap.width - 1; x >= 0; x--) {
            let isWhiteCol = true;
            for (let y = 0; y < image.bitmap.height; y++) {
                const idx = (y * image.bitmap.width + x) * 4;
                if (image.bitmap.data[idx] !== 255 || image.bitmap.data[idx + 1] !== 255 || image.bitmap.data[idx + 2] !== 255) {
                    isWhiteCol = false;
                    break;
                }
            }
            if (!isWhiteCol) {
                endCol = x;
                break;
            }
        }

        // 裁剪图像
        const x = startCol;
        const y = startRow;
        const w = endCol - startCol + 1;
        const h = endRow - startRow + 1;

        console.log(`x: ${x}, y: ${y}, width: ${w}, height: ${h}`);
        image.crop({ x: x, y: y, w: w, h: h });

		const base64String = readBase64FromFile(base64FilePath);
		const formattedString = generateFormattedStringFromImage(image, base64String);
		fs.writeFileSync(outputFilePath, formattedString);
		console.log(`结果已写入到 ${outputFilePath}`);

		image.write('cropped_output.jpg'); // 输出裁剪后的图像
    })
    .catch(err => {
        console.error('处理图像时出错：', err);
    });
