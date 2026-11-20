
// ==========================================
// 1. JSONPOWERDB CONFIGURATION
// ==========================================

const connToken = "PASTE_YOUR_NEW_CONNECTION_TOKEN";

const dbName = "SCHOOL-DB";
const relName = "STUDENT-TABLE";

const jpdbBaseURL = "http://api.login2explore.com:5577";
const imlEndPoint = "/api/iml";
const irlEndPoint = "/api/irl";

let recordNumber = null;
let formMode = "initial";


// ==========================================
// 2. GET HTML ELEMENTS
// ==========================================

const rollNo = document.getElementById("rollNo");
const fullName = document.getElementById("fullName");
const studentClass = document.getElementById("studentClass");
const birthDate = document.getElementById("birthDate");
const address = document.getElementById("address");
const enrollmentDate = document.getElementById("enrollmentDate");

const saveBtn = document.getElementById("saveBtn");
const updateBtn = document.getElementById("updateBtn");
const resetBtn = document.getElementById("resetBtn");

const message = document.getElementById("message");


// ==========================================
// 3. DATABASE REQUEST FUNCTION
// ==========================================

function executeJPDB(request, endpoint) {
    try {
        jQuery.ajaxSetup({ async: false });

        const response = executeCommandAtGivenBaseUrl(
            request,
            jpdbBaseURL,
            endpoint
        );

        return typeof response === "string"
            ? JSON.parse(response)
            : response;

    } finally {
        jQuery.ajaxSetup({ async: true });
    }
}


// ==========================================
// 4. FORM CONTROL FUNCTIONS
// ==========================================

function enableFields(enabled) {
    fullName.disabled = !enabled;
    studentClass.disabled = !enabled;
    birthDate.disabled = !enabled;
    address.disabled = !enabled;
    enrollmentDate.disabled = !enabled;
}

function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
}

function initializeForm() {
    document.getElementById("studentForm").reset();

    rollNo.disabled = false;
    enableFields(false);

    saveBtn.disabled = true;
    updateBtn.disabled = true;
    resetBtn.disabled = true;

    recordNumber = null;
    formMode = "initial";

    showMessage("", "black");

    rollNo.focus();
}


// ==========================================
// 5. VALIDATE FORM DATA
// ==========================================

function validateForm() {

    if (
        rollNo.value.trim() === "" ||
        fullName.value.trim() === "" ||
        studentClass.value.trim() === "" ||
        birthDate.value === "" ||
        address.value.trim() === "" ||
        enrollmentDate.value === ""
    ) {
        alert("Please fill all fields!");
        return false;
    }

    return true;
}


// ==========================================
// 6. GET STUDENT DATA BY ROLL NUMBER
// ==========================================

rollNo.addEventListener("blur", function () {

    const roll = rollNo.value.trim();

    if (roll === "") {
        return;
    }

    const jsonData = {
        "Roll-No": roll
    };

    const getRequest = createGET_BY_KEYRequest(
        connToken,
        dbName,
        relName,
        JSON.stringify(jsonData),
        false,
        false
    );

    try {

        const response = executeJPDB(
            getRequest,
            irlEndPoint
        );

        console.log("JPDB GET response:", response);

        if (response.status === 200) {

            // Existing student found

            const student = response.data.record;

            fullName.value = student["Full-Name"] || "";
            studentClass.value = student["Class"] || "";
            birthDate.value = student["Birth-Date"] || "";
            address.value = student["Address"] || "";
            enrollmentDate.value = student["Enrollment-Date"] || "";

            recordNumber = response.data.rec_no;

            enableFields(true);

            rollNo.disabled = true;

            saveBtn.disabled = true;
            updateBtn.disabled = false;
            resetBtn.disabled = false;

            formMode = "update";

            showMessage(
                "Student record found! You can update details.",
                "green"
            );

            fullName.focus();

        } else if (response.status === 400) {

            // New student

            enableFields(true);

            saveBtn.disabled = false;
            updateBtn.disabled = true;
            resetBtn.disabled = false;

            formMode = "save";

            showMessage(
                "New student! Please enter student details.",
                "green"
            );

            fullName.focus();

        } else {

            console.error("JPDB lookup failed:", response);

            showMessage(
                response.message || "Database lookup failed.",
                "red"
            );
        }

    } catch (error) {

        console.error("Database lookup error:", error);

        showMessage(
            "Unable to connect to database. Check Console.",
            "red"
        );
    }
});


// ==========================================
// 7. SAVE NEW STUDENT
// ==========================================

saveBtn.addEventListener("click", function () {

    if (formMode !== "save") {
        return;
    }

    if (!validateForm()) {
        return;
    }

    const jsonData = {
        "Roll-No": rollNo.value.trim(),
        "Full-Name": fullName.value.trim(),
        "Class": studentClass.value.trim(),
        "Birth-Date": birthDate.value,
        "Address": address.value.trim(),
        "Enrollment-Date": enrollmentDate.value
    };

    const putRequest = createPUTRequest(
        connToken,
        jsonData,
        dbName,
        relName
    );

    try {

        const response = executeJPDB(
            putRequest,
            imlEndPoint
        );

        console.log("JPDB SAVE response:", response);

        if (response.status === 200) {

            alert("Student record saved successfully!");

            initializeForm();

        } else {

            showMessage(
                response.message || "Unable to save student.",
                "red"
            );
        }

    } catch (error) {

        console.error("Save error:", error);

        showMessage(
            "Database error while saving student.",
            "red"
        );
    }
});


// ==========================================
// 8. UPDATE EXISTING STUDENT
// ==========================================

updateBtn.addEventListener("click", function () {

    if (formMode !== "update" || recordNumber === null) {
        return;
    }

    if (!validateForm()) {
        return;
    }

    const jsonData = {
        "Full-Name": fullName.value.trim(),
        "Class": studentClass.value.trim(),
        "Birth-Date": birthDate.value,
        "Address": address.value.trim(),
        "Enrollment-Date": enrollmentDate.value
    };

    const updateRequest = createUPDATERecordRequest(
        connToken,
        jsonData,
        dbName,
        relName,
        recordNumber
    );

    try {

        // Execute the UPDATE request
        const response = executeJPDB(
            updateRequest,
            imlEndPoint
        );

        console.log("JPDB UPDATE response:", response);

        if (response.status === 200) {

            alert("Student record updated successfully!");

            initializeForm();

        } else {

            showMessage(
                response.message || "Unable to update student.",
                "red"
            );
        }

    } catch (error) {

        console.error("Update error:", error);

        showMessage(
            "Database error while updating student.",
            "red"
        );
    }
});


// ==========================================
// 9. RESET FORM
// ==========================================

resetBtn.addEventListener("click", function () {

    initializeForm();

});


// ==========================================
// 10. INITIALIZE FORM ON PAGE LOAD
// ==========================================

initializeForm();
