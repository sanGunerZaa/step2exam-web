<?php
// ============================
// เปิดแสดงข้อผิดพลาด (สำหรับพัฒนา)
// ============================
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ============================
// ตั้งค่า Header สำหรับ JSON และ CORS
// ============================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

// ============================
// ตั้งค่าฐานข้อมูล MySQL
// ============================
$host = "localhost";
$dbname = "exam_db";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "เชื่อมต่อฐานข้อมูลล้มเหลว"]);
    exit();
}

// ============================
// รับข้อมูล JSON จาก Client
// ============================
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(["status" => "error", "message" => "ไม่มีข้อมูลส่งมา"]);
    exit();
}

// ============================
// รับค่าพื้นฐานจากแบบสอบถาม
// ============================
$fullname = $conn->real_escape_string($data["fullname"] ?? "");
$company = $conn->real_escape_string($data["company"] ?? "");
$group = $conn->real_escape_string($data["group"] ?? "");
$testDate = $conn->real_escape_string($data["testDate"] ?? "");

$score1 = $data["score1"] ?? "";
$score2 = $data["score2"] ?? "";
$score3 = $data["score3"] ?? "";

$result = $conn->real_escape_string($data["results"] ?? "");
$usedTime = $conn->real_escape_string($data["usedTime"] ?? "");
$accidentDetail = $conn->real_escape_string($data["accidentDetail"] ?? "");

// ============================
// คำตอบข้อสอบ: question1 → answer1
// ============================
$answers = [];
for ($i = 1; $i <= 10; $i++) {
    $key = "question" . $i;
    $answers[$i] = $conn->real_escape_string($data[$key] ?? "");
}

// ============================
// ตรวจสอบว่ามีข้อมูล fullname + test_date แล้วหรือไม่
// ============================
$checkSql = "SELECT * FROM step2_results WHERE fullname = '$fullname' AND test_date = '$testDate'";
$resultCheck = $conn->query($checkSql);

// ============================
// ถ้ามีอยู่แล้ว → ทำการ UPDATE รอบที่ 2 หรือ 3
// ============================
if ($resultCheck->num_rows > 0) {
    $updateFields = "";

    if ($score2 !== "") {
        // กรณีสอบรอบ 2
        $updateFields .= "
            attempt2_score = '$score2',
            result = '$result',
            used_time = '$usedTime',
            accident_detail = '$accidentDetail',
            answer1 = '{$answers[1]}', answer2 = '{$answers[2]}', answer3 = '{$answers[3]}',
            answer4 = '{$answers[4]}', answer5 = '{$answers[5]}', answer6 = '{$answers[6]}',
            answer7 = '{$answers[7]}', answer8 = '{$answers[8]}', answer9 = '{$answers[9]}',
            answer10 = '{$answers[10]}'
        ";
    } elseif ($score3 !== "") {
        // กรณีสอบรอบ 3
        $updateFields .= "
            attempt3_score = '$score3',
            result = '$result',
            used_time = '$usedTime',
            accident_detail = '$accidentDetail',
            answer1 = '{$answers[1]}', answer2 = '{$answers[2]}', answer3 = '{$answers[3]}',
            answer4 = '{$answers[4]}', answer5 = '{$answers[5]}', answer6 = '{$answers[6]}',
            answer7 = '{$answers[7]}', answer8 = '{$answers[8]}', answer9 = '{$answers[9]}',
            answer10 = '{$answers[10]}'
        ";
    }

    $updateSql = "UPDATE step2_results SET $updateFields WHERE fullname = '$fullname' AND test_date = '$testDate'";
    
    if ($conn->query($updateSql)) {
        echo json_encode(["status" => "success", "type" => "update"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }

} else {
    // ============================
    // ยังไม่มี → INSERT รอบที่ 1
    // ============================
    $insertSql = "INSERT INTO step2_results 
    (fullname, company, group_name, test_date,
     attempt1_score, attempt2_score, attempt3_score,
     result, used_time, accident_detail,
     answer1, answer2, answer3, answer4, answer5,
     answer6, answer7, answer8, answer9, answer10)
    VALUES (
     '$fullname', '$company', '$group', '$testDate',
     '$score1', '$score2', '$score3',
     '$result', '$usedTime', '$accidentDetail',
     '{$answers[1]}', '{$answers[2]}', '{$answers[3]}', '{$answers[4]}', '{$answers[5]}',
     '{$answers[6]}', '{$answers[7]}', '{$answers[8]}', '{$answers[9]}', '{$answers[10]}'
    )";

    if ($conn->query($insertSql)) {
        echo json_encode(["status" => "success", "type" => "insert"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
}

$conn->close();
?>
