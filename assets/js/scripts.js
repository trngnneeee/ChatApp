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
            chatApp.innerHTML = `<div style = "text-align: center">Vui lòng đăng nhập để sử dụng!</div>`
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
                            window.location.href = "index.html";
                        });
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    })
}
// End Register
// ------------------------------------------------------------------------------
// Login
const formLogin = document.querySelector(".form-login");
if (formLogin) {
    formLogin.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = formLogin.email.value;
        const password = formLogin.password.value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                window.location.href = "index.html";
            })
            .catch((error) => {
                console.log(error);
            });
    })
}
// End Login
// ------------------------------------------------------------------------------
// Logout
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
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
    formChat.addEventListener("submit", (event) => {
        event.preventDefault();
        const content = formChat.content.value;
        const userID = auth.currentUser.uid;

        if (content && userID) {
            set(push(ref(db, `chats`)), {
                content: content,
                userID: userID
            });
            formChat.content.value = "";
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

        const newChat = document.createElement("div");
        newChat.setAttribute("chat-key", key);

        get(child(dbRef, `users/${userID}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const tmpName = snapshot.val().fullName;
                if (userID != currentUserID)
                {
                    newChat.classList.add("chat__incoming");
                    newChat.innerHTML = `
                        <div class="chat__name">
                            ${tmpName}
                        </div>
                        <div class="chat__content">
                            ${content}
                        </div>
                    `;
                }
                else
                {
                    newChat.classList.add("chat__outgoing");
                    newChat.innerHTML = `
                        <div class="chat__content">
                            ${content}
                        </div>
                        <a class="chat__button-delete">
                            <i class="fa-solid fa-trash"></i>
                        </a>
                    `;
                }
                chatBody.appendChild(newChat);
                chatBody.scrollTop = chatBody.scrollHeight;

                // Remove Message
                const removeButton = newChat.querySelector(".chat__button-delete");
                if (removeButton)
                {
                    removeButton.addEventListener("click", () => {
                        remove(ref(db, 'chats/' + key)).then(() => {
                            // chatBody.removeChild(newChat);
                            /*
                                Nếu remove ở đây thì một mình currentUser thấy còn mấy kia không thấy được, dùng hàm onChildRemove sẽ trả data về là 1 ID, dùng ID đó để xóa
                            */
                        })
                    })
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
    if (chatItem)
    {
        chatItem.remove();
    }
});
// End Check whether a message is delete
