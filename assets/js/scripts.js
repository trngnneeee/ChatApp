import * as Popper from 'https://cdn.jsdelivr.net/npm/@popperjs/core@^2/dist/esm/index.js'

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import { getDatabase, ref, push, set, onChildAdded, child, get, remove, onChildRemoved } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";


const firebaseConfig = {
    apiKey: "AIzaSyA-KDKAvmvqnnAJ0zqCuqKlNHPYLU2UYFA",
    authDomain: "first-database-dc421.firebaseapp.com",
    databaseURL: "https://first-database-dc421-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "first-database-dc421",
    storageBucket: "first-database-dc421.firebasestorage.app",
    messagingSenderId: "346994648038",
    appId: "1:346994648038:web:04b76452f244adf4042c27"
};

const app = initializeApp(firebaseConfig);
// Init authentication
const auth = getAuth();
const db = getDatabase();
const dbRef = ref(getDatabase());
const chatRef = ref(db, 'chats');
// ------------------------------------------------------------------------------
// Check login status
const loginButton = document.querySelector("[button-login]");
const registerButton = document.querySelector("[button-register]");
const logoutButton = document.querySelector("[button-logout]");
const chatApp = document.querySelector("[chat]");
var currentUserID = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginButton.style.display = "none";
        registerButton.style.display = "none";
        logoutButton.style.display = "block";
        chatApp.style.display = "inline";
        currentUserID = user.uid;
    } else {
        loginButton.style.display = "block";
        registerButton.style.display = "block";
        logoutButton.style.display = "none";
        if (chatApp) {
            // chatApp.innerHTML = `<div style = "text-align: center">Vui lòng đăng nhập để sử dụng!</div>`
            chatApp.innerHTML = ``
            Swal.fire({
                title: "Thông báo",
                text: "Vui lòng đăng nhập để sử dụng",
                icon: "info",
                // showCancelButton: true,
                confirmButtonColor: "rgb(28, 177, 28)",
                cancelButtonColor: "#d33",
                confirmButtonText: "Đăng nhập"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "login.html";
                }
            });
        }
    }
});
// End Check login status
// ------------------------------------------------------------------------------
// Register
const formRegister = document.querySelector(".form-register");
if (formRegister) {
    formRegister.addEventListener("submit", (event) => {
        event.preventDefault();

        const fullName = formRegister.name.value;
        const email = formRegister.email.value;
        const password = formRegister.password.value;

        if (fullName && email && password) {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    if (user) {
                        set(ref(db, `users/${user.uid}`), {
                            fullName: fullName
                        }).then(() => {
                            Swal.fire({
                                position: "center",
                                icon: "success",
                                title: "Đăng ký thành công",
                                showConfirmButton: false,
                                timer: 2000
                            }).then(() => {
                                window.location.href = "index.html";
                            });
                        });
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Vui lòng nhập đầy đủ thông tin",
            });
        }
    })
}
// End Register
// ------------------------------------------------------------------------------
// Other login (Comming soon)
const loginOption = document.querySelectorAll("[option]");
if (loginOption) {
    loginOption.forEach((item) => {
        item.addEventListener("click", () => {
            Swal.fire({
                title: "Coming soon!",
                width: 600,
                padding: "3em",
                color: "#716add",
                backdrop: `
                  rgba(0,0,123,0.4)
                  url("https://3.bp.blogspot.com/-fm0Cg5WFsy8/WF6YWJyUvuI/AAAAAAAFof0/nRsq3JLfwNwPqZA20fPDFAH8aOUFLH7nACLcB/s1600/AW356234_04.gif")
                  left top
                  no-repeat
                `,
                timer: 5000
            });
        })
    })
}
// End Other login
// Login
const formLogin = document.querySelector(".form-login");
if (formLogin) {
    formLogin.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = formLogin.email.value;
        const password = formLogin.password.value;

        if (!email || !password) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Vui lòng nhập đầy đủ thông tin",
                timer: 3000
            });
        }
        else {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Đăng nhập thành công",
                        showConfirmButton: false,
                        timer: 2000
                    }).then(() => {
                        window.location.href = "index.html";
                    });
                }).catch((error) => {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Thông tin đăng nhập sai!",
                    }).then(() => {
                        window.location.href = "login.html";
                    });
                });
        }
    })
}
// End Login
// ------------------------------------------------------------------------------
// Logout
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        signOut(auth).then(() => {
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Đăng xuất thành công",
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                window.location.href = "login.html";
            });
        }).catch((error) => {
            console.log(error);
        });
    })
}
// End Logout
// ------------------------------------------------------------------------------
// Form chat
const formChat = document.querySelector("[chat] .chat__input");
if (formChat) {
    // Preview Image
    const upload = new FileUploadWithPreview.FileUploadWithPreview('upload-images', {
        maxFileCount: 6,
        multiple: true
    });
    // End Preview Image

    formChat.addEventListener("submit", async (event) => {
        event.preventDefault();
        const content = formChat.content.value;
        const userID = auth.currentUser.uid;
        const images = upload.cachedFileArray || [];
        // Hình ảnh lưu trên Firebase là đường link của hình ảnh đó lưu trong Cloudinary

        if ((content || images.length) && userID) {
            var imagesLink = [];
            
            const url = 'https://api.cloudinary.com/v1_1/dnqinxiwo/image/upload';
            const formData = new FormData();

            for (let i = 0; i < images.length; i++) {
                let file = images[i];
                formData.append('file', file);
                formData.append('upload_preset', 'pd7np6db');
    
                await fetch(url, {
                    method: 'POST',
                    body: formData,
                })
                    .then((response) => {
                        return response.json();
                    })
                    .then((data) => {
                        imagesLink.push(data.url)
                    });
            }

            set(push(ref(db, `chats`)), {
                content: content,
                userID: userID,
                images: imagesLink
            });

            formChat.content.value = "";
            upload.resetPreviewPanel();
        }
    })
}
// End Form chat
// ------------------------------------------------------------------------------
// Display Message
const chatBody = document.querySelector(".chat__body");
if (chatBody) {
    onChildAdded(chatRef, (data) => {
        const key = data.key;
        const content = data.val().content;
        const userID = data.val().userID;
        const imageLink = data.val().images;

        const newChat = document.createElement("div");
        newChat.setAttribute("chat-key", key);

        get(child(dbRef, `users/${userID}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const tmpName = snapshot.val().fullName;

                var HTMLname = `
                    <div class="chat__name">
                        ${tmpName}
                    </div>
                `;

                var HTMLcontent = ``;
                if (content)
                {
                    var HTMLcontent = `
                        <div class="chat__content">
                            ${content}
                        </div>
                    `;
                }

                var HTMLdelete = `
                    <a class="chat__button-delete">
                        <i class="fa-solid fa-trash"></i>
                    </a>
                `

                var HTMLimage = ``;
                if (imageLink && imageLink.length > 0)
                {
                    HTMLimage += `<div class="chat__images">` 
                    imageLink.forEach((item) => {
                        HTMLimage += `
                            <img src = "${item}" />
                        `
                    });
                    HTMLimage += `</div>`;
                }
                console.log(HTMLimage);

                // if (userID != currentUserID) {
                //     newChat.classList.add("chat__incoming");
                //     newChat.innerHTML = `
                //         <div class="chat__name">
                //             ${tmpName}
                //         </div>
                //         <div class="chat__content">
                //             ${content}
                //         </div>
                //     `;
                // }
                // else {
                //     newChat.classList.add("chat__outgoing");
                //     newChat.innerHTML = `
                //         <div class="chat__content">
                //             ${content}
                //         </div>
                //         <a class="chat__button-delete">
                //             <i class="fa-solid fa-trash"></i>
                //         </a>
                //     `;
                // }

                if (userID != currentUserID)
                {
                    newChat.classList.add("chat__incoming");
                    newChat.innerHTML = `
                        <div>
                            ${HTMLname}
                            ${HTMLcontent}
                            ${HTMLimage}
                        </div>
                    `;
                }
                else{
                    newChat.classList.add("chat__outgoing");
                    newChat.innerHTML = `
                        <div>
                            ${HTMLcontent}
                            ${HTMLimage}
                            ${HTMLdelete}
                        </div>                   
                    `;
                }


                chatBody.appendChild(newChat);
                chatBody.scrollTop = chatBody.scrollHeight;

                // Remove Message
                const removeButton = newChat.querySelector(".chat__button-delete");
                if (removeButton) {
                    removeButton.addEventListener("click", () => {
                        Swal.fire({
                            title: "Xác nhận xóa?",
                            text: "Tin nhắn này sẽ bị xóa khỏi khung chat!",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Xác nhận",
                            cancelButtonText: "Hủy",
                            showCloseButton: true
                        }).then((result) => {
                            if (result.isConfirmed) {
                                remove(ref(db, 'chats/' + key)).then(() => {
                                    // chatBody.removeChild(newChat);
                                    /*
                                        Nếu remove ở đây thì một mình currentUser thấy còn mấy kia không thấy được, dùng hàm onChildRemove sẽ trả data về là 1 ID, dùng ID đó để xóa
                                    */
                                    Swal.fire({
                                        title: "Đã xóa",
                                        text: "Tin nhắn đã được xóa.",
                                        icon: "success",
                                        showCloseButton: true,
                                        timer: 3000
                                    });
                                });
                            }
                        });
                    });
                }
                // End Remove Message

            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    });
}
// End Display Message
// ------------------------------------------------------------------------------
// Check whether a message is delete
onChildRemoved(chatRef, (data) => {
    const key = data.key;
    const chatItem = chatBody.querySelector(`[chat-key="${key}"]`);
    if (chatItem) {
        chatItem.remove();
    }
});
// End Check whether a message is delete
// ------------------------------------------------------------------------------
// Add Icon Picker
const emojiPicker = document.querySelector('emoji-picker');
if (emojiPicker) {
    const button = document.querySelector(".emoji-picker__button");
    const buttonIcon = document.querySelector(".emoji-picker__button i")
    const tooltip = document.querySelector(".tooltip");
    Popper.createPopper(button, tooltip)
    emojiPicker.addEventListener('emoji-click', event => {
        const icon = event.detail.unicode;
        if (formChat) {
            formChat.content.value += icon;
        }
    });

    button.onclick = () => {
        tooltip.classList.toggle('shown')
    }

    document.addEventListener("click", (event) => {
        if (!emojiPicker.contains(event.target) && (event.target != button && event.target != buttonIcon)) {
            tooltip.classList.remove('shown');
        }
    })
}
// End Add Icon Picker

