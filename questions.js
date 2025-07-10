// -----------------------
// สำหรับหน้าข้อสอบ (questions.html)
// -----------------------
window.addEventListener("DOMContentLoaded", function () {
  const attemptText = document.getElementById("examAttempt");
  const form = document.getElementById("assessmentForm");
  const attempt = parseInt(sessionStorage.getItem("attempt") || "0");

  // แสดงข้อความรอบการสอบ เช่น "คุณกำลังทำการสอบครั้งที่ 1"
  if (attemptText) {
    attemptText.innerText = `คุณกำลังทำการสอบครั้งที่ ${attempt + 1}`;
  }

  // เมื่อมีการส่งแบบฟอร์ม
  form?.addEventListener("submit", function (e) {
    e.preventDefault();

    const totalQuestions = 10;
    const pointsPerQuestion = 10;
    let score = 0;
    let fullAnswers = {};

    // ตรวจสอบคำตอบทีละข้อ
    for (let i = 1; i <= totalQuestions; i++) {
      const name = `question${i}`;
      const selected = document.querySelector(`input[name='${name}']:checked`);
      if (!selected) {
        Swal.fire({
          icon: "warning",
          title: "กรุณาทำข้อสอบให้ครบ",
          text: `คุณยังไม่ได้ตอบคำถามข้อที่ ${i}`,
          confirmButtonText: "ตกลง",
        });
        document.querySelector(`input[name='${name}']`).scrollIntoView({ behavior: "smooth" });
        return;
      }
      fullAnswers[name] = selected.value;
      if (selected.value === "OK") score += pointsPerQuestion;
    }

    const usedTime = parseFloat(document.getElementById("usedTime").value || "0");
    const accidentDetail = document.getElementById("accidentDetail").value.trim();
    const hasAccident = accidentDetail !== "";

    const nextAttempt = attempt + 1;
    sessionStorage.setItem("attempt", nextAttempt);

    // ------------------------------
    // ปรับคะแนนตามเงื่อนไข
    // ------------------------------
    let adjustedScore = score;

    // 1. ถ้าเกินเวลา 2.10 นาที หัก 30 คะแนน
    if (usedTime > 2.10) {
      adjustedScore -= 30;
    }

    // 2. ถ้าเป็นรอบ 2 หรือ 3 แล้วได้เกิน 70 → จำกัดไว้ที่ 70 ก่อน
    if (nextAttempt >= 2 && adjustedScore > 70) {
      adjustedScore = 70;
    }

    // 3. ถ้าเป็นรอบ 3 และมีอุบัติเหตุ → หักเพิ่มอีก 30 คะแนน
    if (hasAccident && nextAttempt === 3) {
      adjustedScore -= 30;
    }

    // 4. กันคะแนนติดลบ
    if (adjustedScore < 0) {
      adjustedScore = 0;
    }

    // ------------------------------
    // ตรวจสอบผ่าน/ไม่ผ่าน
    // ------------------------------
    const passed = adjustedScore >= 70;
    const result = passed ? "ผ่าน" : "ไม่ผ่าน";

    // ------------------------------
    // กำหนดวันที่สอบ
    // ------------------------------
    if (!sessionStorage.getItem("testDate")) {
      const today = new Date().toISOString().slice(0, 10);
      sessionStorage.setItem("testDate", today);
    }

    const fullname = sessionStorage.getItem("fullname") || "";
    const company = sessionStorage.getItem("company") || "";
    const group = sessionStorage.getItem("group") || "";
    const testDate = sessionStorage.getItem("testDate");

    // ------------------------------
    // เตรียมข้อมูลส่งไป backend
    // ------------------------------
    const data = {
      fullname,
      company,
      group,
      testDate,
      score1: nextAttempt === 1 ? adjustedScore : "",
      score2: nextAttempt === 2 ? adjustedScore : "",
      score3: nextAttempt === 3 ? adjustedScore : "",
      results: result,
      ...fullAnswers,
      usedTime,
      accidentDetail,
    };

    // ------------------------------
    // ส่งข้อมูลไปยัง submit.php
    // ------------------------------
    fetch("https://step2exam-web.onrender.com/submit.php", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
})
  .then(async (res) => {
    const contentType = res.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const json = await res.json();
      if (json.status === "success") {
        console.log("✅ ส่งข้อมูลสำเร็จ");
      } else {
        console.error("❌ ส่งไม่สำเร็จ:", json.message);
      }
    } else {
      const text = await res.text(); // ถ้าไม่ได้ตอบเป็น JSON
      console.error("❌ เซิร์ฟเวอร์ตอบกลับไม่ใช่ JSON:\n", text);
    }
  })
  .catch((error) => {
    console.error("🚫 เกิดข้อผิดพลาดในการเชื่อมต่อ:", error);
  });


    // ------------------------------
    // แจ้งผลลัพธ์ และ redirect ตามสถานะ
    // ------------------------------
    const remaining = 3 - nextAttempt;

    Swal.fire({
      title: "ผลการสอบ",
      text: passed
        ? `คุณได้คะแนน ${adjustedScore} (${result})`
        : `คุณได้คะแนน ${adjustedScore} (${result})\nเหลือสิทธิ์ ${remaining} ครั้ง`,
      icon: passed ? "success" : "warning",
      confirmButtonText: "ตกลง",
    }).then(() => {
      if (passed || nextAttempt >= 3) {
        sessionStorage.clear();
        if (!passed && nextAttempt >= 3) {
          Swal.fire({
            title: "สอบครบ 3 ครั้งแล้ว",
            text: "กรุณาติดต่อเจ้าหน้าที่",
            icon: "info",
            confirmButtonText: "OK",
          }).then(() => {
            window.location.href = "index.html";
          });
        } else {
          window.location.href = "index.html";
        }
      } else {
        // ยังสอบไม่ครบ 3 ครั้ง → ทำรอบต่อไป
        window.location.reload();
      }
    });
  });
});
