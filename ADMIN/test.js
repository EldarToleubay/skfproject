
document.addEventListener("DOMContentLoaded", () => {
    const documentForm = document.getElementById("document-form");
    const documentsContainer = document.getElementById("documents-container");
    const documentsSection = document.getElementById("documents-section");
    const logoutBtnDocs = document.getElementById("logout-btn-docs");

    const apiBase = "http://localhost:8080/api/v1";
    const token = localStorage.getItem("access_token");

    function toggleUI(authenticated) {
        if (authenticated) {
            documentsSection.classList.remove("hidden");
            logoutBtnDocs.classList.remove("hidden");
            loadDocuments();
        } else {
            documentsSection.classList.add("hidden");
            logoutBtnDocs.classList.add("hidden");
        }
    }

    if (token) {
        toggleUI(true);
    }

    // async function loadDocuments() {
    //     const response = await fetch(`${apiBase}/documents/all`, {
    //         headers: { Authorization: `Bearer ${token}` },
    //     });
    //
    //     if (response.ok) {
    //         const documents = await response.json();
    //         documentsContainer.innerHTML = "";
    //         documents.forEach((doc) => addDocumentToUI(doc));
    //     }
    // }
    //
    // function addDocumentToUI(doc) {
    //     const li = document.createElement("li");
    //     li.classList.add("document-item");
    //     li.innerHTML = `
    //         <h3>${doc.title}</h3>
    //         <p><b>Тип:</b> ${doc.documentType}</p>
    //         <p><b>Дата загрузки:</b> ${doc.uploadDate}</p>
    //         <div class="actions">
    //             <button class="view-btn" data-id="${doc.id}">Просмотреть</button>
    //             <button class="edit-btn" data-id="${doc.id}">Редактировать</button>
    //             <button class="delete-btn" data-id="${doc.id}">Удалить</button>
    //         </div>
    //     `;
    //
    //     li.querySelector(".view-btn").addEventListener("click", async () => {
    //         const response = await fetch(`${apiBase}/documents/${doc.id}`, {
    //             headers: { Authorization: `Bearer ${token}` },
    //         });
    //
    //         if (response.ok) {
    //             const blob = await response.blob();
    //             const url = window.URL.createObjectURL(blob);
    //             window.open(url);
    //         }
    //     });
    //
    //     li.querySelector(".edit-btn").addEventListener("click", (e) => {
    //         e.stopPropagation();
    //         editDocument(doc);
    //     });
    //
    //     li.querySelector(".delete-btn").addEventListener("click", async (e) => {
    //         e.stopPropagation();
    //         if (confirm("Удалить документ?")) {
    //             await fetch(`${apiBase}/documents/${doc.id}`, {
    //                 method: "DELETE",
    //                 headers: { Authorization: `Bearer ${token}` },
    //             });
    //             loadDocuments();
    //         }
    //     });
    //
    //     documentsContainer.appendChild(li);
    // }

    // function editDocument(doc) {
    //     document.getElementById("document-id").value = doc.id;
    //     document.getElementById("document-title").value = doc.title;
    //     document.getElementById("document-type").value = doc.documentType;
    // }

    // documentForm.addEventListener("submit", async (e) => {
    //     e.preventDefault();
    //     const id = document.getElementById("document-id").value;
    //     const title = document.getElementById("document-title").value;
    //     const documentType = document.getElementById("document-type").value;
    //     const file = document.getElementById("document-file").files[0];
    //
    //     const formData = new FormData();
    //     formData.append("title", title);
    //     formData.append("documentType", documentType);
    //     if (file) formData.append("file", file);
    //
    //     const method = id ? "PUT" : "POST";
    //     const url = id ? `${apiBase}/documents/${id}` : `${apiBase}/documents`;
    //
    //     await fetch(url, {
    //         method,
    //         headers: { Authorization: `Bearer ${token}` },
    //         body: formData,
    //     });
    //
    //     documentForm.reset();
    //     loadDocuments();
    // });

    logoutBtnDocs.addEventListener("click", () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        toggleUI(false);
    });
});