<?php
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="exam_results.csv"');

// สร้าง output stream
$output = fopen('php://output', 'w');

// ✅ เพิ่ม BOM (สำหรับ Excel อ่านภาษาไทยได้ถูกต้อง)
echo "\xEF\xBB\xBF";

// เชื่อมต่อฐานข้อมูล
$host = "localhost";
$dbname = "exam_db"; //ชื่อ database ของคุณ
$username = "root";
$password = "";
$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    die("เชื่อมต่อฐานข้อมูลล้มเหลว: " . $conn->connect_error);
}

// เขียนหัวตาราง
fputcsv($output, [
    'id', 'fullname', 'company', 'group_name', 'test_date',
    'attempt1_score', 'attempt2_score', 'attempt3_score', 'result',
    'used_time', 'accident_detail',
    'answer1','answer2','answer3','answer4','answer5',
    'answer6','answer7','answer8','answer9','answer10'
]);

// ดึงข้อมูลจากฐานข้อมูล
$result = $conn->query("SELECT * FROM step2_results"); //เปลี่ยนชื่อตารางที่คุณต้องการ
while ($row = $result->fetch_assoc()) {
    fputcsv($output, $row); // เขียนทีละแถว
}

fclose($output);
$conn->close();
?>
