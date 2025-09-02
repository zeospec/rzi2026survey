// 1. Replace with your Google Apps Script Web App URL
const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

document.getElementById('surveyForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Validate "top 3 challenges"
    const challenges = document.querySelectorAll('input[name="challenges"]:checked');
    if (challenges.length > 3) {
        alert('Please select up to 3 challenges.');
        return;
    }

    const form = event.target;
    const formData = new FormData(form);

    // Show a submitting message or spinner
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    fetch(scriptURL, { method: 'POST', body: formData})
        .then(response => {
            if (response.ok) {
                alert('Thank you for your submission!');
                form.reset();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .catch(error => {
            console.error('Error!', error.message);
            alert('There was an error submitting your response. Please try again.');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        });
});
