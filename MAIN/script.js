document.addEventListener("DOMContentLoaded", () => {
    // Убеждаемся, что модалка скрыта при загрузке
    document.getElementById("pdf-viewer-container").style.display = "none";
});
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");
    const closeMenu = document.querySelector(".close-menu");
    const newsList = document.getElementById("news-list");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");
    const pageInfo = document.getElementById("page-info");
    const documentsList = document.getElementById("documents-list");
    const pdfViewerContainer = document.getElementById("pdf-viewer-container");
    const pdfCanvas = document.getElementById("pdf-canvas");
    const closePdfViewer = document.getElementById("close-pdf-viewer");

    let currentPage = 0;
    const pageSize = 10;
    let currentPdf = null;
    let currentPagePdf = 1;

    menuToggle.addEventListener("click", () => {
        sidebar.style.left = "0";
    });

    closeMenu.addEventListener("click", () => {
        sidebar.style.left = "-250px";
    });

    async function fetchNews(page) {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/news?page=${page}&size=${pageSize}`);
            if (!response.ok) throw new Error("Ошибка загрузки новостей");

            const data = await response.json();
            renderNews(data.content);
            updatePagination(data.pageable.pageNumber, data.totalPages);
        } catch (error) {
            console.error("Ошибка при загрузке новостей:", error);
        }
    }

    function renderNews(newsItems) {
        newsList.innerHTML = "";
        newsItems.forEach(news => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span class="news-date">${news.date}</span>
                <a href="${news.url}">${news.title}</a>
            `;
            newsList.appendChild(li);
        });
    }

    function updatePagination(page, totalPages) {
        currentPage = page;
        pageInfo.textContent = `Страница ${page + 1}`;
        prevPageBtn.disabled = page === 0;
        nextPageBtn.disabled = page + 1 >= totalPages;
    }

    prevPageBtn.addEventListener("click", () => {
        if (currentPage > 0) fetchNews(currentPage - 1);
    });

    nextPageBtn.addEventListener("click", () => {
        fetchNews(currentPage + 1);
    });

    fetchNews(currentPage);

    //
    // function fetchDocuments() {
    //     fetch("http://localhost:8080/api/v1/documents/all?documentType=FINANCIAL_STATEMENTS")
    //         .then(response => response.json())
    //         .then(data => {
    //             documentsList.innerHTML = ""; // Очищаем список перед добавлением новых документов
    //
    //             data.forEach(doc => {
    //                 const listItem = document.createElement("li");
    //                 const link = document.createElement("a");
    //                 link.href = "#";
    //                 link.textContent = `${doc.title} (${doc.fileName.split('.').pop().toUpperCase()})`;
    //                 link.addEventListener("click", function (event) {
    //                     event.preventDefault(); // Запрещаем переход по ссылке
    //                     toggleDocumentContent(listItem, doc.fileData);
    //                 });
    //
    //                 listItem.appendChild(link);
    //                 documentsList.appendChild(listItem);
    //             });
    //         })
    //         .catch(error => console.error("Ошибка загрузки документов:", error));
    // }
    //
    // function toggleDocumentContent(listItem, fileData) {
    //     let existingContent = listItem.querySelector(".document-content");
    //     if (existingContent) {
    //         existingContent.remove();
    //         return;
    //     }
    //
    //     const contentDiv = document.createElement("div");
    //     contentDiv.classList.add("document-content");
    //     contentDiv.style.border = "1px solid #ccc";
    //     contentDiv.style.padding = "10px";
    //     contentDiv.style.marginTop = "5px";
    //     contentDiv.style.backgroundColor = "#f9f9f9";
    //
    //     const fileType = detectFileType(fileData);
    //     if (fileType === "pdf") {
    //         contentDiv.innerHTML = `<iframe src="data:application/pdf;base64,${fileData}" width="100%" height="300px"></iframe>`;
    //     } else if (fileType === "doc" || fileType === "docx") {
    //         contentDiv.textContent = "Просмотр DOC/DOCX пока не поддерживается.";
    //     } else if (fileType === "xls" || fileType === "xlsx") {
    //         contentDiv.textContent = "Просмотр XLS/XLSX пока не поддерживается.";
    //     } else {
    //         contentDiv.textContent = "Неизвестный формат файла.";
    //     }
    //
    //     listItem.appendChild(contentDiv);
    // }
    //
    // function detectFileType(fileData) {
    //     if (fileData.startsWith("UEsFBg")) {
    //         return "zip"; // .docx и .xlsx могут быть ZIP
    //     }
    //     return "pdf"; // По умолчанию PDF
    // }
    //
    // fetchDocuments();


