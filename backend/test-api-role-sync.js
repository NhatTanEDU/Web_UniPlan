// Test script để kiểm tra API cập nhật vai trò có đồng bộ hóa đúng không
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';
// Thay đổi thông tin đăng nhập và team/member ID theo dữ liệu thực tế của bạn
const EMAIL = 'admin1@gmail.com'; // Thay bằng email admin thực tế
const PASSWORD = '123456'; // Thay bằng password thực tế
const TEAM_ID = '683f3c43403cc6904ca1a395'; // Thay bằng Team ID thực tế

async function loginAndGetToken() {
  console.log('🔐 Đang đăng nhập...');
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Login failed: ${res.status} - ${errorText}`);
  }
  
  const data = await res.json();
  if (!data.token) {
    throw new Error('Login failed: ' + JSON.stringify(data));
  }
  
  console.log('✅ Đăng nhập thành công!');
  return data.token;
}

async function getTeamMembers(token) {
  console.log('📋 Lấy danh sách thành viên team...');
  const res = await fetch(`${BASE_URL}/teams/${TEAM_ID}/members`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Get members failed: ${res.status} - ${errorText}`);
  }
  
  const data = await res.json();
  return data.members || data.team?.members || [];
}

async function getTeamProjects(token) {
  console.log('📁 Lấy danh sách dự án của team...');
  const res = await fetch(`${BASE_URL}/teams/${TEAM_ID}/projects`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.log(`⚠️ Không thể lấy dự án team: ${res.status} - ${errorText}`);
    return [];
  }
  
  const data = await res.json();
  return data.projects || [];
}

async function getProjectMembers(token, projectId) {
  console.log(`👥 Lấy danh sách thành viên dự án ${projectId}...`);
  const res = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.log(`⚠️ Không thể lấy thành viên dự án: ${res.status} - ${errorText}`);
    return [];
  }
  
  const data = await res.json();
  return data || [];
}

async function updateMemberRole(token, memberId, role) {
  console.log(`🔄 Cập nhật vai trò thành viên ${memberId} thành ${role}...`);
  
  // Try the new API endpoint first
  let res = await fetch(`${BASE_URL}/teams/${TEAM_ID}/members/${memberId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  });
  
  if (!res.ok) {
    // Try the old API endpoint
    console.log('⚠️ Thử endpoint cũ...');
    res = await fetch(`${BASE_URL}/teams/members/${memberId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    });
  }
  
  const responseText = await res.text();
  console.log(`📊 Response status: ${res.status}`);
  console.log(`📄 Response body: ${responseText}`);
  
  if (!res.ok) {
    throw new Error(`Update role failed: ${res.status} - ${responseText}`);
  }
  
  return res.status >= 200 && res.status < 300;
}

