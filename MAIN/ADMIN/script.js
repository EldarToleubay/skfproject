document.addEventListener("DOMContentLoaded", () => {
    const authForm = document.getElementById("auth-form");
    const newsForm = document.getElementById("news-form");
    const newsContainer = document.getElementById("news-container");
    const authSection = document.getElementById("auth-section");
    const newsSection = document.getElementById("news-section");
    const authError = document.getElementById("auth-error");
    const logoutBtn = document.getElementById("logout-btn");
    const documentForm = document.getElementById("document-form");
    const documentsContainer = document.getElementById("documents-container");
    const documentsSection = document.getElementById("documents-section");

    const apiBase = "http://localhost:8080/api/v1";
    const accessToken = localStorage.getItem("access_token");

    const quill = new Quill("#quill-editor", {
        theme: "snow",
        placeholder: "Введите текст новости...",
    });

    function toggleUI(authenticated) {
        if (authenticated) {
            authSection.classList.add("hidden");
            newsSection.classList.remove("hidden");
            documentsSection.classList.remove("hidden");
            logoutBtn.classList.remove("hidden");
            loadNews();
            loadDocuments()
        } else {
            authSection.classList.remove("hidden");
            newsSection.classList.add("hidden");
            documentsSection.classList.add("hidden");
            logoutBtn.classList.add("hidden");
        }
    }
//
    if (accessToken) {
        toggleUI(true);
    }

    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch(`${apiBase}/auth/authenticate`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password}),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("refresh_token", data.refresh_token);
                toggleUI(true);
            } else {
                authError.textContent = "Ошибка авторизации";
            }
        } catch (error) {
            authError.textContent = "Ошибка сети";
        }
    });

    async function loadDocuments() {
        const token = localStorage.getItem("access_token"); // Добавили получение токена
        if (!token) return;

        const response = await fetch(`${apiBase}/documents/all`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const documents = await response.json();
            documentsContainer.innerHTML = "";
            documents.forEach((doc) => addDocumentToUI(doc));
        }
    }


    function addDocumentToUI(doc) {
        const li = document.createElement("li");
        li.classList.add("document-item");
        li.innerHTML = `
            <h3>${doc.title}</h3>
            <p><b>Тип:</b> ${doc.documentType}</p>
            <p><b>Дата загрузки:</b> ${doc.uploadDate}</p>
            <div class="actions">
                <button class="view-btn" data-id="${doc.id}">Просмотреть</button>
                <button class="edit-btn" data-id="${doc.id}">Редактировать</button>
                <button class="delete-btn" data-id="${doc.id}">Удалить</button>
            </div>
        `;

        li.querySelector(".view-btn").addEventListener("click", async () => {
            const token = localStorage.getItem("access_token"); // Добавили получение токена
            if (!token) return;

            const response = await fetch(`${apiBase}/documents/${doc.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url);
            }
        });


        li.querySelector(".edit-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            editDocument(doc);
        });

        li.querySelector(".delete-btn").addEventListener("click", async (e) => {
            e.stopPropagation();
            if (confirm("Удалить документ?")) {
                await fetch(`${apiBase}/documents/${doc.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                await loadDocuments();
            }
        });

        documentsContainer.appendChild(li);
    }
    function editDocument(doc) {
        document.getElementById("document-id").value = doc.id;
        document.getElementById("document-title").value = doc.title;
        document.getElementById("document-type").value = doc.documentType;
    }

    documentForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("access_token");
        if (!token) {
            console.error("Нет токена авторизации, необходимо войти в систему.");
            return;
        }

        const id = document.getElementById("document-id").value;
        const title = document.getElementById("document-title").value;
        const documentType = document.getElementById("document-type").value;
        const file = document.getElementById("document-file").files[0];

        const formData = new FormData();
        formData.append("title", title);
        formData.append("documentType", documentType);
        if (file) {
            formData.append("file", file);
        } else {
            console.warn("Файл не выбран, отправляется только мета-информация.");
        }

        const method = id ? "PUT" : "POST";
        const url = id ? `${apiBase}/documents/${id}` : `${apiBase}/documents`;

        try {
            const response = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` }, // Убрал `Content-Type`, т.к. FormData сам его ставит
                body: formData,
            });

            if (response.ok) {
                console.log("Документ успешно загружен.");
                documentForm.reset();
                loadDocuments();
            } else {
                const errorText = await response.text();
                console.error("Ошибка загрузки документа:", response.status, errorText);
            }
        } catch (error) {
            console.error("Ошибка сети при загрузке документа:", error);
        }
    });



    let currentPage = 0;
    const pageSize = 10;

    async function loadNews(page = 0) {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch(`${apiBase}/news?page=${page}&size=${pageSize}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const data = await response.json();
            const news = data.content; // если бэкенд возвращает Page объект с content

            newsContainer.innerHTML = ""; // ❗Очищаем контейнер перед загрузкой новой страницы

            news.forEach((item) => addNewsToUI(item));

            currentPage = page;
            updatePaginationControls(data);
        }
    }

