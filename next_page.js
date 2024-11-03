// 定义主函数来处理所有页面
async function processAllPages() {
    let hasNextPage = true;

    while (hasNextPage) {
        console.log('开始处理当前页面的链接');

        // 等待页面加载（确保链接已经渲染）
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 获取当前页面的所有链接
        const links = document.querySelectorAll('td a[href^="/detail/"]');

        // 处理当前页面的所有链接
        await clickLinksSequentially(links);

        // 尝试点击下一页
        hasNextPage = await clickNextPage();

        if (hasNextPage) {
            console.log('成功点击下一页，等待页面加载...');
            // 等待新页面加载
            await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
            console.log('已经是最后一页，结束处理');
        }
    }
}

// 处理链接的函数
async function clickLinksSequentially(links) {
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

        const checkInterval = setInterval(() => {
            attempts++;

            try {
                const downloadButton = newWindow.document.querySelector('button.ant-btn .anticon-download');

                if (downloadButton) {
                    downloadButton.click();
                    clearInterval(checkInterval);
                    resolve(true);
                    return;
                }

                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    resolve(false);
                }
            } catch (error) {
                console.error('访问新窗口DOM时出错:', error);
                clearInterval(checkInterval);
                resolve(false);
            }
        }, 500);
    });
}

// 点击下一页按钮的函数
async function clickNextPage() {
    try {
        // 查找下一页按钮
        const nextListItem = document.querySelector('li.ant-pagination-next[title="下一頁"]');

        if (nextListItem) {
            const button = nextListItem.querySelector('button.ant-pagination-item-link');

            if (button) {
                // 检查按钮是否被禁用
                if (!button.disabled && !nextListItem.classList.contains('ant-pagination-disabled')) {
                    button.click();
                    return true;
                } else {
                    console.log('下一页按钮已被禁用，说明已经是最后一页');
                    return false;
                }
            } else {
                console.error('下一页按钮未找到');
                return false;
            }
        } else {
            console.error('下一页的列表项未找到');
            return false;
        }
    } catch (error) {
        console.error('点击下一页时出错:', error);
        return false;
    }
}

// 启动整个处理过程
console.log('开始执行自动下载脚本...');
processAllPages().then(() => {
    console.log('所有页面处理完成！');
}).catch(error => {
    console.error('脚本执行出错:', error);
});