const fs = require('fs');
const { Jimp } = require('jimp');

const threshold = 150; // 二值图阈值
const Judgment = 128; // 黑色判断
const inputImagePath = 'input.jpg'; // 输入图像路径
const outputFilePath = 'output.txt'; // 输出文件路径
const base64FilePath = 'merged.b64'; // Base64字符串文件路径


const generateFormattedStringFromImage = (image, base64String) => {
    let result = '';
    const { width, height } = image.bitmap;
    const base64Length = base64String.length;
    let base64Index = 0; // 追踪Base64字符的索引
    let state = 0; // 0表示上一个像素是白色，1表示上一个像素是黑色

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelColor = image.getPixelColor(x, y);
            const rgba = {
                r: (pixelColor >> 24) & 0xff,
                g: (pixelColor >> 16) & 0xff,
                b: (pixelColor >> 8) & 0xff,
                a: pixelColor & 0xff
            };

            // 判断是否为黑色（近似黑色）
            if (rgba.r < Judgment && rgba.g < Judgment && rgba.b < Judgment) {
                if (state === 0) { // 如果上一个像素是白色
                    result += '"'; // 添加引号
                    state = 1; // 更新状态为黑色
                }
                if (base64Index < base64Length) {
                    result += base64String[base64Index]; // 添加Base64字符
                    base64Index++; // 增加索引
                }
            } else {
                if (state === 1) { // 如果上一个像素是黑色
                    result += '"'; // 添加引号
                    state = 0; // 更新状态为白色
                } else {
                    result += ' '; // 添加空格
                }
            }

            // 如果Base64字符串用尽，停止处理
            if (base64Index >= base64Length) {
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
        const base64String = readBase64FromFile(base64FilePath);
        const formattedString = generateFormattedStringFromImage(image, base64String);
        fs.writeFileSync(outputFilePath, formattedString);
        console.log(`结果已写入到 ${outputFilePath}`);
    })
    .catch(err => {
        console.error('处理图像时出错：', err);
    });
