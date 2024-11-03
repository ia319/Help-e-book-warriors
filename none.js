// 获取所有待点击的链接
const links = document.querySelectorAll('td a[href^="/detail/"]');

// 定义一个异步函数，逐个点击链接
async function clickLinksSequentially() {
    for (const link of links) {
        try {
            // 在新窗口中打开链接
            const newWindow = window.open(link.href, '_blank');

            if (!newWindow) {
                console.error('无法打开新窗口，可能被浏览器拦截');
                continue;
            }

            // 等待下载按钮出现并点击
            const success = await waitForDownloadButtonAndClick(newWindow);

            if (success) {
                console.log(`成功点击下载按钮: ${link.href}`);
                // 点击成功后等待3秒，确保下载开始
                await new Promise(resolve => setTimeout(resolve, 3000));
                console.log(`等待3秒完成，准备关闭窗口: ${link.href}`);
            } else {
                console.error(`处理链接超时: ${link.href}`);
            }

            // 关闭窗口
            newWindow.close();

            // 在处理下一个链接之前额外等待2秒
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log(`准备处理下一个链接`);
        } catch (error) {
            console.error(`处理链接时出错: ${link.href}`, error);
        }
    }
}

// 等待下载按钮出现并点击它
async function waitForDownloadButtonAndClick(newWindow) {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 20; // 最多等待10秒 (20 * 500ms)

        // 每隔500毫秒检查一次按钮是否出现
        const checkInterval = setInterval(() => {
            attempts++;

            try {
                const downloadButton = newWindow.document.querySelector('button.ant-btn .anticon-download');

                if (downloadButton) {
                    downloadButton.click();  // 触发点击下载
                    clearInterval(checkInterval);
                    resolve(true);
                    return;
                }

                // 如果达到最大尝试次数，就放弃
                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    resolve(false);
                }
            } catch (error) {
                // 处理可能的跨域错误
                console.error('访问新窗口DOM时出错:', error);
                clearInterval(checkInterval);
                resolve(false);
            }
        }, 500);
    });
}

// 启动逐个点击链接的过程
clickLinksSequentially().then(() => {
    console.log('所有链接处理完成');
}).catch(error => {
    console.error('脚本执行出错:', error);
});