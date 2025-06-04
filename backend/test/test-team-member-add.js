// Script kiểm tra chức năng tìm kiếm và thêm thành viên vào nhóm
// Sử dụng node-fetch để gọi API, kiểm tra logic backend

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'Admin1@gmail.com';
const PASSWORD = '123456';
const TEAM_ID = '683a2523ddf616be1a376995'; // <-- Đã cập nhật ID nhóm muốn test

async function loginAndGetToken() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  const data = await res.json();
  if (!data.token) throw new Error('Login failed: ' + JSON.stringify(data));
  return data.token;
}

async function getPersonalMembers(token) {
  const res = await fetch(`${BASE_URL}/personal-members?page=1&limit=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.data) throw new Error('Get personal members failed: ' + JSON.stringify(data));
  return data.data;
}

async function searchTeamAddableMembers(token, teamId, search) {
  const res = await fetch(`${BASE_URL}/teams/members/search?team_id=${teamId}&search=${encodeURIComponent(search)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.users || [];
}

async function addMemberToTeam(token, teamId, userId, role = 'Member') {
  const res = await fetch(`${BASE_URL}/teams/${teamId}/members`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, role })
  });
  const data = await res.json();
  return data;
}

async function getTeamMembers(token, teamId) {
  const res = await fetch(`${BASE_URL}/teams/${teamId}/members`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.members || [];
}

(async () => {
  try {
    // 1. Đăng nhập lấy token
    const token = await loginAndGetToken();
    console.log('Đăng nhập thành công!');

    // 2. Lấy danh sách nhân viên cá nhân
    const personalMembers = await getPersonalMembers(token);
    console.log('Danh sách nhân viên cá nhân:');
    personalMembers.forEach((m, i) => {
      const name = m.member_user_id.full_name || m.member_user_id.name || '';
      const email = m.member_user_id.email || '';
      console.log(`${i + 1}. ${name} - ${email} - ID: ${m.member_user_id._id}`);
    });

    // 2.5. Lấy danh sách thành viên nhóm hiện tại
    const teamMembers = await getTeamMembers(token, TEAM_ID);
    console.log('--- Danh sách thành viên nhóm hiện tại ---');
    teamMembers.forEach((m, i) => {
      const name = m.user.full_name || m.user.name || '';
      const email = m.user.email || '';
      const id = m.user.id || m.user._id;
      console.log(`${i + 1}. ${name} - ${email} - ID: ${id}`);
    });
    console.log(`Tổng số thành viên nhóm: ${teamMembers.length}`);

    // 3. Nhập tên/email để tìm kiếm thành viên muốn thêm vào nhóm
    const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
    readline.question('Nhập tên hoặc email thành viên muốn thêm vào nhóm: ', async (searchText) => {
      // 4. Tìm kiếm thành viên có thể thêm vào nhóm
      const found = await searchTeamAddableMembers(token, TEAM_ID, searchText);
      if (!found.length) {
        console.log('Không tìm thấy thành viên phù hợp hoặc đã có trong nhóm!');
        readline.close();
        return;
      }
      // 5. Hiển thị danh sách tìm được
      found.forEach((u, i) => {
        console.log(`${i + 1}. ${u.full_name} - ${u.email} - ID: ${u._id}`);
      });
      // 6. Chọn thành viên để thêm
      readline.question('Nhập số thứ tự thành viên muốn thêm (hoặc tên/email): ', async (input) => {
        let user;
        const index = parseInt(input) - 1;
        if (!isNaN(index)) {
          if (index < 0 || index >= found.length) {
            console.log('Số thứ tự không hợp lệ!');
            readline.close();
            return;
          }
          user = found[index];
        } else {
          // Tìm theo tên hoặc email
          user = found.find(u =>
            (u.full_name && u.full_name.toLowerCase() === input.toLowerCase()) ||
            (u.email && u.email.toLowerCase() === input.toLowerCase())
          );
          if (!user) {
            console.log('Không tìm thấy thành viên khớp với tên/email đã nhập!');
            readline.close();
            return;
          }
        }
        // 7. Thêm thành viên vào nhóm
        const addRes = await addMemberToTeam(token, TEAM_ID, user._id);
        if (addRes.success === false && addRes.message && addRes.message.includes('đã có trong nhóm')) {
          console.log('Thành viên này đã có trong nhóm!');
        } else if (addRes._id || addRes.success) {
          console.log('Đã thêm thành viên vào nhóm thành công!');
        } else {
          console.log('Có lỗi khi thêm thành viên:', addRes);
        }
        // 8. Lấy lại danh sách thành viên nhóm
        const teamMembers = await getTeamMembers(token, TEAM_ID);
        console.log('Danh sách thành viên nhóm hiện tại:');
        teamMembers.forEach((m, i) => {
          const name = m.user.full_name || m.user.name || '';
          const email = m.user.email || '';
          const id = m.user.id || m.user._id;
          console.log(`${i + 1}. ${name} - ${email} - ID: ${id}`);
        });
        readline.close();
      });
    });
  } catch (err) {
    console.error('Lỗi:', err);
  }
})();
