<?php
// เปิดแสดง error
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

// ตั้งค่าการเชื่อมต่อฐานข้อมูล
$host = "localhost";
$dbname = "exam_db";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "เชื่อมต่อฐานข้อมูลล้มเหลว"]);
    exit();
}

// รับข้อมูล JSON
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || empty($data['fullname']) || empty($data['company']) || empty($data['group_name'])) {
    echo json_encode(["status" => "error", "message" => "ข้อมูลไม่ครบ"]);
    exit();
}

// ป้องกัน SQL Injection
$fullname = $conn->real_escape_string($data["fullname"]);
$company = $conn->real_escape_string($data["company"]);
$group = $conn->real_escape_string($data["group_name"]);

// SQL บันทึกข้อมูล
$sql = "INSERT INTO employees (fullname, company, group_name)
        VALUES ('$fullname', '$company', '$group')";

if ($conn->query($sql)) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