async function fetchDocuments() {
    try {
        const response = await fetch("http://localhost:8080/api/v1/documents/all?documentType=FOUNDING_DOCUMENTS");
        if (!response.ok) throw new Error("Ошибка загрузки документов");

        const data = await response.json();
        const documentsList = document.getElementById("documents-list");
        documentsList.innerHTML = ""; // Очищаем список перед добавлением новых документов

        data.forEach(doc => {
            const listItem = document.createElement("li");
            const link = document.createElement("a");
            link.href = "#";
            link.textContent = `${doc.title} (${doc.fileName.split('.').pop().toUpperCase()})`;
            link.addEventListener("click", function (event) {
                event.preventDefault();
                loadDocument(doc.id, doc.fileName);
            });

            listItem.appendChild(link);
            documentsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Ошибка загрузки документов:", error);
    }
}

async function loadDocument(documentId, fileName) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/documents/${documentId}`);
        if (!response.ok) throw new Error("Ошибка загрузки документа");

        const blob = await response.blob();
        const fileType = detectFileType(fileName);

        if (fileType === "pdf") {
            showPdfDocument(blob);
        } else {
            downloadFile(blob, fileName);
        }
    } catch (error) {
        console.error("Ошибка загрузки документа:", error);
    }
}

function showPdfDocument(blob) {
    const pdfViewerContainer = document.getElementById("pdf-viewer-container");

    const url = URL.createObjectURL(blob);
    const loadingTask = pdfjsLib.getDocument(url);

    loadingTask.promise.then(pdf => {
        currentPdf = pdf;
        currentPagePdf = 1;
        renderPagePdf(currentPagePdf);
        pdfViewerContainer.style.display = "flex"; // Показываем только при клике на документ
    });
}

function renderPagePdf(pageNumber) {
    if (!currentPdf) return;

    currentPdf.getPage(pageNumber).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });
        const context = pdfCanvas.getContext("2d");

        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;
        context.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height);

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        page.render(renderContext);

        document.getElementById("page-number-pdf").textContent = `${pageNumber} / ${currentPdf.numPages}`;
    });
}

// Обработчики для кнопок навигации
document.getElementById("next-page-pdf").addEventListener("click", () => {
    if (currentPdf && currentPagePdf < currentPdf.numPages) {
        currentPagePdf++;
        renderPagePdf(currentPagePdf);
    }
});

document.getElementById("prev-page-pdf").addEventListener("click", () => {
    if (currentPdf && currentPagePdf > 1) {
        currentPagePdf--;
        renderPagePdf(currentPagePdf);
    }
});

// Закрытие PDF Viewer
document.getElementById("close-pdf-viewer").addEventListener("click", () => {
    const pdfViewerContainer = document.getElementById("pdf-viewer-container");
    pdfViewerContainer.style.display = "none";
    pdfCanvas.getContext("2d").clearRect(0, 0, pdfCanvas.width, pdfCanvas.height);
    currentPdf = null;
});

function downloadFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function detectFileType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === "pdf") return "pdf";
    if (ext === "doc" || ext === "docx") return "doc";
    if (ext === "xls" || ext === "xlsx") return "xls";
    return "unknown";
}

fetchDocuments();


// Объект с переводами
// const translations = {
//     ru: {
//         about: "О нас",
//         documents: "Учредительные документы",
//         financial: "Финансовая отчетность",
//         news: "Существенные факты",
//         emission: "Эмиссионная документация",
//         contacts: "Контакты"
//     },
//     en: {
//         about: "About Us",
//         documents: "Founding Documents",
//         financial: "Financial Statements",
//         news: "Material Facts",
//         emission: "Issuance Documentation",
//         contacts: "Contacts"
//     },
//     kz: {
//         about: "Біз туралы",
//         documents: "Құрылтай құжаттары",
//         financial: "Қаржылық есептілік",
//         news: "Маңызды фактілер",
//         emission: "Эмиссиялық құжаттама",
//         contacts: "Байланыстар"
//     }
// };
//
// // Функция смены языка
// function changeLanguage(lang) {
//     document.querySelectorAll("[data-i18n]").forEach((element) => {
//         const key = element.getAttribute("data-i18n");
//         if (translations[lang] && translations[lang][key]) {
//             element.textContent = translations[lang][key];
//         }
//     });
// }
//
// // Обработчик изменения языка
// document.addEventListener("DOMContentLoaded", () => {
//     const languageSelector = document.querySelector(".language select");
//     languageSelector.addEventListener("change", (event) => {
//         const selectedLang = event.target.value;
//         localStorage.setItem("selectedLanguage", selectedLang);
//         changeLanguage(selectedLang);
//     });
//
//     // Устанавливаем сохранённый язык при загрузке страницы
//     const savedLanguage = localStorage.getItem("selectedLanguage") || "ru";
//     languageSelector.value = savedLanguage;
//     changeLanguage(savedLanguage);
// });


