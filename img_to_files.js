const fs = require('fs');
const path = require('path');

// 定义输出文件夹路径
const outputDir = './path';

// 确保输出文件夹存在，如果不存在则创建
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// 配置要解码的文件名和对应的文件大小（以字节为单位）
const fileConfig = [
    { name: 'xxx.*', size: 1024 },
];

// 读取 merged.b64 文件
fs.readFile('output.txt', 'utf8', (err, data) => {
    if (err) {
        console.error('读取文件时出错:', err);
        return;
    }

    // 将内容按 # 分割
    const parts = data.split('#');

    // 遍历文件配置
    for (let i = 0; i < fileConfig.length; i++) {
        const { name, size } = fileConfig[i];

        // 获取 Base64 数据并清洗
        const base64Data = parts[i] ? parts[i].replace(/[ \n\r"]+/g, '') : '';

        // 只处理非空的 Base64 数据
        if (base64Data) {
            // 将 Base64 数据解码为二进制缓冲区
            const buffer = Buffer.from(base64Data, 'base64');

            // 检查解码后的数据大小是否匹配
            if (buffer.length !== size) {
                console.error(`文件 ${name} 大小不匹配: 预期 ${size} 字节, 实际 ${buffer.length} 字节.`);
                continue;
            }

            // 生成文件名，添加文件夹路径
            const fileName = path.join(outputDir, name);

            // 保存文件
            fs.writeFile(fileName, buffer, (err) => {
                if (err) {
                    console.error(`写入 ${fileName} 文件时出错:`, err);
                    return;
                }
                console.log(`${fileName} 创建成功。`);
            });
        }
    }
});
