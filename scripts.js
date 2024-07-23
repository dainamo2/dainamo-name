document.getElementById('invoiceForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => data[key] = value);

    fetch('/create-invoice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.downloadLink) {
            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = data.downloadLink;
            downloadLink.style.display = 'block';
            alert('請求書が作成されました。ダウンロードリンクが表示されます。');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
