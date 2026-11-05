const API_URL = "http://127.0.0.1:8000";

// SIGN UP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const message = document.getElementById("message");

        message.textContent = "Creating your account...";
        message.style.color = "#555";

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Registration failed");
            }

            message.textContent = "Account created successfully! Redirecting to login...";
            message.style.color = "green";

            signupForm.reset();

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } catch (error) {
            message.textContent = error.message;
            message.style.color = "red";
        }
    });
}
// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const message = document.getElementById("message");

        message.textContent = "Logging in...";
        message.style.color = "#555";

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Login failed");
            }

            // Store token for this browser tab session
            sessionStorage.setItem("access_token", data.access_token);

            message.textContent = "Login successful! Redirecting...";
            message.style.color = "green";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

        } catch (error) {
            message.textContent = error.message;
            message.style.color = "red";
        }
    });
}