const fs = require('fs');
const path = require('path');

const mergeFilesToBase64 = (directory, outputFile, separator = '#') => {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        let combinedBase64 = '';

        files.forEach(file => {
            const filePath = path.join(directory, file);
            if (fs.statSync(filePath).isFile()) {
                const fileContent = fs.readFileSync(filePath);
                const encodedString = fileContent.toString('base64');

                // 获取文件大小并输出
                const fileSize = fileContent.length; // 文件大小（字节）
                console.log(`{ name: '${file}', size: ${fileSize} },`);

                combinedBase64 += encodedString + separator; // 在每个编码后添加分隔符
            }
        });

        // 去掉最后一个分隔符
        //if (combinedBase64.length > 0) {
        //    combinedBase64 = combinedBase64.slice(0, -separator.length);
        //}

        // 写入合并后的 Base64 编码到输出文件
        fs.writeFileSync(outputFile, combinedBase64);
        console.log(`合并后的 Base64 编码写入到: ${outputFile}`);
    });
};

// 使用示例
const directoryPath = 'path'; // 替换为你的目录路径
const outputFilePath = 'merged.b64'; // 输出文件名
mergeFilesToBase64(directoryPath, outputFilePath);
