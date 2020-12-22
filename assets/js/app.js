// Google to JSON API
const gsheet_id = '1z-rXlasV9g2PerZz8uiVtuCEmY192U0LyJA3oWyo9i8';
const gsheet_trans_mgr = `https://spreadsheets.google.com/feeds/list/${gsheet_id}/3/public/values?alt=json`;
const gsheet_agents = `https://spreadsheets.google.com/feeds/list/${gsheet_id}/4/public/values?alt=json`;
const gsheet_o_tasks = `https://spreadsheets.google.com/feeds/list/${gsheet_id}/5/public/values?alt=json`;
const gsheet_conversion = `https://spreadsheets.google.com/feeds/list/${gsheet_id}/8/public/values?alt=json`;

// DOM Handlers
const agentImage = document.getElementById('agentImage');
const agentPhone = document.getElementById('agentPhone');
const agentEmail = document.getElementById('agentEmail');
const otasks = document.querySelector('#otasks h3');

let agentDeals = document.getElementById('agentDeals');
let count_deals = document.getElementById('count_deals');
let count_leads = document.getElementById('count_leads');
let count_conversion = document.getElementById('count_conversion');
let agentComms = document.getElementById('agentComms');
let agentTasks = document.getElementById('agentTasks');

// Variables
const agent_name = "Frank Liu";
const current_date = new Date();
const current_year = String(current_date.getFullYear());
const condition_year = current_year;


// Functions to FETCH Google JSON Data
function getAgentDeals(callback) {
    fetch(gsheet_trans_mgr)
        .then(response => response.json())
        .then(data => callback(data, agent_name, condition_year))
        .catch(err => console.log(err));
}

function getAgents() {
    fetch(gsheet_agents)
        .then(response => response.json())
        .then(data => {
            let rows = data.feed.entry;
            let agent = rows.filter(agent => agent.gsx$name.$t === agent_name);

            agentImage.setAttribute('src', `assets/img/${agent[0].gsx$image.$t}`);
            agentImage.setAttribute('alt', agent[0].gsx$name.$t);

            agentPhone.innerHTML = agent[0].gsx$phone.$t;
            agentEmail.innerHTML = agent[0].gsx$email.$t;
        })
        .catch(err => console.log("Can't fetch/parse data: ", err));
}

function getOTasks() {
    fetch(gsheet_o_tasks)
        .then(response => response.json())
        .then(data => {
            let rows = data.feed.entry;
            let tasks = rows.filter(task => task.gsx$assignedto.$t === agent_name && task.gsx$remarks.$t === "Not Done");

            otasks.innerHTML = tasks.length > 0 ? `You have ${tasks.length} outstanding task(s)` : 'Great! All caught up.';

            agentTasks.innerHTML = '';

            tasks.forEach(task => {

                let html_o_tasks = `                
                    <div class="alert" style="text-align:left">
                        <i class="fa fa-home"></i>&nbsp;&nbsp;&nbsp;${task.gsx$attachedto.$t}<br>
                        <i class="fa fa-warning"></i>&nbsp;&nbsp;&nbsp;${task.gsx$task.$t}<br>
                        <i class="fa fa-calendar"></i>&nbsp;&nbsp;&nbsp;${task.gsx$duedate.$t}<br>
                    </div>
                `;

                agentTasks.innerHTML += html_o_tasks;
            });
        })
        .catch(err => console.log("Can't fetch/parse data: ", err));
}

function getConversion() { 
    fetch(gsheet_conversion)
        .then(response => response.json())
        .then(data => { 
            let rows = data.feed.entry;
            let agent_leads = rows.filter(row => row.gsx$agent.$t === agent_name);

            count_leads.innerHTML = agent_leads[0].gsx$totalleads.$t;
            count_conversion.innerHTML = agent_leads[0].gsx$conversion.$t;
        })
        .catch(err => console.log(err));
}



// Callable functions for Fetch functions
function process_getAgentDeals(data, agent_name, condition_year) {

    let rows = data.feed.entry;
    let deals = rows.map(row => row);

    let agent_deals = [];

    deals.forEach(deal => {
        if (deal.gsx$agent.$t === agent_name && deal.gsx$conditionyr.$t === condition_year) {
            agent_deals.push(deal);
        }
    });

    display_myDeals(agent_deals);
    count_deals.innerHTML = agent_deals.length;
}

function display_myDeals(deals) {
    agentDeals.innerHTML = '';
    agentComms.innerHTML = '';

    deals.forEach((deal, index) => {        

        let html_deals = `
            <tr>
                <td>${index + 1}</td>
                <td>${deal.gsx$address.$t}</td>
                <td>${deal.gsx$clientname.$t}</td>
                <td>${deal.gsx$classify.$t}</td>
                <td>${deal.gsx$volume.$t}</td>
                <td>${deal.gsx$grosscommission.$t}</td>
            </tr>
        `;

        let html_comms = `
            <tr>
                <td>${index + 1}</td>
                <td title="${deal.gsx$address.$t}">${deal.gsx$clientname.$t}</td>
                <td>${deal.gsx$classify.$t}</td>
                <td>${deal.gsx$leadtype.$t}</td>
                <td>${deal.gsx$tier.$t}</td>
                <td>${deal.gsx$grosscommission.$t}</td>
                <td>${deal.gsx$commsplit.$t}</td>
                <td>${deal.gsx$agentcomm.$t}</td>
                <td>${deal.gsx$paid.$t ? "YES" : "NO"}</td>
            </tr>
        `;

        agentDeals.innerHTML += html_deals;
        agentComms.innerHTML += html_comms;

    });
}


/* Firebase Authentication
 **************************/
const id01 = document.getElementById('id01');
const login_form = document.getElementById('login-form');
const loginForm = document.getElementById('loginForm');
const agentReportCard = document.getElementById('agentReportCard');
const logout = document.getElementById('logout');

// Signing in exsiting user
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const cancelbtn = document.getElementById('cancelbtn');    

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
            console.log('user is logged in');
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            
            let html_error = `
                <div id="errorAlert" class="alert warning text-center">
                    <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>${errorMessage}
                </div>
            `;
            cancelbtn.insertAdjacentHTML('beforebegin', html_error);
        });
});


logout.addEventListener('click', e => {
    auth.signOut();
});


auth.onAuthStateChanged((user) => {
    if (user) {
        // Calling fetch functions
        getAgentDeals(process_getAgentDeals);
        getAgents();
        getOTasks();
        getConversion();

        agentReportCard.style.display = "block";
        login_form.style.display = "none";
        id01.style.display = "none";
    } else {
        agentReportCard.style.display = "none";
        login_form.style.display = "block";
        console.log('user is logged out');
    }
});