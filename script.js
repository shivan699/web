 document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email === "" || password === "") {
    alert("Please fill in all fields.");
    return;
  }

  // Basic email validation
  const emailPattern = /^[a-zA-Z0-9._%+-]+@university\.edu$/;
  if (!emailPattern.test(email)) {
    alert("Please use your university email (e.g., name@university.edu)");
    return;
  }

  // Mock authentication (replace with Firebase or backend later)
  if (email === "student@university.edu" && password === "12345") {
    alert("Login Successful 🎉");
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid email or password. Please try again.");
  }
});
function openPanel(company) {
    let content = "";

    if (company === 'tcs') {
        content = `
            <h2>TCS</h2>
            <p>Innovation. Leadership. Digital.</p>
            <button onclick="window.open('tcs.html','_blank')">Open Full Profile</button>
        `;
    }
    if (company === 'amazon') {
        content = `
            <h2>Amazon</h2>
            <p>Everything you need delivered fast.</p>
            <button onclick="window.open('amazon.html','_blank')">Open Full Profile</button>
        `;
    }
    if (company === 'flikkort') {
        content = `
            <h2>Flikkort</h2>
            <p>India's biggest marketplace.</p>
            <button onclick="window.open('flikkort.html','_blank')">Open Full Profile</button>
        `;
    }

    document.getElementById("panelContent").innerHTML = content;
    document.getElementById("slidePanel").style.right = "0";
}

function closePanel() {
    document.getElementById("slidePanel").style.right = "-100%";
}
 
 