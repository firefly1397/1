# base64-Stringimage
base64生成字符画

## 项目结构

**`img_to_files.js`** : 将 字符画 解码为 文件 的程序代码  

**`files_to_base64.js`** : 将 文件 转换为 base64字符串 的程序代码  

**`base64_to_img.js`** : 将 base64字符串 转换为 字符画 的程序代码  

## 如何运行本程序
1. 项目目录运行 **`npm install jimp`**
2. 项目目录下创建path目录，把要编码的文件放入。
3. 运行 **`node files_to_base64.js`** 获得文件merged.b64复制命令行输出的`{ name: 'xxx.*', size: 1024 },`
4. 在项目目录下放入要生成的字符画的图片，命名成input.jpg或在base64_to_img.js修改输入文件名。
5. 运行node base64_to_img.js获得output.txt字符画文件。
6. 在img_to_files.js文件内加入复制的{ name: 'xxx.*', size: 1024 },
7. 运行 **`node img_to_files.js`** 解码output.txt获得文件。

## 关于
[https://github.com/SyrieYume/RobinPlayer](https://github.com/SyrieYume/RobinPlayer)
