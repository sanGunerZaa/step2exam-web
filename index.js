window.addEventListener("DOMContentLoaded", () => {
  fetch("get_employees.php")
    .then(res => res.json())
    .then(data => {
      const groupSelect = document.getElementById("group");
      const employeeSelect = document.getElementById("employee");
      const companyInput = document.getElementById("company");

      // เติมกลุ่มที่ไม่ซ้ำ
      const uniqueGroups = [...new Set(data.map(e => e.group_name))];
      uniqueGroups.forEach(group => {
        const option = document.createElement("option");
        option.value = group;
        option.textContent = group;
        groupSelect.appendChild(option);
      });

      // เมื่อเลือกกลุ่ม ให้แสดงรายชื่อพนักงานเฉพาะกลุ่มนั้น
      groupSelect.addEventListener("change", () => {
        const selectedGroup = groupSelect.value;
        employeeSelect.innerHTML = `<option value="">-- เลือกชื่อ --</option>`;
        companyInput.value = "";

        const filtered = data.filter(e => e.group_name === selectedGroup);
        filtered.forEach(e => {
          const option = document.createElement("option");
          option.value = e.id;
          option.textContent = e.fullname;
          option.setAttribute("data-company", e.company);
          employeeSelect.appendChild(option);
        });
      });

      // เมื่อเลือกชื่อพนักงาน ให้แสดงสังกัดบริษัท
      employeeSelect.addEventListener("change", () => {
        const selectedOption = employeeSelect.options[employeeSelect.selectedIndex];
        const company = selectedOption ? selectedOption.getAttribute("data-company") : "";
        companyInput.value = company || "";
      });

      // ปุ่มเริ่มทำข้อสอบ
      document.getElementById("startBtn").addEventListener("click", () => {
        const group = groupSelect.value;
        const employeeId = employeeSelect.value;
        const employeeOption = employeeSelect.options[employeeSelect.selectedIndex];
        const fullname = employeeOption ? employeeOption.textContent : "";
        const company = companyInput.value;
        const testDate = document.getElementById("testDate").value;

        if (!group || !employeeId || !fullname || !company || !testDate) {
          alert("กรุณากรอกข้อมูลให้ครบถ้วน");
          return;
        }

        // เก็บข้อมูลลง sessionStorage เพื่อใช้ในหน้าข้อสอบ
        sessionStorage.setItem("group", group);
        sessionStorage.setItem("fullname", fullname);
        sessionStorage.setItem("company", company);
        sessionStorage.setItem("testDate", testDate);

        // เริ่มนับครั้งสอบใหม่
        sessionStorage.setItem("attempt", "0");

        // ไปหน้าข้อสอบ
        window.location.href = "questions.html";
      });
    })
    .catch(err => {
      console.error("โหลดข้อมูลผิดพลาด:", err);
      alert("ไม่สามารถโหลดข้อมูลพนักงานได้ กรุณาลองใหม่อีกครั้ง");
    });
});
