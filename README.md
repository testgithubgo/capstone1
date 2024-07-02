# capstone1

document.getElementById('tracking-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const item = document.getElementById('item').value;
    const location = document.getElementById('location').value;
    const status = document.getElementById('status').value;

    addTrackingData(item, location, status);

    document.getElementById('tracking-form').reset();
});

function addTrackingData(item, location, status) {
    const table = document.getElementById('tracking-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    const itemCell = newRow.insertCell(0);
    const locationCell = newRow.insertCell(1);
    const statusCell = newRow.insertCell(2);

    itemCell.textContent = item;
    locationCell.textContent = location;
    statusCell.textContent = status;
}
