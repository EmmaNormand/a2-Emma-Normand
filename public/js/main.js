const inputBox = document.getElementById("input-box");
const dueDateInput = document.getElementById("due-date");
const listContainer = document.getElementById("list-container");

function getDaysLeft(dueDate){
    const [month, day, year] = dueDate.split("/").map(Number);
    const due = new Date(year, month - 1, day);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function updateCountdowns(){
    listContainer.querySelectorAll("li[data-due-date]").forEach(function(li){
        const daysLeft = getDaysLeft(li.dataset.dueDate);
        const countdown = li.querySelector(".due-countdown");

        if(daysLeft < 0){
            countdown.textContent = "Overdue by " + Math.abs(daysLeft) + " day" +
                (Math.abs(daysLeft) === 1 ? "" : "s");
        } else {
            countdown.textContent = daysLeft + " day" +
                (daysLeft === 1 ? "" : "s") + " left";
        }
    });
}

function addTask(){
    const dueDate = dueDateInput.value.trim();
    const dateParts = dueDate.split("/");
    const parsedDate = /^\d{2}\/\d{2}\/\d{4}$/.test(dueDate) ?
        new Date(Number(dateParts[2]), Number(dateParts[0]) - 1, Number(dateParts[1])) : null;
    const validDate = parsedDate !== null &&
        parsedDate.getFullYear() === Number(dateParts[2]) &&
        parsedDate.getMonth() === Number(dateParts[0]) - 1 &&
        parsedDate.getDate() === Number(dateParts[1]);

    if(inputBox.value.trim() === ''){ //if they didnt write anything...
        alert("Silly! You have to write a task!"); //dont add anything!
        return;
    } else if(!validDate){
        alert("Silly! You have to enter a valid due date!");
        return;
    } else {//if they DO write something...
        let li = document.createElement("li"); //create the element to be added
        li.dataset.dueDate = dueDate;
        li.append(document.createTextNode(inputBox.value.trim()));
        const countdown = document.createElement("small");
        countdown.className = "due-countdown";
        li.append(countdown);
        listContainer.appendChild(li);
        let span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);
        updateCountdowns();
    }
    inputBox.value = ""; //reset the input box
    dueDateInput.value = "";
    saveData(); //save the data to the browser
}

inputBox.addEventListener("keydown", function(event){
    if(event.key === "Enter"){
        event.preventDefault();
        addTask();
    }
});
dueDateInput.addEventListener("keydown", function(event){
    if(event.key === "Enter"){
        event.preventDefault();
        addTask();
    }
}); 

dueDateInput.addEventListener("input", function(){
    const digits = dueDateInput.value.replace(/\D/g, "").slice(0, 8);
    const parts = [];

    if(digits.length > 0) parts.push(digits.slice(0, 2));
    if(digits.length > 2) parts.push(digits.slice(2, 4));
    if(digits.length > 4) parts.push(digits.slice(4, 8));

    dueDateInput.value = parts.join("/");
});

listContainer.addEventListener("click", function(event){
    const deleteButton = event.target.closest("span");
    if(deleteButton && listContainer.contains(deleteButton)){
        deleteButton.parentElement.remove();
        saveData();
        return;
    }

    const li = event.target.closest("li");
    if(!li){
        return;
    }

    li.classList.toggle("checked");
    saveData();
}, false);


listContainer.addEventListener("dblclick", function(e){
    if(e.target.tagName !== "LI"){
        return;
    }

    const li = e.target;
    const textNode = li.firstChild;
    const originalText = textNode ? textNode.textContent : "";
    const editBox = document.createElement("input");

    editBox.type = "text";
    editBox.className = "edit-input";
    editBox.value = originalText.trim();
    textNode.textContent = "";
    li.insertBefore(editBox, li.firstChild);
    editBox.focus();
    editBox.select();

    function finishEditing(save){
        if(save && editBox.value.trim() !== ""){
            textNode.textContent = editBox.value.trim();
        } else {
            textNode.textContent = originalText;
        }

        editBox.remove();
        saveData();
    }

    editBox.addEventListener("blur", function(){
        finishEditing(true);
    });

    editBox.addEventListener("keydown", function(event){
        if(event.key === "Enter"){
            finishEditing(true);
        } else if(event.key === "Escape"){
            finishEditing(false);
        }
    });
}, false);

function saveData(){
    localStorage.setItem("data", listContainer.innerHTML);
}

function showTask(){
    listContainer.innerHTML = localStorage.getItem("data") || "";
    updateCountdowns();
}

showTask();