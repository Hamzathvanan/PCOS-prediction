document.getElementById('assessmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();  // Prevent form submission from reloading the page

    const formData = new FormData(e.target);  // Get the form data
    const data = Object.fromEntries(formData.entries());  // Convert FormData to an object

    console.log("Form Data Submitted:", data);  // Log the form data to check if it's captured correctly

    // Show loading state (You can customize this to show a spinner or progress bar)
    toggleLoading(true);

    try {
        // Send the data to the Flask backend via POST request
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)  // Convert the form data to JSON
        });

        const result = await response.json();  // Parse the response JSON

        console.log("Response from API:", result);  // Log the API response

        if (response.ok) {
            // If the response is successful, update the result display
            updateResultsDisplay(result);
            setupPDFDownload(result.pdf_report);  // Set up the PDF download
            document.getElementById('results').classList.remove('hidden');  // Show results section
        } else {
            // If there's an error, display it
            showError(result.error);
        }
    } catch (error) {
        // Catch and log any errors during the request
        console.error('Error during prediction:', error);
        showError('Failed to connect to server');
    } finally {
        // Hide the loading state
        toggleLoading(false);
    }
});

// Update the results display with prediction and recommendations
function updateResultsDisplay({ prediction, probability, recommendations }) {
    // Update the risk meter
    const riskBar = document.getElementById('riskBar');
    riskBar.style.width = `${probability * 100}%`;

    // Update the probability display
    document.getElementById('probabilityDisplay').textContent = `${(probability * 100).toFixed(1)}% Risk`;

    // Populate recommendations
    const recommendationsList = document.getElementById('recommendations');
    recommendationsList.innerHTML = recommendations
        .map(rec => `<li class="flex items-start">
                        <svg class="w-5 h-5 text-purple-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        ${rec}
                    </li>`)
        .join('');
}

// Show error message
function showError(message) {
    alert(message);
}

// Toggle the loading state (e.g., show/hide spinner)
function toggleLoading(isLoading) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = isLoading ? 'block' : 'none';
}

// Set up PDF download button
function setupPDFDownload(pdfReport) {
    const downloadButton = document.getElementById('downloadReport');
    downloadButton.onclick = () => {
        const pdfBlob = new Blob([pdfReport], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = 'PCOS_Report.pdf';
        link.click();
    };
}
