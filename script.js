// Declare totalQuestions and completedQuestions as global variables
var totalQuestions = 0;
var completedQuestions = 0;

// Function to generate table rows from question data
function generateTableRows(questions) {
    var rows = '';
    for (var i = 0; i < questions.length; i++) {
        var question = questions[i];
        var isChecked = getCookie(question.num.toString()) === 'completed';
        rows += '<tr>';
        rows += '<td><input type="checkbox" onclick="toggleCompletion(' + question.num + ')" ' + (isChecked ? 'checked' : '') + '></td>';
        rows += '<td>' + question.num + '</td>';
        rows += '<td><a href="' + question.link + '">' + question.title + '</a></td>';
        rows += '<td>' + question.difficulty + '</td>';
        rows += '<td>' + question.topic.join(', ') + '</td>';
        rows += '</tr>';
    }
    return rows;
}

// Function to generate table for a specific week
function generateWeekTable(week) {
    var table = document.createElement('table');
    table.innerHTML = '<tr><th>Completed</th><th>Num</th><th>Question</th><th>Difficulty</th><th>Topic</th></tr>';
    var tbody = document.createElement('tbody');
    tbody.innerHTML = generateTableRows(week.question);
    table.appendChild(tbody);
    return table;
}

// Toggle completion status and update Cookie
function toggleCompletion(num) {
    var checkbox = document.querySelector('input[type="checkbox"][onclick="toggleCompletion(' + num + ')"]');
    var row = checkbox.closest('tr');
    if (checkbox.checked) {
        row.classList.add('completed-row');
        setCookie(num.toString(), 'completed', 365);
    } else {
        row.classList.remove('completed-row');
        deleteCookie(num.toString());
    }
    updateStats(); // Update stats and chart after toggling completion status
}


// Function to set Cookie
function setCookie(name, value, days) {
    var expires = '';
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
}

// Function to get Cookie value
function getCookie(name) {
    var cookieName = name + '=';
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return '';
}

// Function to delete Cookie
function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// Get the questions container element
var questionsContainer = document.getElementById('questionsContainer');

// Helper function to format date as "MM/DD"
function formatDate(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return `${month}/${day}`;
}

// Fetch JSON data from the API
fetch('https://jsonblob.com/api/jsonBlob/1127155333993873408')
    .then(response => response.json())
    .then(data => {
        // Generate table for each week and insert into questions container
        for (var i = 0; i < data.length; i++) {
            var week = data[i];
            var weekHeading = document.createElement('h2');
            var startDate = new Date('2023/7/10');
            startDate.setDate(startDate.getDate() + 7 * (week.id - 1));
            var endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            var weekTitle = `Week${week.id} (${formatDate(startDate)} ~ ${formatDate(endDate)})`;
            weekHeading.textContent = weekTitle;
            questionsContainer.appendChild(weekHeading);
            questionsContainer.appendChild(generateWeekTable(week));
        }

        handleCheckboxChange(); // Add this line to handle checkbox changes
        updateCompletionStatus(); // Add this line to update completion status on page load
        updateStats();

        // Wait for DOM to load completely before drawing the chart
        window.onload = function () {
            drawStatsChart(totalQuestions, completedQuestions); // Redraw chart with updated stats
        };
    })
    .catch(error => console.error(error));


// Check completion status from cookies and update table
function updateCompletionStatus() {
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        var num = parseInt(checkbox.getAttribute('onclick').match(/\d+/)[0]);
        var row = checkbox.closest('tr');
        if (getCookie(num.toString()) === 'completed') {
            checkbox.checked = true;
            row.classList.add('completed-row');
        } else {
            checkbox.checked = false;
            row.classList.remove('completed-row');
        }
    });
}

// Update completion status and stats on checkbox change
function handleCheckboxChange() {
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            var num = parseInt(checkbox.getAttribute('onclick').match(/\d+/)[0]);
            var row = checkbox.closest('tr');
            if (checkbox.checked) {
                row.classList.add('completed-row');
                setCookie(num.toString(), 'completed', 365);
            } else {
                row.classList.remove('completed-row');
                deleteCookie(num.toString());
            }
            updateStats(); // Update stats and chart after checkbox change
        });
    });
}



// Update completion status and stats on checkbox change
function updateStats() {
    totalQuestions = 0; // Reset the totalQuestions count
    completedQuestions = 0; // Reset the completedQuestions count

    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        totalQuestions++;
        if (checkbox.checked) {
            completedQuestions++;
        }
    });
    console.log("updated stats", totalQuestions, completedQuestions);
    drawStatsChart(totalQuestions, completedQuestions); // Redraw chart with updated stats
}



function drawStatsChart(totalQuestions, completedQuestions) {
    var statsCanvas = document.getElementById('statsChart');
    var ctx = statsCanvas.getContext('2d');
    
    // Check if a Chart instance already exists
    if (typeof statsCanvas.chart !== 'undefined') {
        statsCanvas.chart.destroy(); // Destroy the existing Chart instance
    }
    
    var chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                data: [completedQuestions, totalQuestions - completedQuestions],
                backgroundColor: ['#28a745', '#f2f2f2'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: false,
            cutoutPercentage: 75,
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12
                }
            }
        }
    });
    
    statsCanvas.chart = chart; // Store the Chart instance on the canvas
}


