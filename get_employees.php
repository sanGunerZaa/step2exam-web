<?php
header('Content-Type: application/json; charset=utf-8');

// ตั้งค่าฐานข้อมูล
$host = "localhost";
$dbname = "exam_db";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode([]);
    exit();
}

// เพิ่ม column company ใน SELECT
$sql = "SELECT id, fullname, group_name, company FROM employees";
$result = $conn->query($sql);

$employees = [];
while ($row = $result->fetch_assoc()) {
    $employees[] = $row;
}

echo json_encode($employees);
$conn->close();
?>
