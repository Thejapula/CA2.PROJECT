// PEERLEARN WEBSITE

let currentUser = localStorage.getItem("peerUser") || "";

let users = JSON.parse(localStorage.getItem("peerUsers")) || [];

let courses = JSON.parse(localStorage.getItem("peerCourses")) || [
    {
        id: 1,
        title: "HTML Basics",
        category: "Web Development",
        description: "Learn HTML tags and create webpages.",
        link: "",
        author: "Admin",
        students: [],
        completed: []
    },
    {
        id: 2,
        title: "JavaScript Basics",
        category: "Programming",
        description: "Learn variables, functions and events.",
        link: "",
        author: "Admin",
        students: [],
        completed: []
    },
    {
        id: 3,
        title: "Python Programming",
        category: "Programming",
        description: "Learn Python fundamentals.",
        link: "",
        author: "Admin",
        students: [],
        completed: []
    }
];

let reviews = JSON.parse(localStorage.getItem("peerReviews")) || [];

let notifications =
    JSON.parse(localStorage.getItem("peerNotifications")) || [];

// SAVE DATA

function saveData() {
    localStorage.setItem("peerUsers", JSON.stringify(users));
    localStorage.setItem("peerCourses", JSON.stringify(courses));
    localStorage.setItem("peerReviews", JSON.stringify(reviews));
    localStorage.setItem("peerNotifications",
        JSON.stringify(notifications));
}

// LOGIN / REGISTRATION

