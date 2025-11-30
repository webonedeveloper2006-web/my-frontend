const fixedUsers = {
    'dev1': { password: 'pass123', role: 'developer' },
    'kudale anita': { password: 'kudale@001', role: 'teacher', subjects: ['cpp'] },
    'komal pandit': { password: 'pandit@002', role: 'teacher', subjects: ['ds', 'dc'] },
    'renuka dhas': { password: 'dhas@003', role: 'teacher', subjects: ['fw'] },
    'admissionstaff1': { password: 'admission@123', role: 'admissionstaff' }
  };
  
  let students = JSON.parse(localStorage.getItem('students')) || [];
  
  const loginForm = document.getElementById('loginForm');
  
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const uname = document.getElementById('username').value.trim().toLowerCase();
    const pwd = document.getElementById('password').value.trim().toLowerCase();
  
    if (fixedUsers[uname] && fixedUsers[uname].password.toLowerCase() === pwd) {
      localStorage.setItem('currentUser', JSON.stringify({ username: uname, role: fixedUsers[uname].role }));
      showDashboard(fixedUsers[uname].role, uname);
    } else {
      const student = students.find(s => s.username.toLowerCase() === uname && s.password.toLowerCase() === pwd);
      if (student) {
        localStorage.setItem('currentUser', JSON.stringify({ username: uname, role: 'student' }));
        showDashboard('student', uname);
      } else {
        alert('Invalid username or password!');
      }
    }
  });
  
  function showDashboard(role, username) {
    document.getElementById('login-section').style.display = 'none';
  
    // Hide all dashboards first
    document.getElementById('student-dashboard').style.display = 'none';
    document.getElementById('teacher-dashboard').style.display = 'none';
    document.getElementById('developer-dashboard').style.display = 'none';
    document.getElementById('admissionstaff-dashboard').style.display = 'none';
  
    if (role === 'student') {
      document.getElementById('student-dashboard').style.display = 'block';
      renderStudentDashboard(username);
    } else if (role === 'teacher') {
      document.getElementById('teacher-dashboard').style.display = 'block';
      renderTeacherDashboard();
      setupTeacherForm();
    } else if (role === 'developer') {
      document.getElementById('developer-dashboard').style.display = 'block';
    } else if (role === 'admissionstaff') {
      document.getElementById('admissionstaff-dashboard').style.display = 'block';
      renderAdmissionStaffDashboard();
    }
  }
  
  function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
  }
  
  // Student Dashboard Rendering
  function renderStudentDashboard(username) {
    const student = students.find(s => s.username.toLowerCase() === username);
    if (!student) {
      alert('Student data not found.');
      logout();
      return;
    }
    document.getElementById('studentName').textContent = student.name;
    document.getElementById('studentRoll').textContent = student.roll;
  
    // Profile Details
    const detailsUl = document.getElementById('studentDetails');
    detailsUl.innerHTML = '';
    const details = ['username', 'roll', 'blood'];
    details.forEach(key => {
      const li = document.createElement('li');
      li.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${student[key]}`;
      detailsUl.appendChild(li);
    });
  
    // Marks
    const marks = ['ds','os','cpp','dc','fw'];
    const tbody = document.getElementById('studentMarks');
    tbody.innerHTML = '';
  
    marks.forEach(sub => {
      let mark = student[sub];
      if (mark === undefined || mark === '') mark = '-';
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${sub.toUpperCase()}</td><td>${mark}</td><td>${mark >= 40 ? 'Pass' : (mark === '-' ? '-' : 'Fail')}</td>`;
      tbody.appendChild(tr);
    });
  }
  
  // Teacher Dashboard Render
  function renderTeacherDashboard() {
    const tbody = document.getElementById('teacherTable');
    tbody.innerHTML = '';
    students.forEach((s, index) => {
      const total = ['ds','os','cpp','dc','fw'].reduce((a,b) => a + (Number(s[b]) || 0), 0);
      const countSubjects = 5; // only these 5 subjects included for total and average
      const avg = (total / countSubjects).toFixed(2);
      const status = avg >= 40 ? 'Pass' : 'Fail';
  
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${s.username}</td>
        <td>${s.roll}</td>
        <td>${s.name}</td>
        <td>${s.blood}</td>
        <td>${s.ds || '-'}</td>
        <td>${s.os || '-'}</td>
        <td>${s.cpp || '-'}</td>
        <td>${s.dc || '-'}</td>
        <td>${s.fw || '-'}</td>
        <td>${total}</td>
        <td>${avg}</td>
        <td>${status}</td>
        <td><button onclick="deleteStudent(${index})" class="btn-danger btn-small">Delete</button></td>
      `;
      tbody.appendChild(row);
    });
  }
  
  // Add/Update Student Form Handler for Teacher
  function setupTeacherForm() {
    const form = document.getElementById('studentForm');
  
    // Remove previous listeners before adding new to avoid duplicates
    form.replaceWith(form.cloneNode(true));
    const newForm = document.getElementById('studentForm');
  
    newForm.addEventListener('submit', e => {
      e.preventDefault();
  
      const newStudent = {
        username: document.getElementById('s_username').value.trim().toLowerCase(),
        password: document.getElementById('s_password').value.trim(),
        name: document.getElementById('s_name').value.trim(),
        roll: document.getElementById('s_roll').value.trim().toLowerCase(),
        blood: document.getElementById('s_blood').value.trim(),
        ds: Number(document.getElementById('s_ds').value) || 0,
        os: Number(document.getElementById('s_os').value) || 0,
        cpp: Number(document.getElementById('s_cpp').value) || 0,
        dc: Number(document.getElementById('s_dc').value) || 0,
        fw: Number(document.getElementById('s_fw').value) || 0,
      };
  
      // By default, new students start with status 'Pending'
      if(!newStudent.status) newStudent.status = 'Pending';
  
      const existingIndex = students.findIndex(s => s.username === newStudent.username);
      if (existingIndex !== -1) {
        // keep existing status
        newStudent.status = students[existingIndex].status || 'Pending';
        students[existingIndex] = newStudent;
        alert('Student updated successfully!');
      } else {
        students.push(newStudent);
        alert('Student added successfully!');
      }
      localStorage.setItem('students', JSON.stringify(students));
      renderTeacherDashboard();
      newForm.reset();
    });
  }
  
  // Delete Student (Teacher)
  function deleteStudent(index) {
    if (confirm(`Are you sure you want to delete student ${students[index].name} (${students[index].username})?`)) {
      students.splice(index, 1);
      localStorage.setItem('students', JSON.stringify(students));
      renderTeacherDashboard();
    }
  }
  
  // Clear all student data (Developer)
  function clearAllData() {
    if (confirm('Are you sure you want to clear all student data? This action cannot be undone.')) {
      students = [];
      localStorage.setItem('students', JSON.stringify(students));
      alert('All student data cleared!');
    }
  }
  
  // Developer: Search and Delete Specific Student by Username or Roll Number
  document.getElementById('deleteStudentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!query) {
      alert('Please enter a roll number or username.');
      return;
    }
  
    const studentIndex = students.findIndex(s => 
      s.username.toLowerCase() === query || s.roll.toLowerCase() === query
    );
  
    if (studentIndex === -1) {
      alert('No student found with that username or roll number.');
      return;
    }
  
    const student = students[studentIndex];
    const confirmDelete = confirm(`Are you sure you want to delete ${student.name} (${student.username})?`);
    if (confirmDelete) {
      students.splice(studentIndex, 1);
      localStorage.setItem('students', JSON.stringify(students));
      alert('Student deleted successfully!');
      location.reload(); // Refresh to reflect changes on developer dashboard
    }
  });
  
  // Admission Staff Dashboard render & approve student
  function renderAdmissionStaffDashboard() {
    const tbody = document.getElementById('admissionStaffTable');
    tbody.innerHTML = '';
  
    // Show only BCA students — all students here assumed BCA, if you want course field add filter here
    students.forEach((s, index) => {
      const status = s.status || 'Pending';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${s.username}</td>
        <td>${s.name}</td>
        <td>${s.roll}</td>
        <td>${s.blood}</td>
        <td>${status}</td>
        <td><button onclick="approveStudent(${index})" class="btn-approve" ${status === 'Approved' ? 'disabled' : ''}>Approve</button></td>
      `;
      tbody.appendChild(row);
    });
  }
  
  function approveStudent(index) {
    students[index].status = 'Approved';
    localStorage.setItem('students', JSON.stringify(students));
    alert(`Student ${students[index].name} approved!`);
    renderAdmissionStaffDashboard();
  }
  
  // On page load, check if already logged in
  window.onload = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      showDashboard(currentUser.role, currentUser.username);
    }
  };
  