async function testRoleSynchronization() {
  try {
    // 1. Đăng nhập
    const token = await loginAndGetToken();
    
    // 2. Lấy danh sách thành viên
    console.log('\n=== DANH SÁCH THÀNH VIÊN HIỆN TẠI ===');
    const members = await getTeamMembers(token);
    
    if (members.length === 0) {
      console.log('❌ Không tìm thấy thành viên nào trong team');
      return;
    }
    
    members.forEach((m, i) => {
      const name = m.user?.full_name || m.user?.name || 'Unknown';
      const email = m.user?.email || 'No email';
      const memberId = m._id;
      console.log(`${i + 1}. ${name} (${email}) - Role: ${m.role} - ID: ${memberId}`);
    });
    
    // 3. Tìm thành viên không phải Admin để test
    const nonAdminMember = members.find(m => m.role !== 'Admin');
    if (!nonAdminMember) {
      console.log('❌ Không tìm thấy thành viên nào không phải Admin để test');
      return;
    }
    
    const testMemberId = nonAdminMember._id;
    const currentRole = nonAdminMember.role;
    const memberName = nonAdminMember.user?.full_name || nonAdminMember.user?.name || 'Unknown';
    
    console.log(`\n🧪 TESTING với thành viên: ${memberName}`);
    console.log(`📋 Vai trò hiện tại: ${currentRole}`);
    
    // 4. Lấy danh sách dự án
    const projects = await getTeamProjects(token);
    console.log(`📁 Team có ${projects.length} dự án`);
    
    if (projects.length > 0) {
      const testProject = projects[0];
      console.log(`🎯 Sẽ kiểm tra dự án: ${testProject.project_name} (ID: ${testProject._id})`);
      
      // Kiểm tra vai trò hiện tại trong dự án
      const projectMembers = await getProjectMembers(token, testProject._id);
      const memberInProject = projectMembers.find(pm => {
        const pmUserId = pm.user_id?._id || pm.user_id;
        const teamUserId = nonAdminMember.user?._id || nonAdminMember.user_id;
        return pmUserId === teamUserId;
      });
      
      if (memberInProject) {
        console.log(`📋 Vai trò hiện tại trong dự án: ${memberInProject.role_in_project}`);
      } else {
        console.log('📋 Thành viên chưa có trong dự án');
      }
    }
    
    // 5. Test thay đổi vai trò
    const newRole = currentRole === 'Member' ? 'Editor' : 'Member';
    console.log(`\n🔄 ĐANG THAY ĐỔI vai trò từ "${currentRole}" thành "${newRole}"`);
    
    const updateSuccess = await updateMemberRole(token, testMemberId, newRole);
    
    if (updateSuccess) {
      console.log('✅ Cập nhật vai trò thành công!');
      
      // Đợi một chút để đồng bộ hóa hoàn tất
      console.log('⏳ Đợi 2 giây để đồng bộ hóa...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 6. Kiểm tra lại vai trò trong dự án
      if (projects.length > 0) {
        console.log('\n🔍 KIỂM TRA KẾT QUẢ ĐỒNG BỘ HÓA...');
        const testProject = projects[0];
        const updatedProjectMembers = await getProjectMembers(token, testProject._id);
        const updatedMemberInProject = updatedProjectMembers.find(pm => {
          const pmUserId = pm.user_id?._id || pm.user_id;
          const teamUserId = nonAdminMember.user?._id || nonAdminMember.user_id;
          return pmUserId === teamUserId;
        });
        
        if (updatedMemberInProject) {
          const expectedProjectRole = newRole === 'Admin' ? 'Quản trị viên' : 
                                      newRole === 'Editor' ? 'Biên tập viên' : 'Người xem';
          
          console.log(`📋 Vai trò mới trong team: ${newRole}`);
          console.log(`📋 Vai trò trong dự án: ${updatedMemberInProject.role_in_project}`);
          console.log(`📋 Vai trò mong đợi: ${expectedProjectRole}`);
          
          if (updatedMemberInProject.role_in_project === expectedProjectRole) {
            console.log('🎉 THÀNH CÔNG! Đồng bộ hóa vai trò hoạt động chính xác!');
          } else {
            console.log('❌ THẤT BẠI! Vai trò không được đồng bộ đúng');
          }
        } else {
          console.log('❌ Không tìm thấy thành viên trong dự án sau khi cập nhật');
        }
      }
      
      // 7. Khôi phục lại vai trò ban đầu
      console.log(`\n🔄 Khôi phục vai trò về "${currentRole}"...`);
      await updateMemberRole(token, testMemberId, currentRole);
      console.log('✅ Đã khôi phục vai trò ban đầu');
      
    } else {
      console.log('❌ Cập nhật vai trò thất bại');
    }
    
    console.log('\n=== TEST HOÀN TẤT ===');
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error.message);
    console.error('📊 Chi tiết lỗi:', error);
  }
}

// Chạy test
console.log('🚀 BẮT ĐẦU TEST ĐỒNG BỘ HÓA VAI TRÒ');
console.log('====================================');
testRoleSynchronization();