function login() {
    let name = document.getElementById("loginName").value.trim();
    let email = document.getElementById("loginEmail").value.trim();

    if (!name || !email) {
        alert("Please enter your name and email.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    let user = users.find(u => u.email === email);

    if (user) {
        currentUser = user.email;
        alert("Welcome back, " + user.name);
    } else {
        users.push({
            name: name,
            email: email
        });

        currentUser = email;
        alert("Registration successful!");
    }

    localStorage.setItem("peerUser", currentUser);
    saveData();

    document.getElementById("loginName").value = "";
    document.getElementById("loginEmail").value = "";

    initializeWebsite();
}

// LOGOUT

function logout() {
    localStorage.removeItem("peerUser");
    currentUser = "";

    document.querySelectorAll(".section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById("login").classList.remove("hidden");
    document.getElementById("userInfo").innerText = "";
}

// SHOW SECTIONS

function showSection(sectionName) {
    if (!currentUser) {
        alert("Please login first.");
        return;
    }

    document.querySelectorAll(".section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(sectionName).classList.remove("hidden");

    if (sectionName === "home") updateDashboard();
    if (sectionName === "courses") displayCourses();
    if (sectionName === "reviews") displayReviews();
    if (sectionName === "profile") displayProfile();
}

// ADD COURSE

function addCourse() {
    let title = document.getElementById("courseTitle").value.trim();
    let category = document.getElementById("courseCategory").value;
    let description =
        document.getElementById("courseDescription").value.trim();

    let link = document.getElementById("courseLink").value.trim();

    if (!title || !description) {
        alert("Please enter course title and description.");
        return;
    }

    if (link) {
        try {
            let url = new URL(link);
            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error();
            }
        } catch {
            alert("Please enter a valid learning resource URL.");
            return;
        }
    }

    let newCourse = {
        id: Date.now(),
        title: title,
        category: category,
        description: description,
        link: link,
        author: currentUser,
        students: [],
        completed: []
    };

    courses.push(newCourse);

    notifications.push(
        "New course added: " + title
    );

    saveData();

    document.getElementById("courseTitle").value = "";
    document.getElementById("courseDescription").value = "";
    document.getElementById("courseLink").value = "";

    alert("Course added successfully!");

    displayCourses();
    updateDashboard();
}

// DISPLAY COURSES

function displayCourses() {
    let list = document.getElementById("courseList");

    let search = document.getElementById("search").value.toLowerCase();

    let category = document.getElementById("category").value;

    list.innerHTML = "";

    let filtered = courses.filter(course => {
        let matchesSearch =
            course.title.toLowerCase().includes(search) ||
            course.description.toLowerCase().includes(search);

        let matchesCategory =
            category === "All" || course.category === category;

        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        list.innerHTML = "<p>No courses found.</p>";
    }

    filtered.forEach(course => {
        let joined = course.students.includes(currentUser);
        let completed = course.completed.includes(currentUser);

        let card = document.createElement("div");
        card.className = "course-card";

        let title = document.createElement("h3");
        title.textContent = course.title;

        let description = document.createElement("p");
        description.textContent = course.description;

        let categoryText = document.createElement("p");
        categoryText.textContent = "Category: " + course.category;

        let author = document.createElement("p");
        author.textContent = "Created by: " + course.author;

        card.append(title, description, categoryText, author);

        if (course.link) {
            let link = document.createElement("a");
            link.href = course.link;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Open Learning Resource";
            card.appendChild(link);
        }

        if (!joined) {
            let joinButton = document.createElement("button");
            joinButton.textContent = "Join Course";
            joinButton.onclick = () => joinCourse(course.id);
            card.appendChild(joinButton);
        } else if (!completed) {
            let completeButton = document.createElement("button");
            completeButton.textContent = "Mark Completed";
            completeButton.onclick = () => completeCourse(course.id);
            card.appendChild(completeButton);
        } else {
            let status = document.createElement("p");
            status.textContent = "✓ Course Completed";
            card.appendChild(status);
        }

        list.appendChild(card);
    });

    updateReviewOptions();
}

// JOIN COURSE

function joinCourse(id) {
    let course = courses.find(c => c.id === id);

    if (!course) return;

    if (!course.students.includes(currentUser)) {
        course.students.push(currentUser);

        notifications.push(
            "You joined " + course.title
        );

        saveData();

        alert("You joined the course successfully!");

        displayCourses();
        updateDashboard();
    }
}

// COMPLETE COURSE

function completeCourse(id) {
    let course = courses.find(c => c.id === id);

    if (!course) return;

    if (!course.completed.includes(currentUser)) {
        course.completed.push(currentUser);

        notifications.push(
            "Completed course: " + course.title
        );

        saveData();

        alert("Congratulations! Course completed.");

        displayCourses();
        updateDashboard();
        displayProfile();
    }
}

// DASHBOARD

function updateDashboard() {
    let joined = courses.filter(c =>
        c.students.includes(currentUser)
    );

    let completed = courses.filter(c =>
        c.completed.includes(currentUser)
    );

    document.getElementById("totalCourses").textContent =
        courses.length;

    document.getElementById("joinedCourses").textContent =
        joined.length;

    document.getElementById("completedCourses").textContent =
        completed.length;

    let progress = joined.length === 0
        ? 0
        : Math.round((completed.length / joined.length) * 100);

    document.getElementById("progressBar").value = progress;

    document.getElementById("progressText").textContent =
        progress + "% completed";

    let notificationBox =
        document.getElementById("notifications");

    notificationBox.innerHTML = "";

    let myNotifications = notifications.slice(-10).reverse();

    if (myNotifications.length === 0) {
        notificationBox.textContent = "No notifications yet.";
    }

    myNotifications.forEach(message => {
        let p = document.createElement("p");
        p.textContent = "🔔 " + message;
        notificationBox.appendChild(p);
    });
}

// REVIEW COURSE OPTIONS

function updateReviewOptions() {
    let select = document.getElementById("reviewCourse");

    select.innerHTML = "";

    let joined = courses.filter(c =>
        c.students.includes(currentUser)
    );

    joined.forEach(course => {
        let option = document.createElement("option");
        option.value = course.id;
        option.textContent = course.title;
        select.appendChild(option);
    });
}

// SUBMIT REVIEW

function submitReview() {
    let courseId =
        Number(document.getElementById("reviewCourse").value);

    let reviewText =
        document.getElementById("reviewText").value.trim();

    let rating =
        document.getElementById("rating").value;

    let course = courses.find(c => c.id === courseId);

    if (!course) {
        alert("Join a course before submitting a review.");
        return;
    }

    if (!reviewText) {
        alert("Please write your feedback.");
        return;
    }

    reviews.push({
        courseId: courseId,
        courseName: course.title,
        user: currentUser,
        feedback: reviewText,
        rating: rating
    });

    notifications.push(
        "New peer review submitted for " + course.title
    );

    saveData();

    document.getElementById("reviewText").value = "";

    alert("Your peer review was submitted!");

    displayReviews();
}

// DISPLAY REVIEWS

function displayReviews() {
    updateReviewOptions();

    let reviewList = document.getElementById("reviewList");

    reviewList.innerHTML = "";

    if (reviews.length === 0) {
        reviewList.textContent = "No reviews available.";
        return;
    }

    reviews.slice().reverse().forEach(review => {
        let div = document.createElement("div");
        div.className = "review-card";

        let heading = document.createElement("h3");
        heading.textContent = review.courseName;

        let student = document.createElement("p");
        student.textContent = "Student: " + review.user;

        let feedback = document.createElement("p");
        feedback.textContent = "Feedback: " + review.feedback;

        let rating = document.createElement("p");
        rating.textContent = "Rating: " + review.rating + "/5 ⭐";

        div.append(heading, student, feedback, rating);

        reviewList.appendChild(div);
    });
}

// PROFILE

function displayProfile() {
    let user = users.find(u => u.email === currentUser);

    if (!user) return;

    document.getElementById("profileDetails").innerHTML = "";

    let name = document.createElement("p");
    name.textContent = "Name: " + user.name;

    let email = document.createElement("p");
    email.textContent = "Email: " + user.email;

    document.getElementById("profileDetails").append(name, email);

    let myCourses = document.getElementById("myCourses");

    myCourses.innerHTML = "";

    let joined = courses.filter(c =>
        c.students.includes(currentUser)
    );

    if (joined.length === 0) {
        myCourses.textContent = "You have not joined any courses.";
    }

    joined.forEach(course => {
        let p = document.createElement("p");

        let status = course.completed.includes(currentUser)
            ? "Completed"
            : "In Progress";

        p.textContent = course.title + " - " + status;

        myCourses.appendChild(p);
    });
}

// INITIALIZE WEBSITE

function initializeWebsite() {
    if (!currentUser) {
        showLogin();
        return;
    }

    document.getElementById("login").classList.add("hidden");

    document.getElementById("userInfo").textContent =
        "Logged in as: " + currentUser;

    showSection("home");
    updateDashboard();
    displayCourses();
    displayReviews();
    displayProfile();
}

function showLogin() {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById("login").classList.remove("hidden");
}

// START WEBSITE

saveData();
initializeWebsite();