
const API = "http://127.0.0.1:8000";

// ======================================
// DASHBOARD CHARTS
// ======================================

let taskStatusChart = null;
let projectOverviewChart = null;
let taskCompletionChart = null;
let allTasks = [];
let allStories = [];
// ======================================
// BAR CHART DATA LABELS
// ======================================

const barValueLabels = {
    id: "barValueLabels",

    afterDatasetsDraw(chart) {
        const { ctx } = chart;

        ctx.save();
        ctx.font = "bold 13px DM Sans";
        ctx.fillStyle = "#17172f";
        ctx.textBaseline = "middle";

        chart.data.datasets.forEach((dataset, datasetIndex) => {

            const meta = chart.getDatasetMeta(datasetIndex);

            meta.data.forEach((bar, index) => {

                const value = dataset.data[index];
                const position = bar.getProps(["x", "y"], true);

                ctx.textAlign = chart.options.indexAxis === "y"
                    ? "left"
                    : "center";

                if (chart.options.indexAxis === "y") {
                    ctx.fillText(
                        value,
                        position.x + 10,
                        position.y
                    );
                } else {
                    ctx.fillText(
                        value,
                        position.x,
                        position.y - 12
                    );
                }
            });
        });

        ctx.restore();
    }
};

function updateDashboardCharts(projects, stories, tasks) {

    // Count task statuses
    const todoTasks = tasks.filter(
        task => task.status === "To Do"
    ).length;

    const inProgressTasks = tasks.filter(
        task => task.status === "In Progress"
    ).length;

    const completedTasks = tasks.filter(
        task => task.status === "Done"
    ).length;

    const remainingTasks = todoTasks + inProgressTasks;

    // Prepare project-wise story counts
    const projectNames = projects.map(
        project => project.name
    );

    const storyCounts = projects.map(project =>
        stories.filter(
            story => Number(story.project_id) === Number(project.id)
        ).length
    );

    // Calculate completion percentage
    const completionPercentage = tasks.length > 0
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0;


    // ----------------------------------
    // 1. TASK STATUS DOUGHNUT CHART
    // ----------------------------------

    // ----------------------------------
// 1. TASK STATUS DOUGHNUT CHART
// ----------------------------------

    const statusCanvas = document.getElementById("taskStatusChart");

    if (statusCanvas) {

        if (taskStatusChart) {
            taskStatusChart.destroy();
        }

        taskStatusChart = new Chart(statusCanvas, {
            type: "doughnut",

            data: {
                labels: ["To Do", "In Progress", "Done"],

                datasets: [{
                    data: [
                        todoTasks,
                        inProgressTasks,
                        completedTasks
                    ],
                    backgroundColor: [
                        "#f5a623",
                        "#7467e8",
                        "#28b779"
                    ],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },

            // Text displayed inside the doughnut
            plugins: [{
                id: "centerText",

                afterDraw(chart) {
                    const { ctx } = chart;
                    const meta = chart.getDatasetMeta(0);

                    if (!meta.data.length) return;

                    const centerX = meta.data[0].x;
                    const centerY = meta.data[0].y;

                    ctx.save();

                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";

                    // Completion percentage
                    ctx.font = "bold 28px Manrope";
                    ctx.fillStyle = "#17172f";

                    ctx.fillText(
                        `${completionPercentage}%`,
                        centerX,
                        centerY - 10
                    );

                    // Subtitle
                    ctx.font = "12px DM Sans";
                    ctx.fillStyle = "#85869a";

                    ctx.fillText(
                        "Complete",
                        centerX,
                        centerY + 17
                    );

                    ctx.restore();
                }
            }],

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        position: "bottom",

                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },

                cutout: "68%"
            }
        });
    }

    // ----------------------------------
    // 2. PROJECT OVERVIEW BAR CHART
    // ----------------------------------

    const projectCanvas = document.getElementById(
        "projectOverviewChart"
    );

    if (projectCanvas) {

        if (projectOverviewChart) {
            projectOverviewChart.destroy();
        }

        projectOverviewChart = new Chart(projectCanvas, {
            type: "bar",

            data: {
                labels: projectNames,

                datasets: [{
                    label: "User Stories",
                    data: storyCounts,
                    backgroundColor: "#7467e8",
                    borderRadius: 7,
                    maxBarThickness: 45
                }]
            },

            // ADD THIS LINE
            plugins: [barValueLabels],

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }


    // ----------------------------------
    // 3. TASK COMPLETION BAR CHART
    // ----------------------------------

    const completionCanvas = document.getElementById(
        "taskCompletionChart"
    );

    if (completionCanvas) {

        if (taskCompletionChart) {
            taskCompletionChart.destroy();
        }

        taskCompletionChart = new Chart(completionCanvas, {
            type: "bar",

            data: {
                labels: ["Completed", "Remaining"],

                datasets: [{
                    label: "Tasks",
                    data: [
                        completedTasks,
                        remainingTasks
                    ],
                    backgroundColor: [
                        "#28b779",
                        "#dfe1eb"
                    ],
                    borderRadius: 8,
                    maxBarThickness: 75
                }]
            },
            plugins: [barValueLabels],

            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.raw} tasks`;
                            }
                        }
                    }
                },

                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    console.log(
        "Dashboard charts updated. Completion:",
        completionPercentage + "%"
    );
}

// ======================================
// AUTHENTICATION
// ======================================

async function apiFetch(url, options = {}) {
    const token = sessionStorage.getItem("access_token");

    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        sessionStorage.removeItem("access_token");
        window.location.replace("login.html");
    }

    return response;
}


function logout() {
    sessionStorage.removeItem("access_token");
    window.location.replace("login.html");
}


async function initializeApplication() {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
        window.location.replace("login.html");
        return;
    }

    try {
        const response = await apiFetch(`${API}/auth/me`);

        if (!response.ok) {
            sessionStorage.removeItem("access_token");
            window.location.replace("login.html");
            return;
        }

        const initialSection = window.location.hash.substring(1);

        const validSections = [
            "dashboard",
            "projects",
            "stories",
            "tasks",
            "reports"
        ];

        showSection(
            validSections.includes(initialSection)
                ? initialSection
                : "dashboard"
        );

        await loadDashboard();

    } catch (error) {
        console.error("Authentication error:", error);
        alert("Unable to connect to the server. Please try again.");
    }
}


// ======================================
// SAFE TEXT HANDLING
// ======================================

function safe(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}


// ======================================
// DASHBOARD
// ======================================

async function loadDashboard() {
    try {
        const [projectsRes, storiesRes, tasksRes] =
            await Promise.all([
                apiFetch(`${API}/projects`),
                apiFetch(`${API}/stories`),
                apiFetch(`${API}/tasks`)
            ]);

        if (!projectsRes.ok || !storiesRes.ok || !tasksRes.ok) {
            throw new Error("Unable to load dashboard information.");
        }

        const projects = await projectsRes.json();
        const stories = await storiesRes.json();
        const tasks = await tasksRes.json();

        // Store latest data before displaying anything
        allTasks = tasks;
        allStories = stories;

        // Update dashboard statistics
        document.getElementById("projectCount").textContent =
            projects.length;

        document.getElementById("storyCount").textContent =
            stories.length;

        document.getElementById("taskCount").textContent =
            tasks.length;

        const completedTasks = tasks.filter(
            task => task.status === "Done"
        ).length;

        const completionRate = tasks.length > 0
            ? Math.round((completedTasks / tasks.length) * 100)
            : 0;

        document.getElementById("completionCount").textContent =
            `${completionRate}%`;

        // Display application data
        displayProjects(projects);
        displayStories(allStories);
        displayTasks(allTasks);

        // Update all dashboard charts
        updateDashboardCharts(projects, stories, tasks);

        console.log("Dashboard loaded successfully.");

    } catch (error) {
        console.error("Dashboard loading error:", error);
        showNotification(
            "Unable to load dashboard information.",
            "error"
        );
    }
}

// ======================================
// DISPLAY PROJECTS
// ======================================


function displayProjects(projects) {
    const container = document.getElementById("projectList");

    container.innerHTML = projects.map(project => `
        <div class="item project-card">

            <h3>${safe(project.name)}</h3>

            <p>${safe(project.description)}</p>

            <p>Project ID: ${Number(project.id)}</p>

            <p>Status: ${safe(project.status)}</p>

            <div class="project-actions">

                <button
                    onclick="viewProjectDetails(${Number(project.id)})">
                    View Details
                </button>

                <button
                    onclick="deleteProject(${Number(project.id)})">
                    Delete Project
                </button>

            </div>

        </div>
    `).join("") || "<p>No projects yet. Create your first project!</p>";
}



// ======================================
// DISPLAY USER STORIES
// ======================================

function displayStories(stories) {
    const container = document.getElementById("storyList");

    container.innerHTML = stories.map(story => {
        const storyTasks = allTasks.filter(
            task => Number(task.story_id) === Number(story.id)
        );

        return `
            <div class="item story-card">

                <div class="story-card-header">
                    <h3>${safe(story.title)}</h3>

                    <span class="story-priority">
                        ${safe(story.priority)}
                    </span>
                </div>

                <p>${safe(story.description || "No description provided.")}</p>

                <div class="story-details">
                    <p><strong>Story ID:</strong> ${Number(story.id)}</p>
                    <p><strong>Project ID:</strong> ${Number(story.project_id)}</p>
                    <p><strong>Status:</strong> ${safe(story.status)}</p>
                    <p><strong>Total Tasks:</strong> ${storyTasks.length}</p>
                </div>

                <button
                    class="delete-story-btn"
                    onclick="deleteStory(${Number(story.id)})">
                    Delete Story
                </button>

            </div>
        `;
    }).join("") || "<p>No user stories available.</p>";
}


// ======================================
// DISPLAY TASKS
// ======================================


function displayTasks(tasks) {
    const container = document.getElementById("taskList");

    container.innerHTML = tasks.map(task => `
        <div class="item task-card">

            <div class="task-card-header">
                <h3>${safe(task.title)}</h3>
                <span class="task-priority">
                    ${safe(task.priority)}
                </span>
            </div>

            <p>Task ID: ${Number(task.id)}</p>
            <p>Story ID: ${Number(task.story_id)}</p>

            <div class="task-status-control">
                <label for="task-status-${Number(task.id)}">
                    Task Status
                </label>

                <select
                    id="task-status-${Number(task.id)}"
                    class="task-status-select"
                    onchange="updateTask(${Number(task.id)}, this.value)">

                    <option value="To Do"
                        ${task.status === "To Do" ? "selected" : ""}>
                        To Do
                    </option>

                    <option value="In Progress"
                        ${task.status === "In Progress" ? "selected" : ""}>
                        In Progress
                    </option>

                    <option value="Done"
                        ${task.status === "Done" ? "selected" : ""}>
                        Done
                    </option>
                </select>
            </div>

            <button
                class="delete-task-btn"
                onclick="deleteTask(${Number(task.id)})">
                Delete Task
            </button>

        </div>
    `).join("") || "<p>No tasks available.</p>";
}


// ======================================
// CREATE PROJECT
// ======================================

async function createProject() {
    const name = document.getElementById("projectName").value.trim();
    const description = document.getElementById("projectDescription").value.trim();

    if (!name) {
        alert("Please enter a project name.");
        return;
    }

    try {
        const response = await apiFetch(`${API}/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                description,
                status: "Active"
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Project creation failed.");
        }

        document.getElementById("projectName").value = "";
        document.getElementById("projectDescription").value = "";

        alert("Project created successfully!");
        await loadDashboard();

    } catch (error) {
        alert(error.message);
    }
}


// ======================================
// DELETE PROJECT
// ======================================

async function deleteProject(id) {
    if (!confirm("Delete this project and its associated stories and tasks?")) {
        return;
    }

    try {
        const response = await apiFetch(`${API}/projects/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Project deletion failed.");
        }

        alert("Project deleted successfully!");
        await loadDashboard();

    } catch (error) {
        alert(error.message);
    }
}


// ======================================
// CREATE USER STORY
// ======================================

async function createStory() {
    const title = document.getElementById("storyTitle").value.trim();
    const description = document.getElementById("storyDescription").value.trim();
    const projectId = Number(document.getElementById("storyProjectId").value);
    const priority = document.getElementById("storyPriority").value;

    if (!title || !Number.isInteger(projectId) || projectId <= 0) {
        alert("Enter a story title and valid project ID.");
        return;
    }

    try {
        const response = await apiFetch(`${API}/stories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                description,
                project_id: projectId,
                priority,
                status: "To Do"
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Story creation failed.");
        }

        document.getElementById("storyTitle").value = "";
        document.getElementById("storyDescription").value = "";
        document.getElementById("storyProjectId").value = "";

        alert("User story created successfully!");
        await loadDashboard();

    } catch (error) {
        alert(error.message);
    }
}


// ======================================
// DELETE USER STORY
// ======================================

async function deleteStory(id) {
    if (!confirm("Delete this story and its associated tasks?")) {
        return;
    }

    try {
        const response = await apiFetch(`${API}/stories/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Story deletion failed.");
        }

        alert("User story deleted successfully!");
        await loadDashboard();

    } catch (error) {
        alert(error.message);
    }
}


// ======================================
// CREATE TASK
// ======================================

async function createTask() {
    const title = document.getElementById("taskTitle").value.trim();
    const storyId = Number(document.getElementById("taskStoryId").value);
    const priority = document.getElementById("taskPriority").value;

    if (!title || !Number.isInteger(storyId) || storyId <= 0) {
        alert("Enter a task title and valid user story ID.");
        return;
    }

    try {
        const response = await apiFetch(`${API}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                story_id: storyId,
                priority,
                status: "To Do"
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Task creation failed.");
        }

        document.getElementById("taskTitle").value = "";
        document.getElementById("taskStoryId").value = "";

        alert("Task created successfully!");
        await loadDashboard();

    } catch (error) {
        alert(error.message);
    }
}


// ======================================
// UPDATE TASK STATUS
// ======================================


async function updateTask(id, status) {
    const dropdown = document.getElementById(`task-status-${id}`);

    if (dropdown) {
        dropdown.disabled = true;
    }

    try {
        const response = await apiFetch(`${API}/tasks/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error("Task status update failed.");
        }

        await loadDashboard();

        showNotification(
            "Task status updated successfully!",
            "success"
        );

    } catch (error) {
        showNotification(error.message, "error");

        await loadDashboard();

    } finally {
        const updatedDropdown =
            document.getElementById(`task-status-${id}`);

        if (updatedDropdown) {
            updatedDropdown.disabled = false;
        }
    }
}



// ======================================
// DELETE TASK
// ======================================

async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    try {
        const response = await apiFetch(`${API}/tasks/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Task deletion failed.");
        }

        alert("Task deleted successfully!");
        await loadDashboard();

    } catch (error) {
        alert(error.message);
    }
}


// ======================================
// GENERATE REPORT
// ======================================

async function generateReport() {
    const result = document.getElementById("reportResult");

    result.textContent = "Generating your report...";

    try {
        const response = await apiFetch(`${API}/reports/generate`, {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("Could not start report generation.");
        }

        const job = await response.json();

        await checkReport(job.job_id);

    } catch (error) {
        result.textContent = error.message;
    }
}


// ======================================
// CHECK REPORT STATUS
// ======================================

async function checkReport(jobId) {
    const result = document.getElementById("reportResult");

    result.textContent = "Generating your report...";

    try {
        let report;

        for (let i = 0; i < 20; i++) {
            const response = await apiFetch(`${API}/reports/${jobId}`);

            if (!response.ok) {
                throw new Error("Could not retrieve report.");
            }

            report = await response.json();

            if (
                report.status === "Completed" ||
                report.status === "Failed"
            ) {
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (report.status === "Failed") {
            result.textContent =
                `Report failed: ${report.error || "Unknown error"}`;
            return;
        }

        if (report.status !== "Completed" || !report.report) {
            result.textContent =
                "Report is still processing. Please generate or check again later.";
            return;
        }

        displayReport(report);

    } catch (error) {
        result.textContent = error.message;
    }
}


// ======================================
// DISPLAY VISUAL REPORT
// ======================================

function displayReport(report) {
    const result = document.getElementById("reportResult");
    const data = report.report;

    const projects = Number(data.total_projects) || 0;
    const stories = Number(data.total_stories) || 0;
    const tasks = Number(data.total_tasks) || 0;
    const completed = Number(data.completed_tasks) || 0;
    const pending = Number(data.pending_tasks) || 0;
    const progress = Number(data.in_progress_tasks) || 0;

    const percentage = tasks > 0
        ? Math.round((completed / tasks) * 100)
        : 0;

    result.innerHTML = `
        <div class="report-header">
            <h3>Workspace Performance</h3>
            <span class="report-status">● Completed</span>
        </div>

        <div class="report-stats">

            <div class="report-stat">
                <span>Total Projects</span>
                <strong>${projects}</strong>
            </div>

            <div class="report-stat">
                <span>Total User Stories</span>
                <strong>${stories}</strong>
            </div>

            <div class="report-stat">
                <span>Total Tasks</span>
                <strong>${tasks}</strong>
            </div>

        </div>

        <div class="report-progress">

            <div class="report-progress-heading">
                <strong>Task Completion</strong>
                <span>${percentage}%</span>
            </div>

            <div class="progress-track">
                <div class="progress-fill"
                     style="width: ${percentage}%"></div>
            </div>

        </div>

        <div class="report-details">

            <div class="report-detail">
                <span>Completed</span>
                <strong>${completed}</strong>
            </div>

            <div class="report-detail">
                <span>Pending</span>
                <strong>${pending}</strong>
            </div>

            <div class="report-detail">
                <span>In Progress</span>
                <strong>${progress}</strong>
            </div>

        </div>

        <p class="report-meta">
            Report Job ID: ${Number(report.job_id)}
            | Attempts: ${Number(report.attempts)}
        </p>
    `;
}


// Attach navigation events
// ======================================
// SIDEBAR NAVIGATION
// ======================================

function showSection(sectionId) {

    // Hide all sections
    document.querySelectorAll(
        ".dashboard-section, .content-section"
    ).forEach(section => {
        section.classList.remove("active-section");
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active-section");
    }

    // Update active sidebar link
    document.querySelectorAll(".nav-link").forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
        }
    });

    // Update page heading
    const headings = {
        dashboard: "Dashboard",
        projects: "Projects",
        stories: "User Stories",
        tasks: "Tasks",
        reports: "Reports"
    };

    const breadcrumb = document.querySelector(".breadcrumb");
    const pageHeading = document.querySelector(".topbar h1");

    if (breadcrumb) {
        breadcrumb.textContent = `Workspace / ${headings[sectionId]}`;
    }

    if (pageHeading) {
        pageHeading.textContent = headings[sectionId];
    }

    // Update URL without reloading
    window.history.replaceState(null, "", `#${sectionId}`);
}


// Attach navigation events
document.querySelectorAll(".nav-link").forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        const sectionId = this.getAttribute("href").substring(1);

        showSection(sectionId);

    });

});