// Функция для создания кнопок пагинации
    function updatePaginationControls(data) {
        const paginationContainer = document.getElementById("pagination-container");
        paginationContainer.innerHTML = ""; // Очищаем старые кнопки

        const totalPages = data.totalPages;
        const currentPage = data.number; // Текущая страница (начинается с 0)

        if (totalPages > 1) {
            // Кнопка "Назад"
            if (currentPage > 0) {
                const prevBtn = document.createElement("button");
                prevBtn.textContent = "«";
                prevBtn.addEventListener("click", () => loadNews(currentPage - 1));
                paginationContainer.appendChild(prevBtn);
            }

            // Генерация списка страниц
            for (let i = 0; i < totalPages; i++) {
                const pageBtn = document.createElement("button");
                pageBtn.textContent = i + 1;
                pageBtn.classList.add("page-btn");

                if (i === currentPage) {
                    pageBtn.classList.add("active"); // Подсветка текущей страницы
                }

                pageBtn.addEventListener("click", () => loadNews(i));
                paginationContainer.appendChild(pageBtn);
            }

            // Кнопка "Вперед"
            if (currentPage < totalPages - 1) {
                const nextBtn = document.createElement("button");
                nextBtn.textContent = "»";
                nextBtn.addEventListener("click", () => loadNews(currentPage + 1));
                paginationContainer.appendChild(nextBtn);
            }
        }
    }


// Вызываем первый раз при загрузке страницы
    loadNews();


    function addNewsToUI(news) {
        const li = document.createElement("li");
        li.classList.add("news-item");
        li.innerHTML = `
            <h3>${news.title}</h3>
            <p>${news.description}</p>
            <div class="news-content">
                ${news.content}
                <p><small>${news.createdAt}</small></p>
                <div class="actions">
                    <button class="edit-btn" data-id="${news.id}">Редактировать</button>
                    <button class="delete-btn" data-id="${news.id}">Удалить</button>
                </div>
            </div>
        `;
        li.addEventListener("click", () => {
            const content = li.querySelector(".news-content");
            content.style.display = content.style.display === "block" ? "none" : "block";
        });

        li.querySelector(".edit-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            editNews(news);
        });

        li.querySelector(".delete-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            deleteNews(news.id);
        });

        newsContainer.appendChild(li);
    }

    function editNews(news) {
        document.getElementById("news-id").value = news.id;
        document.getElementById("news-title").value = news.title;
        document.getElementById("news-description").value = news.description;
        quill.root.innerHTML = news.content;
    }

    newsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("access_token");
        const id = document.getElementById("news-id").value;
        const title = document.getElementById("news-title").value;
        const description = document.getElementById("news-description").value;
        const content = quill.root.innerHTML;

        const method = id ? "PUT" : "POST";
        const url = id ? `${apiBase}/news/${id}` : `${apiBase}/news`;

        await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({title, description, content}),
        });

        newsForm.reset();
        quill.root.innerHTML = "";
        loadNews();
    });

    async function deleteNews(id) {
        const token = localStorage.getItem("access_token");
        if (confirm("Удалить новость?")) {
            await fetch(`${apiBase}/news/${id}`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            });
            loadNews();
        }
    }

    if (!logoutBtn) {
        console.error("Кнопка logout не найдена в DOM!");
        return;
    }

    logoutBtn.addEventListener("click", () => {
        console.log("Выход из системы...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        toggleUI(false);
    });

});

