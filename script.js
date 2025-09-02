document.addEventListener('DOMContentLoaded', () => {
    const scriptURL = 'https://script.google.com/macros/s/AKfycby0beZjcCoCzxCJfRUrVRitqhrFrjGXwnVhnmUMnGxQa1nMfrtNO3bCkKchDpQvKI3g/exec'; // <-- Make sure to update this!

    const form = document.getElementById('surveyForm');
    const progressBar = document.getElementById('progress-bar');
    const fieldsets = Array.from(form.querySelectorAll('fieldset'));
    const loader = document.getElementById('loader');
    const successMessage = document.getElementById('success-message');
    const challengesCheckboxes = form.querySelectorAll('input[name="challenges"]');
    const challengesError = document.getElementById('challenges-error');

    const totalSections = fieldsets.length;

    // --- Progress Bar Logic ---
    function updateProgress() {
        let currentSection = 0;
        fieldsets.forEach((fieldset, index) => {
            const rect = fieldset.getBoundingClientRect();
            // Check if the section is in the viewport (with a bit of offset)
            if (rect.top < window.innerHeight && rect.bottom > 100) {
                currentSection = index + 1;
            }
        });

        const progress = (currentSection / totalSections) * 100;
        progressBar.style.width = `${progress}%`;
    }

    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial call

    // --- Inline Checkbox Validation Logic ---
    function validateChallenges() {
        const checkedCount = form.querySelectorAll('input[name="challenges"]:checked').length;
        if (checkedCount > 3) {
            challengesError.classList.remove('hidden');
            return false;
        } else {
            challengesError.classList.add('hidden');
            return true;
        }
    }

    challengesCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', validateChallenges);
    });

    // --- Form Submission Logic ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!validateChallenges()) {
            // Scroll to the error message to make sure the user sees it
            challengesError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        loader.classList.remove('hidden');
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        fetch(scriptURL, { method: 'POST', body: new FormData(form)})
            .then(response => {
                if (response.ok) {
                    form.classList.add('hidden');
                    document.getElementById('progress-container').classList.add('hidden');
                    document.querySelector('.header').classList.add('hidden');
                    successMessage.classList.remove('hidden');
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert('There was an error submitting your response. Please try again.');
            })
            .finally(() => {
                loader.classList.add('hidden');
                submitButton.disabled = false;
            });
    });
});