// ======================================
// INITIALIZE APPLICATION
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);


function showNotification(message, type = "success") {
    const existing = document.getElementById("app-notification");

    if (existing) {
        existing.remove();
    }

    const notification = document.createElement("div");

    notification.id = "app-notification";
    notification.className = `app-notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

f
function filterTasks() {
    const searchInput = document
        .getElementById("taskSearch")
        .value.toLowerCase()
        .trim();

    const selectedStatus =
        document.getElementById("taskFilter").value;

    const selectedPriority =
        document.getElementById("priorityFilter").value;

    const filteredTasks = allTasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(searchInput);

        const matchesStatus =
            selectedStatus === "All" ||
            task.status === selectedStatus;

        const matchesPriority =
            selectedPriority === "All" ||
            task.priority === selectedPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    displayTasks(filteredTasks);
}
function filterStories() {
    const searchInput = document
        .getElementById("storySearch")
        .value.toLowerCase().trim();

    const selectedPriority = document
        .getElementById("storyPriorityFilter")
        .value;

    const filteredStories = allStories.filter(story => {
        const matchesSearch = story.title
            .toLowerCase()
            .includes(searchInput);

        const matchesPriority =
            selectedPriority === "All" ||
            story.priority === selectedPriority;

        return matchesSearch && matchesPriority;
    });

    displayStories(filteredStories);
}

async function viewProjectDetails(projectId) {
    const modal = document.getElementById("projectDetailsModal");
    const content = document.getElementById("projectDetailsContent");

    modal.classList.add("active");
    content.innerHTML = "<p>Loading project details...</p>";

    try {
        const [projectResponse, storiesResponse, tasksResponse] =
            await Promise.all([
                apiFetch(`${API}/projects/${projectId}`),
                apiFetch(`${API}/stories`),
                apiFetch(`${API}/tasks`)
            ]);

        if (!projectResponse.ok ||
            !storiesResponse.ok ||
            !tasksResponse.ok) {
            throw new Error("Unable to load project details.");
        }

        const project = await projectResponse.json();
        const allStories = await storiesResponse.json();
        const allTasks = await tasksResponse.json();

        // Get stories belonging to this project
        const projectStories = allStories.filter(
            story => Number(story.project_id) === Number(projectId)
        );

        // Get tasks belonging to those stories
        const storyIds = projectStories.map(story => Number(story.id));

        const projectTasks = allTasks.filter(
            task => storyIds.includes(Number(task.story_id))
        );

        const completedTasks = projectTasks.filter(
            task => task.status === "Done"
        ).length;

        const completionRate = projectTasks.length
            ? Math.round((completedTasks / projectTasks.length) * 100)
            : 0;

        content.innerHTML = `
            <h2>${safe(project.name)}</h2>

            <p>${safe(project.description || "No description available.")}</p>

            <p><strong>Project ID:</strong> ${Number(project.id)}</p>
            <p><strong>Status:</strong> ${safe(project.status)}</p>

            <hr>

            <h3>Project Overview</h3>

            <p>Total Stories: ${projectStories.length}</p>
            <p>Total Tasks: ${projectTasks.length}</p>
            <p>Completed Tasks: ${completedTasks}</p>
            <p>Completion Rate: ${completionRate}%</p>

            <hr>

            <h3>User Stories</h3>

            ${
            projectStories.length
                ? projectStories.map(story => {
                    const storyTasks = projectTasks.filter(
                        task => Number(task.story_id) === Number(story.id)
                    );

                    return `
                        <div class="project-story-item">
                            <h4>${safe(story.title)}</h4>
                            <p>${safe(story.description || "")}</p>
                            <p>Priority: ${safe(story.priority)}</p>
                            <p>Status: ${safe(story.status)}</p>

                            <h5>Tasks</h5>

                            ${
                        storyTasks.length
                            ? storyTasks.map(task => `
                                    <p class="project-task-item">
                                        • ${safe(task.title)}
                                        — ${safe(task.status)}
                                    </p>
                                `).join("")
                            : "<p>No tasks available.</p>"
                    }
                        </div>
                    `;
                }).join("")
                : "<p>No user stories available for this project.</p>"
        }
        `;

    } catch (error) {
        content.innerHTML = `
            <p>Could not load project details.</p>
            <p>${safe(error.message)}</p>
        `;

        showNotification(error.message, "error");
    }
}


function closeProjectDetails() {
    document
        .getElementById("projectDetailsModal")
        .classList.remove("active");
}

